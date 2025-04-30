import LevelFile from './files/LevelFile.js';
import FloatPropertyEditor from './editors/FloatPropertyEditor.js';
import IntegerPropertyEditor from './editors/IntegerPropertyEditor.js';
import EnumPropertyEditor from './editors/EnumPropertyEditor.js';
import DoublePropertyEditor from './editors/DoublePropertyEditor.js';

const ui = {
    fileInput: document.getElementById('file-input'),
    controls: document.getElementById('controls'),
    downloadButton: document.getElementById('download-button'),
};

let levelFile;

const levelPropertyEditors = [
    new IntegerPropertyEditor({
        container: 'level-width-property',
        propertyGetter: level => level.width,
    }),

    new IntegerPropertyEditor({
        container: 'level-height-property',
        propertyGetter: level => level.height,
    }),

    new FloatPropertyEditor({
        container: 'cloudiness-layer-1-property',
        propertyGetter: level => level.cloudinessLayer1,
    }),

    new DoublePropertyEditor({
        container: 'cloudiness-layer-2-property',
        propertyGetter: level => level.cloudinessLayer2,
    }),

    new FloatPropertyEditor({
        container: 'fog-density-property',
        propertyGetter: level => level.fogDensity,
    }),

    new EnumPropertyEditor({
        container: 'music-property',
        propertyGetter: level => level.music,
    }),

    new EnumPropertyEditor({
        container: 'terrain-property',
        propertyGetter: level => level.terrain,
    }),

    new EnumPropertyEditor({
        container: 'vegetation-property',
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
