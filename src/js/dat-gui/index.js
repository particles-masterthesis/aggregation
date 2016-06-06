import barChartGui from './bar-chart';
import baseMapGui from './base-map';
import datasetGui from './dataset';
import choroplethMapGui from './choropleth-map';

// latest visualization in [0]
var visualizationHistory = [];
var currentVisualization = {};
/**
 * @method updateVisualization
 * @description receive the range, reset the canvas, add axes, labels, ticks and items and render it
 */
export function update(dataStore, canvas) {
    canvas.stop();

    let upcomingVisualizationType = $("select.visualization").val();


    // if there was previous visualization
    if(visualizationHistory.length){
        // check if it was anything with maps
        // and if the new visualization is another type than the last one
        let mapTypesWithDomNodes = ['dot', 'psm', 'choropleth', 'cartogram'];
        if(
            mapTypesWithDomNodes.indexOf(visualizationHistory[0].type) > -1 &&
            visualizationHistory[0].type !== upcomingVisualizationType
        ){
            // remove all dom nodes
            visualizationHistory[0].obj.removeAllDomNodes();
            // hide svg and map
            visualizationHistory[0].obj.hide(true, true);
        }
    }

    switch (upcomingVisualizationType) {
        case "barChart":
            currentVisualization = canvas.drawBarChart(
                dataStore.data,
                dataStore.schema,
                dataStore.currentSelection,
                "Superstore"
            );
            visualizationHistory.unshift({
                'type': 'bar',
                'obj': currentVisualization
            });
            break;

        case "scatterPlot":
            currentVisualization = canvas.drawScatterPlot(
                dataStore,
                "Superstore"
            );
            visualizationHistory.unshift({
                'type': 'scatter',
                'obj': currentVisualization
            });
            break;

        case "dot":
            currentVisualization = canvas.drawDotMap(
                dataStore.data,
                currentVisualization.constructor.name === "DotMap"
            );
            visualizationHistory.unshift({
                'type': 'dot',
                'obj': currentVisualization
            });
            break;

        case "psm":
            currentVisualization = canvas.drawProportionalSymbolMap(
                dataStore,
                currentVisualization.constructor.name === "ProportionalSymbolMap"
            );
            visualizationHistory.unshift({
                'type': 'psm',
                'obj': currentVisualization
            });
            break;

        case "choropleth":
            currentVisualization = canvas.drawChoroplethMap(
                dataStore,
                currentVisualization.constructor.name === "ChoroplethMap"
            );
            visualizationHistory.unshift({
                'type': 'choropleth',
                'obj': currentVisualization
            });
            break;

        case "cartogram":
            currentVisualization = canvas.drawCartogram(
                dataStore,
                currentVisualization.constructor.name === "Cartogram"
            );
            visualizationHistory.unshift({
                'type': 'cartogram',
                'obj': currentVisualization
            });
            break;

        case "overview":
            currentVisualization = canvas.drawParticles(dataStore.data);
            visualizationHistory.unshift({
                'type': 'overview',
                'obj': currentVisualization
            });
            break;

        default:
            throw new Error(`Visualizationtype not working ("${visualizationType}")`);
    }

    canvas.render();
}

export function initDatGui(dataStore, ui, canvas) {
    datasetGui(dataStore, ui, canvas, update);
    barChartGui(dataStore, ui, canvas, update);
    baseMapGui(dataStore, ui, canvas, update);
    choroplethMapGui(dataStore, ui, canvas, update);
}
