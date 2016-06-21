export default function(dataStore, ui, canvas, update){

    let folderBarChart = ui.DatGui.addFolder('Scatter Plot & Dot Map');

    folderBarChart.add(canvas.particles, "sizeOfParticles", 1, 50).onChange(() => {
        if(canvas.visualization.constructor.name === "ScatterPlot"){
            canvas.reset();
            update(dataStore, canvas);
        }
    });

    folderBarChart.open();
}
