export default function(ui, canvas, update){

    let folderBaseMap = ui.DatGui.addFolder('Base Map');

    folderBaseMap.add(
        canvas,
        'levelOfDetail',
        [ 'country', 'state', 'county' ]
    ).onChange(() => {
        update(canvas);
    });

    folderBaseMap.open();

}
