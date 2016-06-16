import "./helper";
import $ from 'jquery';
import jQuery from 'jquery';
// export for others scripts to use
window.$      = $;
window.jQuery = jQuery;

require("./../../node_modules/jquery-csv/src/jquery.csv.js");

import UI from './ui';
import Canvas from './canvas';
import DataStore from './data-store';

import initDatGui from './dat-gui';

import TransitionManager from './visualization/map/transition-manager';

/**
 * @method window.onload
 * @description After loading all scripts initialize the instances, load dataset and update ui
 */
var TM;
window.onload = () => {
    let dataStore = window.dataStore = new DataStore();
    dataStore.import(`${location.origin}${location.pathname}/dist/datasets/superstore-preprocessed-coords-geoids.csv`);

    let ui = window.ui = new UI();
    let canvas = window.canvas = new Canvas(dataStore.data, dataStore.currentSelection);
    initDatGui(dataStore, ui, canvas, window.updateScreen);

    // After import the dataset we now can update the dropboxes with the features
    UI.updateDropdown(dataStore.features, dataStore.currentSelection);
    UI.toggleFeatureDropdowns();

    addEventListener(dataStore, canvas);
    TM = new TransitionManager(canvas);
    window.updateScreen();
};

// latest visualization in [0]
var visualizationHistory = [];
var currentVisualization = {};
window.updateScreen = () => {
    canvas.stop();

    let upcomingVisualizationType = $("select.visualization").val();
    let transitionType            = $("select.transition").val();

    // if there was previous visualization
    if(visualizationHistory.length){
        // check if it was anything with maps
        // and if the new visualization is another type than the last one
        let mapTypesWithDomNodes = ['dot', 'psm', 'choropleth', 'cartogram'];
        if(
            mapTypesWithDomNodes.indexOf(visualizationHistory[0].type) > -1 &&
            visualizationHistory[0].type !== upcomingVisualizationType
        ){
            if(
                transitionType === 'linear' &&
                mapTypesWithDomNodes.indexOf(upcomingVisualizationType) > -1
            ){
                currentVisualization = TM.animate(
                    visualizationHistory[0],
                    upcomingVisualizationType
                );
                visualizationHistory.unshift(currentVisualization);
                currentVisualization = currentVisualization.obj;
                return;
            } else {
                // remove all dom nodes
                visualizationHistory[0].obj.removeAllDomNodes();

                // hide svg and map
                visualizationHistory[0].obj.hide(true, true);
            }
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
                dataStore.data,
                currentVisualization.constructor.name === "ProportionalSymbolMap"
            );
            visualizationHistory.unshift({
                'type': 'psm',
                'obj': currentVisualization
            });
            break;

        case "choropleth":
            currentVisualization = canvas.drawChoroplethMap(
                dataStore.data,
                currentVisualization.constructor.name === "ChoroplethMap"
            );
            visualizationHistory.unshift({
                'type': 'choropleth',
                'obj': currentVisualization
            });
            break;

        case "cartogram":
            currentVisualization = canvas.drawCartogram(
                dataStore.data,
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

    window.viz = currentVisualization;
    canvas.render();
};

function addEventListener(dataStore, canvas){
    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        canvas.prepareCanvas();
        window.updateScreen(dataStore, canvas);
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        canvas.prepareCanvas();
        window.updateScreen(dataStore, canvas);
    });

    $("select.visualization").change(function () {
        UI.toggleFeatureDropdowns();
        canvas.prepareCanvas();
        window.updateScreen(dataStore, canvas);
    });
}
