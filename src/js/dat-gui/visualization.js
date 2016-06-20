export default function (ui, canvas) {
    let folder = ui.DatGui.addFolder("Visualization");

    folder.add(canvas.visualizations, "speedPxPerFrame", 0.1, 20).listen().onChange((value) => {
        if(canvas.visualization) canvas.visualization.setSpeed(value);
        if(canvas.visualizationOld) canvas.visualizationOld.setSpeed(value);
    });

    folder.open();
}
