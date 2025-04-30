import UnrealEngineFile from './UnrealEngineFile.js';
import IntegerProperty from '../properties/IntegerProperty.js';
import FloatProperty from '../properties/FloatProperty.js';
import EnumProperty from '../properties/EnumProperty.js';

export default class LevelFile {

    static FOG_DENSITY_HEADER = '0C 00 00 00 46 6F 67 20 44 65 6E 73 69 74 79 00 0E 00 00 00 46 6C 6F 61 74 50 72 6F 70 65 72 74 79 00 00 00 00 00 04 00 00 00 00';

    static MUSIC_HEADER = '0B 00 00 00 4C 65 76 65 6C 4D 75 73 69 63 00 0C 00 00 00 53 74 72 50 72 6F 70 65 72 74 79 00 00 00 00 00';

    static ACTOR_PROPS_HEADER = '41 63 74 6F 72 50 72 6F 70 65 72 74 69 65 73 00 0E 00 00 00 41 72 72 61 79 50 72 6F 70 65 72 74 79 00 01 00 00 00 0D 00 00 00 42 79 74 65 50 72 6F 70 65 72 74 79 00 00 00 00 00';

    static TILES_X_HEADER = '08 00 00 00 54 69 6C 65 73 20 58 00 0C 00 00 00 49 6E 74 50 72 6F 70 65 72 74 79 00 00 00 00 00 04 00 00 00 00';

    static TILES_Y_HEADER = '08 00 00 00 54 69 6C 65 73 20 59 00 0C 00 00 00 49 6E 74 50 72 6F 70 65 72 74 79 00 00 00 00 00 04 00 00 00 00';

    static LEVEL_ENVIRONMENT_OPTIONS = {
        None: {
            name: 'None',
            musicName: 'None',
            terrainPath: null,
            vegetationEnumName: 'E_ModelEnvironment::NewEnumerator9',
        },
        Rome: {
            name: 'Rome',
            musicName: 'Rome',
            terrainPath: '/Game/MapEditor/Materials/MI_EditorGround_Rome.MI_EditorGround_Rome',
            vegetationEnumName: 'E_ModelEnvironment::NewEnumerator1',
        },
        Medieval: {
            name: 'Medieval',
            musicName: 'Medieval',
            terrainPath: '/Game/MapEditor/Materials/MI_EditorGround_Medieval.MI_EditorGround_Medieval',
            vegetationEnumName: 'E_ModelEnvironment::NewEnumerator2',
        },
        Egypt: {
            name: 'Egypt',
            musicName: 'Egypt',
            terrainPath: '/Game/MapEditor/Materials/MI_EditorGround_Egypt.MI_EditorGround_Egypt',
            vegetationEnumName: 'E_ModelEnvironment::NewEnumerator0',
        },
        Wood: {
            name: 'Wood',
            musicName: 'Wood',
            terrainPath: '/Game/MapEditor/Materials/MI_EditorGround_Wood.MI_EditorGround_Wood',
            vegetationEnumName: 'E_ModelEnvironment::NewEnumerator4',
        }
    };

    constructor(arrayBuffer) {
        this.file = new UnrealEngineFile(arrayBuffer);

        this.width = new IntegerProperty(this.file, {
            header: LevelFile.TILES_X_HEADER,
            defaultValue: 2
        });

        this.height = new IntegerProperty(this.file, {
            header: LevelFile.TILES_Y_HEADER,
            defaultValue: 2
        });

        this.fogDensity = new FloatProperty(this.file, {
            header: LevelFile.FOG_DENSITY_HEADER,
            defaultValue: 0
        });

        this.music = new EnumProperty(this.file, {
            header: LevelFile.MUSIC_HEADER,
            shift: 5,
            reader: offset => this.file.readString(offset, 'None'),
            writer: this.#getLevelEnvironmentEnumPropertyWriter({
                configValueGetter: config => config.musicName,
                secondaryLengthOffset: 5,
            }),
        });

        this.terrain = new EnumProperty(this.file, this.#getLevelEnvironmentEnumPropertyOptions({
            configValueGetter: config => config.terrainPath,
            secondaryLengthOffset: 6,
        }));

        this.vegetation = new EnumProperty(this.file, this.#getLevelEnvironmentEnumPropertyOptions({
            configValueGetter: config => config.vegetationEnumName,
            secondaryLengthOffset: 5,
        }));
    }

    getArrayBuffer() {
        return this.file.getArrayBuffer();
    }

    #getLevelEnvironmentEnumPropertyOptions({ configValueGetter, secondaryLengthOffset }) {
        return {
            offsetGetter: () => {
                const configs = this.#getLevelEnvironmentConfigsAsArray();
                const possibleValues = configs.map(configValueGetter);

                return this.file.findOffsetOfAnyString(possibleValues);
            },
            reader: offset => {
                const value = this.file.readString(offset, null);
                const predicate = config => configValueGetter(config) === value;
                const foundConfig = this.#findLevelEnvironment(predicate);

                return foundConfig?.name;
            },
            writer: this.#getLevelEnvironmentEnumPropertyWriter({ configValueGetter, secondaryLengthOffset }),
        };
    }

    #getLevelEnvironmentEnumPropertyWriter({ configValueGetter, secondaryLengthOffset }) {
        return (offset, value) => {
            const config = this.#getLevelEnvironmentConfig(value);
            const configValue = configValueGetter(config);
            const adjustOffsets = this.#createStringAdjustOffsets([
                offset - secondaryLengthOffset,
            ]);

            this.#replaceStringWithAdjustments(offset, configValue, adjustOffsets);
        };
    }

    #getLevelEnvironmentConfigsAsArray() {
        return Object.values(LevelFile.LEVEL_ENVIRONMENT_OPTIONS);
    }

    #findLevelEnvironment(callback) {
        for (const config of this.#getLevelEnvironmentConfigsAsArray()) {
            if (callback(config)) {
                return config;
            }
        }
    }

    #getLevelEnvironmentConfig(name, key = null) {
        const config = LevelFile.LEVEL_ENVIRONMENT_OPTIONS[name];

        if (!config) {
            throw new Error('Unknown level environment: ' + name);
        }

        if (key) {
            return config[key];
        }

        return config;
    }

    #replaceStringWithAdjustments(offset, replacement, adjustOffsets) {
        const currentString = this.file.readString(offset);
        const delta = replacement.length - currentString.length;

        this.file.replaceString(offset, replacement);

        adjustOffsets.forEach(pos => this.file.modifyInteger(pos, delta));
    }

    #createStringAdjustOffsets(additionalAdjustments = []) {
        return [
            0x55,
            this.file.getValueOffset(LevelFile.ACTOR_PROPS_HEADER),
            this.file.getValueOffset(LevelFile.ACTOR_PROPS_HEADER) + 5,
            ...additionalAdjustments,
        ];
    }
}
