/* jshint esversion: 6 */

//
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

    const controller = ui.DatGui.add(dataStore, 'sizeOfSubset', 1, 6000);
    controller.onChange(() => {
        dataStore.sizeOfSubset = Math.floor(dataStore.sizeOfSubset);
        dataStore.createSubset();
        updateVisualization();
    });

    dataStore.import(`${location.origin}/dist/superstore_preprocessed.csv`);

    // After import the dataset we now can update the dropboxes with the features
    ui.updateDropdown(dataStore.features, dataStore.currentSelection);

    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        updateVisualization();
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
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
    canvas.addBarChart(dataStore.subset, dataStore.currentSelection, "Superstore");
    canvas.render();
}




