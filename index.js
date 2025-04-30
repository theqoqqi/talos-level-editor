import LevelFile from './LevelFile.js';

const ui = {
    fileInput: document.getElementById('fileInput'),
    controlsContainer: document.getElementById('controls'),
    fogDensityInput: document.getElementById('fogDensity'),
    musicSelect: document.getElementById('levelMusic'),
    terrainSelect: document.getElementById('terrainSelect'),
    vegetationSelect: document.getElementById('vegSelect'),
    setFogButton: document.getElementById('updateFogBtn'),
    setMusicButton: document.getElementById('updateMusicBtn'),
    setTerrainButton: document.getElementById('updateTerrainBtn'),
    setVegetationButton: document.getElementById('updateVegBtn'),
    downloadButton: document.getElementById('downloadAllBtn')
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
    ui.setFogButton.toggleAttribute('disabled', +ui.fogDensityInput.value === 0);

    ui.controlsContainer.style.display = 'block';
});

ui.setFogButton.addEventListener('click', () => {
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
