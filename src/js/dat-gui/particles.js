export default function (dataStore, ui, canvas, update) {
    let folder = ui.DatGui.addFolder('Particles');

    folder.add(
        canvas.particles,
        'shape',
        ['rectangle', 'circle']
    ).onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folder.open();
}
