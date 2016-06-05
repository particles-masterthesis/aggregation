export default function (dataStore, ui, canvas, update) {
    let folder = ui.DatGui.addFolder('Particles');

    folder.add(
        canvas.particle,
        'shape',
        ['rectangle', 'circle']
    ).onChange(() => {
        update(dataStore, canvas);
    });

    folder.open();
}
