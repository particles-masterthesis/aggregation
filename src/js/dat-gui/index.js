import barChartGui from './bar-chart';
import baseMapGui from './base-map';
import datasetGui from './dataset';
import choroplethMapGui from './choropleth-map';

var currentVisualization = {};
var visualizationHistory = [];
/**
 * @method updateVisualization
 * @description receive the range, reset the canvas, add axes, labels, ticks and items and render it
 */
export function update(dataStore, canvas) {
    canvas.stop();

    let visualizationType = $("select.visualization").val();

    let currentVisualizationIsEmpty = Object.keys(currentVisualization).length === 0;
    let currentVisualizationIsMap = typeof ["DotMap", "ProportionalSymbolMap", "ChoroplethMap"].find(
            name => name === currentVisualization.constructor.name
        ) === 'string';
    let visualizationTypeIsMap = typeof ["dot", "psm", "choropleth"].find(
            type => type === visualizationType
        ) === 'string';

    if (
        !currentVisualizationIsEmpty &&
        !visualizationTypeIsMap &&
        currentVisualizationIsMap
    ) {
        currentVisualization.hide();
        if(
            visualizationHistory[visualizationHistory.length-1].type === 'psm'
        ){
            currentVisualization.removeSymbols();
        } else if (
            visualizationHistory[visualizationHistory.length-1].type === 'choropleth'
        ) {
            currentVisualization.removeChoropleth();
        }

    } else if (
        !currentVisualizationIsEmpty &&
        visualizationHistory[visualizationHistory.length-1].type === 'psm'
    ) {
        currentVisualization.removeSymbols();
    } else if (
        !currentVisualizationIsEmpty &&
        visualizationHistory[visualizationHistory.length-1].type === 'choropleth'
    ) {
        currentVisualization.removeChoropleth();
    }

    switch (visualizationType) {
        case "barChart":
            currentVisualization = canvas.drawBarChart(
                dataStore.data,
                dataStore.schema,
                dataStore.currentSelection,
                "Superstore"
            );
            visualizationHistory.push({
                'type': 'bar',
                'obj': currentVisualization
            });
            break;

        case "scatterPlot":
            currentVisualization = canvas.drawScatterPlot(
                dataStore,
                "Superstore"
            );
            visualizationHistory.push({
                'type': 'scatter',
                'obj': currentVisualization
            });
            break;

        case "dot":
            currentVisualization = canvas.drawDotMap(
                dataStore.data,
                currentVisualization.constructor.name === "DotMap"
            );
            visualizationHistory.push({
                'type': 'dot',
                'obj': currentVisualization
            });
            currentVisualization.show();
            break;

        case "psm":
            currentVisualization = canvas.drawProportionalSymbolMap(
                dataStore,
                currentVisualization.constructor.name === "ProportionalSymbolMap"
            );
            visualizationHistory.push({
                'type': 'psm',
                'obj': currentVisualization
            });
            currentVisualization.show();
            break;

        case "choropleth":
            currentVisualization = canvas.drawChoroplethMap(
                dataStore,
                currentVisualization.constructor.name === "ChoroplethMap"
            );
            visualizationHistory.push({
                'type': 'choropleth',
                'obj': currentVisualization
            });
            currentVisualization.show();
            break;

        case "overview":
            currentVisualization = canvas.drawParticles(dataStore.data);
            visualizationHistory.push({
                'type': 'overview',
                'obj': currentVisualization
            });
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
    choroplethMapGui(dataStore, ui, canvas, update);
}
