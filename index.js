import LevelFile from './LevelFile.js';

const ui = {
    fileInput: document.getElementById('fileInput'),
    controls: document.getElementById('controls'),
    fog: document.getElementById('fogDensity'),
    music: document.getElementById('levelMusic'),
    terrain: document.getElementById('terrainSelect'),
    veg: document.getElementById('vegSelect'),
    btnFog: document.getElementById('updateFogBtn'),
    btnMusic: document.getElementById('updateMusicBtn'),
    btnTerrain: document.getElementById('updateTerrainBtn'),
    btnVeg: document.getElementById('updateVegBtn'),
    btnDownload: document.getElementById('downloadAllBtn')
};

let levelFile;

ui.fileInput.addEventListener('change', async e => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    levelFile = new LevelFile(await file.arrayBuffer());

    ui.fog.value = levelFile.getFog().toFixed(4);
    ui.music.value = levelFile.getLevelMusic();
    ui.terrain.value = levelFile.getTerrain();
    ui.veg.value = levelFile.getVegetation();

    ui.fog.toggleAttribute('disabled', +ui.fog.value === 0);
    ui.btnFog.toggleAttribute('disabled', +ui.fog.value === 0);

    ui.controls.style.display = 'block';
});

ui.btnFog.addEventListener('click', () => {
    const v = parseFloat(ui.fog.value);

    if (!isNaN(v)) {
        levelFile.setFog(v);
    }
});

ui.btnMusic.addEventListener('click', () => levelFile.setLevelMusic(ui.music.value));
ui.btnTerrain.addEventListener('click', () => levelFile.setTerrain(ui.terrain.value));
ui.btnVeg.addEventListener('click', () => levelFile.setVegetation(ui.veg.value));

ui.btnDownload.addEventListener('click', () => {
    const blob = new Blob([levelFile.getArrayBuffer()], { type: 'application/octet-stream' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = ui.fileInput.files[0].name;
    a.click();
});
