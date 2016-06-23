export default function (dataStore, ui, canvas, update) {

    let folderBaseMap = ui.DatGui.addFolder('Base Map');

    folderBaseMap.add(
        canvas,
        'levelOfDetail',
        ['country', 'state', 'county']
    ).onChange((value) => {
        if(canvas.visualization.constructor.name === "DotMap"){
            canvas.visualization.updateBaseMap(value);
        } else {
            update(canvas);
        }
    });

    folderBaseMap.open();
}
