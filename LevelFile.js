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
            music: 'Rome',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Rome.MI_EditorGround_Rome',
            vegEnum: 'E_ModelEnvironment::NewEnumerator1',
        },
        Medieval: {
            music: 'Medieval',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Medieval.MI_EditorGround_Medieval',
            vegEnum: 'E_ModelEnvironment::NewEnumerator2',
        },
        Egypt: {
            music: 'Egypt',
            terrain: '/Game/MapEditor/Materials/MI_EditorGround_Egypt.MI_EditorGround_Egypt',
            vegEnum: 'E_ModelEnvironment::NewEnumerator0',
        },
        Wood: {
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
        const cfg = LevelFile.LEVEL_ENVIRONMENT_OPTIONS[name];

        if (!cfg) {
            throw new Error('Unknown music option: ' + name);
        }

        const oldMusic = this.getLevelMusic();
        const offset = this.file.getValueOffset(LevelFile.HDR_MUSIC) + 5;
        const delta = cfg.music.length - oldMusic.length;

        this.file.replaceString(offset, cfg.music);

        const adjustOffsets = [
            0x55,
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS),
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS) + 5,
            this.file.getValueOffset(LevelFile.HDR_MUSIC),
        ];

        adjustOffsets.forEach(pos => this.file.modifyInteger(pos, delta));
    }

    getTerrain() {
        for (const [key, cfg] of Object.entries(LevelFile.LEVEL_ENVIRONMENT_OPTIONS)) {
            if (this.file.findStringOffset(cfg.terrain) >= 0) {
                return key;
            }
        }

        return null;
    }

    getTerrainOffset() {
        for (const [key, cfg] of Object.entries(LevelFile.LEVEL_ENVIRONMENT_OPTIONS)) {
            const offset = this.file.findStringOffset(cfg.terrain);

            if (offset >= 0) {
                return offset;
            }
        }

        return null;
    }

    setTerrain(name) {
        const cfg = LevelFile.LEVEL_ENVIRONMENT_OPTIONS[name];

        if (!cfg) {
            throw new Error('Unknown terrain option: ' + name);
        }

        const currentTerrainString = LevelFile.LEVEL_ENVIRONMENT_OPTIONS[this.getTerrain()].terrain;
        const offset = this.getTerrainOffset();
        const delta = cfg.terrain.length - currentTerrainString.length;

        this.file.replaceString(offset, cfg.terrain);

        const adjustOffsets = [
            0x55,
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS),
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS) + 5,
            offset - 6,
        ];

        adjustOffsets.forEach(pos => this.file.modifyInteger(pos, delta));
    }

    getVegetation() {
        for (const [key, cfg] of Object.entries(LevelFile.LEVEL_ENVIRONMENT_OPTIONS)) {
            if (this.file.findStringOffset(cfg.vegEnum) >= 0) {
                return key;
            }
        }

        return null;
    }

    getVegetationOffset() {
        for (const [key, cfg] of Object.entries(LevelFile.LEVEL_ENVIRONMENT_OPTIONS)) {
            const offset = this.file.findStringOffset(cfg.vegEnum);

            if (offset >= 0) {
                return offset;
            }
        }

        return null;
    }

    setVegetation(name) {
        const cfg = LevelFile.LEVEL_ENVIRONMENT_OPTIONS[name];

        if (!cfg) {
            throw new Error('Unknown vegetation option: ' + name);
        }

        const currentVegEnumString = LevelFile.LEVEL_ENVIRONMENT_OPTIONS[this.getTerrain()].vegEnum;
        const offset = this.getVegetationOffset();
        const delta = cfg.vegEnum.length - currentVegEnumString.length;

        this.file.replaceString(offset, cfg.vegEnum);

        const adjustOffsets = [
            0x55,
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS),
            this.file.getValueOffset(LevelFile.HDR_ACTOR_PROPS) + 5,
            offset - 5,
        ];

        adjustOffsets.forEach(pos => this.file.modifyInteger(pos, delta));
    }

    getArrayBuffer() {
        return this.file.getArrayBuffer();
    }
}
