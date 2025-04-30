import LevelFile from './LevelFile.js';

const ui = {
    fileInput: document.getElementById('file-input'),
    controlsContainer: document.getElementById('controls'),
    fogDensityInput: document.getElementById('fog-density'),
    musicSelect: document.getElementById('level-music-select'),
    terrainSelect: document.getElementById('terrain-select'),
    vegetationSelect: document.getElementById('vegetation-select'),
    setFogDensityButton: document.getElementById('set-fog-density-button'),
    setMusicButton: document.getElementById('set-music-button'),
    setTerrainButton: document.getElementById('set-terrain-button'),
    setVegetationButton: document.getElementById('set-vegetation-button'),
    downloadButton: document.getElementById('download-button')
};

let levelFile;

ui.fileInput.addEventListener('change', async e => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    levelFile = new LevelFile(await file.arrayBuffer());

    ui.fogDensityInput.value = levelFile.getFogDensity().toFixed(4);
    ui.musicSelect.value = levelFile.getMusic();
    ui.terrainSelect.value = levelFile.getTerrain();
    ui.vegetationSelect.value = levelFile.getVegetation();

    ui.fogDensityInput.toggleAttribute('disabled', +ui.fogDensityInput.value === 0);
    ui.setFogDensityButton.toggleAttribute('disabled', +ui.fogDensityInput.value === 0);

    ui.controlsContainer.style.display = 'block';
});

ui.setFogDensityButton.addEventListener('click', () => {
    const v = parseFloat(ui.fogDensityInput.value);

    if (!isNaN(v)) {
        levelFile.setFogDensity(v);
    }
});

ui.setMusicButton.addEventListener('click', () => levelFile.setMusic(ui.musicSelect.value));
ui.setTerrainButton.addEventListener('click', () => levelFile.setTerrain(ui.terrainSelect.value));
ui.setVegetationButton.addEventListener('click', () => levelFile.setVegetation(ui.vegetationSelect.value));

ui.downloadButton.addEventListener('click', () => {
    const blob = new Blob([levelFile.getArrayBuffer()], { type: 'application/octet-stream' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = ui.fileInput.files[0].name;
    a.click();
});
