export default function(dataStore, ui, canvas, update){

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');

    folderBarChart.add(canvas, "barChartParticles").onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folderBarChart.open();

}
