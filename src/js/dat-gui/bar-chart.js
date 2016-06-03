export default function(dataStore, ui, canvas, update){

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');

    folderBarChart.add(canvas, "barChartParticles").onChange(() => {
        canvas.removeParticles();
        update(dataStore, canvas);
    });

    folderBarChart.open();

}
