import barChartGui from './bar-chart';
import baseMapGui from './base-map';
import datasetGui from './dataset';

var currentVisualization = {};
/**
 * @method updateVisualization
 * @description receive the range, reset the canvas, add axes, labels, ticks and items and render it
 */
export function update(canvas) {

    canvas.reset();
    let visualizationType = $("select.visualization").val();
    if(
        currentVisualization.constructor.name === "DotMap" &&
        visualizationType !== "dot"
    ){
        currentVisualization.hide();
    }

    switch (visualizationType) {
        case "barChart":
            currentVisualization = canvas.addBarChart(
                dataStore.data,
                dataStore.schema,
                dataStore.currentSelection,
                "Superstore"
            );
            break;

        case "scatterPlot":
            currentVisualization = canvas.addScatterPlot(
                dataStore,
                "Superstore"
            );
            break;

        case "dot":
            // if(currentVisualization.constructor.name !== "DotMap" ){

            //     currentVisualization = canvas.addDotMap(
            //         dataStore,
            //         "Superstore"
            //     );


            // } else {
            //     currentVisualization.updateBaseMap(canvas.levelOfDetail);
            // }
            currentVisualization = canvas.addDotMap(
                dataStore,
                "Superstore"
            );
            currentVisualization.show();
            break;

        default:
            throw new Error(`Visualizationtype not working ("${visualizationType}")`);
    }
    window.viz = currentVisualization;
    canvas.render();
}

export function initDatGui(ui, canvas) {
    datasetGui(ui, canvas, update);
    barChartGui(ui, canvas, update);
    baseMapGui(ui, canvas, update);
}
