import "./helper";
import $ from 'jquery';
import jQuery from 'jquery';
// export for others scripts to use
window.$ = $;
window.jQuery = jQuery;

require("./../../node_modules/jquery-csv/src/jquery.csv.js");

import UI from './ui';
import Canvas from './canvas';
import DataStore from './data-store';

import initDatGui from './dat-gui';

/**
 * @method window.onload
 * @description After loading all scripts initialize the instances, load dataset and update ui
 */

window.onload = () => {
    let dataStore = window.dataStore = new DataStore();
    dataStore.import(`${location.origin}${location.pathname}/dist/dataset/superstore_preprocessed.csv`);

    let ui = window.ui = new UI();
    let canvas = window.canvas = new Canvas(dataStore.data, dataStore.currentSelection);

    initDatGui(dataStore, ui, canvas, window.updateScreen);
    // After import the dataset we now can update the dropboxes with the features
    UI.updateDropdown(dataStore.features, dataStore.currentSelection);
    UI.toggleFeatureDropdowns();

    addEventListener(dataStore, canvas);
    window.updateScreen();
};

let currentVisualization;
window.updateScreen = () => {
    let visualizationType = $("select.visualization").val();
    if (currentVisualization &&
        (currentVisualization.constructor.name === "DotMap" || currentVisualization.constructor.name === "ProportionalSymbolMap") &&
        (visualizationType !== "dot" || visualizationType !== "psm")
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
                "Superstore"
            );
            currentVisualization.show();
            break;

        case "psm":
            currentVisualization = canvas.drawProportionalSymbolMap(
                dataStore.data,
                "Superstore"
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
};

function addEventListener(dataStore, canvas){
    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        window.updateScreen(dataStore, canvas);
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        window.updateScreen(dataStore, canvas);
    });

    $("select.visualization").change(function () {
        UI.toggleFeatureDropdowns();
        window.updateScreen(dataStore, canvas);
    });
}
