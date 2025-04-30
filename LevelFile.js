import UnrealEngineFile from './UnrealEngineFile.js';

export default class LevelFile {
    constructor(arrayBuffer) {
        this.file = new UnrealEngineFile(arrayBuffer);
    }

    static HDR_FOG = '0C 00 00 00 46 6F 67 20 44 65 6E 73 69 74 79 00 0E 00 00 00 46 6C 6F 61 74 50 72 6F 70 65 72 74 79 00 00 00 00 00 04 00 00 00';

    static HDR_MUSIC = '0B 00 00 00 4C 65 76 65 6C 4D 75 73 69 63 00 0C 00 00 00 53 74 72 50 72 6F 70 65 72 74 79 00 00 00 00 00';

    static HDR_ACTOR_PROPS = '41 63 74 6F 72 50 72 6F 70 65 72 74 69 65 73 00 0E 00 00 00 41 72 72 61 79 50 72 6F 70 65 72 74 79 00 01 00 00 00 0D 00 00 00 42 79 74 65 50 72 6F 70 65 72 74 79 00 00 00 00 00';

    static LEVEL_ENVIRONMENT_OPTIONS = {
        Rome: {
            name: 'Rome',
            music: 'Rome',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Rome.MI_EditorGround_Rome',
            vegEnum: 'E_ModelEnvironment::NewEnumerator1',
        },
        Medieval: {
            name: 'Medieval',
            music: 'Medieval',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Medieval.MI_EditorGround_Medieval',
            vegEnum: 'E_ModelEnvironment::NewEnumerator2',
        },
        Egypt: {
            name: 'Egypt',
            music: 'Egypt',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Egypt.MI_EditorGround_Egypt',
            vegEnum: 'E_ModelEnvironment::NewEnumerator0',
        },
        Wood: {
            name: 'Wood',
            music: 'Wood',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Wood.MI_EditorGround_Wood',
            vegEnum: 'E_ModelEnvironment::NewEnumerator4',
        }
    };

    getFog() {
        try {
            return this.file.readFloat(LevelFile.HDR_FOG);
        } catch (e) {
            return 0;
        }
    }

    setFog(value) {
        this.file.writeFloat(LevelFile.HDR_FOG, value);
    }

    getLevelMusic() {
        return this.file.readStringByHeader(LevelFile.HDR_MUSIC, 5);
    }

    setLevelMusic(name) {
        const config = this.#getLevelEnvironmentConfig(name);
        const offset = this.file.getValueOffset(LevelFile.HDR_MUSIC) + 5;

        this.#replaceStringWithAdjustments(offset, config.music, this.#createStringAdjustOffsets([
            offset - 5,
        ]));
    }

    getTerrain() {
        const terrainPath = this.file.readString(this.getTerrainOffset());

        return this.#findLevelEnvironment(config => config.terrain === terrainPath).name;
    }

    getTerrainOffset() {
        const vegetationEnumNames = this.#getLevelEnvironmentConfigsAsArray().map(cfg => cfg.terrain);

        return this.file.findOffsetOfAnyString(vegetationEnumNames);
    }

    setTerrain(name) {
        const config = this.#getLevelEnvironmentConfig(name);
        const offset = this.getTerrainOffset();

        this.#replaceStringWithAdjustments(offset, config.terrain, this.#createStringAdjustOffsets([
            offset - 6,
        ]));
    }

    getVegetation() {
        const vegetationPath = this.file.readString(this.getVegetationOffset());

        return this.#findLevelEnvironment(config => config.vegEnum === vegetationPath).name;
    }

    getVegetationOffset() {
        const vegetationEnumNames = this.#getLevelEnvironmentConfigsAsArray().map(cfg => cfg.vegEnum);

        return this.file.findOffsetOfAnyString(vegetationEnumNames);
    }

    setVegetation(name) {
        const config = this.#getLevelEnvironmentConfig(name);
        const offset = this.getVegetationOffset();

        this.#replaceStringWithAdjustments(offset, config.vegEnum, this.#createStringAdjustOffsets([
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
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS),
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS) + 5,
            ...additionalAdjustments,
        ];
    }
}
