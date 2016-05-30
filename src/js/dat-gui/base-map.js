export default function (dataStore, ui, canvas, update) {

    let folderBaseMap = ui.DatGui.addFolder('Base Map');

    folderBaseMap.add(
        canvas,
        'levelOfDetail',
        ['country', 'state', 'county']
    ).onChange(() => {
        update(dataStore, canvas);
    });

    folderBaseMap.open();
}
