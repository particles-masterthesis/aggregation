/* jshint esversion: 6 */

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

/**
 * @method window.onload
 * @description After loading all scripts initialize the instances, load dataset and update ui
 */

window.onload = () => {
    window.dataStore = new DataStore();
    dataStore.import(`${location.origin}/dist/superstore_preprocessed.csv`);

    window.ui = new UI();
    window.canvas = new Canvas(dataStore.data, dataStore.currentSelection);

    // After import the dataset we now can update the dropboxes with the features
    UI.updateDropdown(dataStore.features, dataStore.currentSelection);
    UI.toggleFeatureDropdowns();

    initDatGui();
    addEventListener();
    updateVisualization();
};

function initDatGui(){

    let folderDataSet = window.ui.DatGui.addFolder('DataSet');
    folderDataSet.add(dataStore, "useSubset").onChange(() => {
        dataStore.createSubset();
        canvas.reset();
        updateVisualization();
    });
    folderDataSet.add(dataStore, 'sizeOfSubset', 1, 3000).onChange(() => {
        dataStore.sizeOfSubset = Math.floor(dataStore.sizeOfSubset);
        dataStore.createSubset();
        canvas.reset();
        updateVisualization();
    });
    folderDataSet.open();

    let folderBarChart = window.ui.DatGui.addFolder('Bar Chart');
    folderBarChart.add(canvas, "barChartParticles").onChange(() => {
        canvas.reset();
        updateVisualization();
    });
    folderBarChart.open();

}

function addEventListener(){

    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        updateVisualization();
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        updateVisualization();
    });

    $("select.visualization").change(function () {
        UI.toggleFeatureDropdowns();
        updateVisualization();
    });

}

/**
 * @method updateVisualization
 * @description receive the range, reset the canvas, add axes, labels, ticks and items and render it
 */

function updateVisualization() {

    canvas.stop();

    switch ($("select.visualization").val()) {
        case "barChart":
            canvas.drawBarChart(dataStore.schema, dataStore.currentSelection, "Superstore");
            break;

        case "scatterPlot":
            canvas.drawScatterPlot(dataStore, "Superstore");
            break;

        default:
            canvas.drawParticles(dataStore.data);
            break;
    }

    canvas.render();

}




