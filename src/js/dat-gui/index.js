import barChartGui from './bar-chart';
import baseMapGui from './base-map';
import datasetGui from './dataset';

var currentVisualization = {};
/**
 * @method updateVisualization
 * @description receive the range, reset the canvas, add axes, labels, ticks and items and render it
 */
export function update(dataStore, canvas) {
    canvas.stop();

    let visualizationType = $("select.visualization").val();

    let currentVisualizationIsEmpty = Object.keys(currentVisualization).length === 0;
    let currentVisualizationIsMap = typeof ["DotMap", "ProportionalSymbolMap"].find(
            name => name === currentVisualization.constructor.name
        ) === 'string';
    let visualizationTypeIsMap = typeof ["dot", "psm"].find(
            type => type === visualizationType
        ) === 'string';

    if (
        !currentVisualizationIsEmpty &&
        !visualizationTypeIsMap &&
        currentVisualizationIsMap
    ) {
        currentVisualization.hide();
    }

    switch (visualizationType) {
        case "barChart":
            currentVisualization = canvas.drawBarChart(
                dataStore.data,
                dataStore.schema,
                dataStore.currentSelection,
                "Superstore"
            );
            break;

        case "scatterPlot":
            currentVisualization = canvas.drawScatterPlot(
                dataStore,
                "Superstore"
            );
            break;

        case "dot":
            currentVisualization = canvas.drawDotMap(
                dataStore.data,
                currentVisualization.constructor.name === "DotMap"
            );
            currentVisualization.show();
            break;

        case "psm":
            currentVisualization = canvas.drawProportionalSymbolMap(
                dataStore,
                currentVisualization.constructor.name === "ProportionalSymbolMap"
            );
            currentVisualization.show();
            break;

        case "overview":
            currentVisualization = canvas.drawParticles(dataStore.data);
            break;

        default:
            throw new Error(`Visualizationtype not working ("${visualizationType}")`);
    }

    window.viz = currentVisualization;
    canvas.render();
}

export function initDatGui(dataStore, ui, canvas) {
    datasetGui(dataStore, ui, canvas, update);
    barChartGui(dataStore, ui, canvas, update);
    baseMapGui(dataStore, ui, canvas, update);
}
