export default function(ui, canvas, update){
    let folderDataSet = ui.DatGui.addFolder('DataSet');

    folderDataSet.add(dataStore, "useSubset").onChange(() => {
        dataStore.createSubset();
        update(canvas);
    });

    folderDataSet.add(dataStore, 'sizeOfSubset', 1, 1500).onChange(() => {
        dataStore.sizeOfSubset = Math.floor(dataStore.sizeOfSubset);
        dataStore.createSubset();
        update(canvas);
    });

    folderDataSet.open();
}
