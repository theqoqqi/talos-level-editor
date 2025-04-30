import UnrealEngineFile from './UnrealEngineFile.js';

export default class LevelFile {

    constructor(arrayBuffer) {
        this.file = new UnrealEngineFile(arrayBuffer);
    }

    static FOG_DENSITY_HEADER = '0C 00 00 00 46 6F 67 20 44 65 6E 73 69 74 79 00 0E 00 00 00 46 6C 6F 61 74 50 72 6F 70 65 72 74 79 00 00 00 00 00 04 00 00 00';

    static MUSIC_HEADER = '0B 00 00 00 4C 65 76 65 6C 4D 75 73 69 63 00 0C 00 00 00 53 74 72 50 72 6F 70 65 72 74 79 00 00 00 00 00';

    static ACTOR_PROPS_HEADER = '41 63 74 6F 72 50 72 6F 70 65 72 74 69 65 73 00 0E 00 00 00 41 72 72 61 79 50 72 6F 70 65 72 74 79 00 01 00 00 00 0D 00 00 00 42 79 74 65 50 72 6F 70 65 72 74 79 00 00 00 00 00';

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

    getFogDensity() {
        try {
            return this.file.readFloat(LevelFile.FOG_DENSITY_HEADER);
        } catch (e) {
            return 0;
        }
    }

    setFogDensity(value) {
        this.file.writeFloat(LevelFile.FOG_DENSITY_HEADER, value);
    }

    getMusic() {
        return this.file.readStringByHeader(LevelFile.MUSIC_HEADER, 5);
    }

    setMusic(name) {
        const config = this.#getLevelEnvironmentConfig(name);
        const offset = this.file.getValueOffset(LevelFile.MUSIC_HEADER) + 5;

        this.#replaceStringWithAdjustments(offset, config.musicName, this.#createStringAdjustOffsets([
            offset - 5,
        ]));
    }

    getTerrain() {
        const terrainPath = this.file.readString(this.getTerrainOffset(), null);

        return this.#findLevelEnvironment(config => config.terrainPath === terrainPath)?.name;
    }

    getTerrainOffset() {
        const vegetationEnumNames = this.#getLevelEnvironmentConfigsAsArray().map(cfg => cfg.terrainPath);

        return this.file.findOffsetOfAnyString(vegetationEnumNames);
    }

    setTerrain(name) {
        const config = this.#getLevelEnvironmentConfig(name);
        const offset = this.getTerrainOffset();

        this.#replaceStringWithAdjustments(offset, config.terrainPath, this.#createStringAdjustOffsets([
            offset - 6,
        ]));
    }

    getVegetation() {
        const vegetationPath = this.file.readString(this.getVegetationOffset(), null);

        return this.#findLevelEnvironment(config => config.vegetationEnumName === vegetationPath)?.name;
    }

    getVegetationOffset() {
        const vegetationEnumNames = this.#getLevelEnvironmentConfigsAsArray().map(cfg => cfg.vegetationEnumName);

        return this.file.findOffsetOfAnyString(vegetationEnumNames);
    }

    setVegetation(name) {
        const config = this.#getLevelEnvironmentConfig(name);
        const offset = this.getVegetationOffset();

        this.#replaceStringWithAdjustments(offset, config.vegetationEnumName, this.#createStringAdjustOffsets([
            offset - 5,
        ]));
    }

    getArrayBuffer() {
        return this.file.getArrayBuffer();
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
