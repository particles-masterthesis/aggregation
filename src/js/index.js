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
    window.ui = new UI();
    window.canvas = new Canvas();
    window.dataStore = new DataStore();

    document.body.appendChild(canvas.renderer.view);

    ui.DatGui.add(dataStore, 'sizeOfSubset', 1, 6000).onChange(() => {
        dataStore.sizeOfSubset = Math.floor(dataStore.sizeOfSubset);
        dataStore.createSubset();
        updateVisualization();
    });

    ui.DatGui.add(canvas, "barChartParticles").onChange(() => {
        updateVisualization();
    });

    dataStore.import(`${location.origin}/dist/superstore_preprocessed.csv`);

    // After import the dataset we now can update the dropboxes with the features
    ui.updateDropdown(dataStore.features, dataStore.currentSelection);
    ui.toggleYDropdown();

    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        updateVisualization();
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        updateVisualization();
    });

    $("select.visualization").change(function () {
        ui.toggleYDropdown();
        updateVisualization();
    });

    updateVisualization();
};

/**
 * @method updateVisualization
 * @description receive the range, reset the canvas, add axes, labels, ticks and items and render it
 */

function updateVisualization() {
    canvas.reset();

    switch ($("select.visualization").val()) {
        case "barChart":
            canvas.addBarChart(
                dataStore.subset,
                dataStore.currentSelection,
                "Superstore"
            );
            break;

        case "scatterPlot":
            canvas.addScatterPlot(
                dataStore,
                "Superstore"
            );
            break;

        default:
            canvas.addPhysicsJSDiagram(dataStore.subset, dataStore.currentSelection);
            break;
    }
    canvas.render();
}




