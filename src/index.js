import LevelFile from './files/LevelFile.js';
import NumberPropertyEditor from './editors/NumberPropertyEditor.js';
import EnumPropertyEditor from './editors/EnumPropertyEditor.js';

const ui = {
    fileInput: document.getElementById('file-input'),
    controls: document.getElementById('controls'),
    downloadButton: document.getElementById('download-button'),
};

let levelFile;

const levelPropertyEditors = [
    new NumberPropertyEditor({
        input: 'terrain-width',
        button: 'set-level-size-x-button',
        reader: level => level.getWidth(),
        writer: (level, v) => level.setWidth(v),
        availabilityChecker: level => level.hasWidth(),
    }),

    new NumberPropertyEditor({
        input: 'terrain-height',
        button: 'set-level-size-y-button',
        reader: level => level.getHeight(),
        writer: (level, v) => level.setHeight(v),
        availabilityChecker: level => level.hasHeight(),
    }),

    new NumberPropertyEditor({
        input: 'fog-density',
        button: 'set-fog-density-button',
        reader: level => level.getFogDensity(),
        writer: (level, v) => level.setFogDensity(v),
        availabilityChecker: level => level.hasFogDensity(),
    }),

    new EnumPropertyEditor({
        input: 'level-music-select',
        button: 'set-music-button',
        reader: level => level.getMusic(),
        writer: (level, v) => level.setMusic(v),
    }),

    new EnumPropertyEditor({
        input: 'terrain-select',
        button: 'set-terrain-button',
        reader: level => level.getTerrain(),
        writer: (level, v) => level.setTerrain(v),
    }),

    new EnumPropertyEditor({
        input: 'vegetation-select',
        button: 'set-vegetation-button',
        reader: level => level.getVegetation(),
        writer: (level, v) => level.setVegetation(v),
    }),
];

ui.fileInput.addEventListener('change', async e => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    levelFile = new LevelFile(await file.arrayBuffer());

    levelPropertyEditors.forEach(propertyEditor => {
        propertyEditor.attachLevel(levelFile);
        propertyEditor.init(levelFile);
    });

    ui.controls.style.display = 'block';
});

ui.downloadButton.addEventListener('click', () => {
    const blob = new Blob([levelFile.getArrayBuffer()], { type: 'application/octet-stream' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = ui.fileInput.files[0].name;
    a.click();
});
