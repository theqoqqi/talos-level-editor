import LevelFile from './files/LevelFile.js';
import FloatPropertyEditor from './editors/FloatPropertyEditor.js';
import IntegerPropertyEditor from './editors/IntegerPropertyEditor.js';
import EnumPropertyEditor from './editors/EnumPropertyEditor.js';

const ui = {
    fileInput: document.getElementById('file-input'),
    controls: document.getElementById('controls'),
    downloadButton: document.getElementById('download-button'),
};

let levelFile;

const levelPropertyEditors = [
    new IntegerPropertyEditor({
        input: 'terrain-width',
        button: 'set-level-size-x-button',
        propertyGetter: level => level.width,
    }),

    new IntegerPropertyEditor({
        input: 'terrain-height',
        button: 'set-level-size-y-button',
        propertyGetter: level => level.height,
    }),

    new FloatPropertyEditor({
        input: 'fog-density',
        button: 'set-fog-density-button',
        propertyGetter: level => level.fogDensity,
    }),

    new EnumPropertyEditor({
        input: 'level-music-select',
        button: 'set-music-button',
        propertyGetter: level => level.music,
    }),

    new EnumPropertyEditor({
        input: 'terrain-select',
        button: 'set-terrain-button',
        propertyGetter: level => level.terrain,
    }),

    new EnumPropertyEditor({
        input: 'vegetation-select',
        button: 'set-vegetation-button',
        propertyGetter: level => level.vegetation,
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
