export default function(ui, canvas, update){

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');

    folderBarChart.add(canvas, "barChartParticles").onChange(() => {
        update(canvas);
    });

    folderBarChart.open();

}
