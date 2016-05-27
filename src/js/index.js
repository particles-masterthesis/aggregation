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

import {update as updateVisualization, initDatGui} from './dat-gui';
/**
 * @method window.onload
 * @description After loading all scripts initialize the instances, load dataset and update ui
 */

window.onload = () => {
    window.dataStore = new DataStore();
    dataStore.import(`${location.origin}/dist/dataset/superstore_preprocessed.csv`);

    window.ui = new UI();
    window.canvas = new Canvas(dataStore.data, dataStore.currentSelection);

    initDatGui(ui, canvas);

    // After import the dataset we now can update the dropboxes with the features
    ui.updateDropdown(dataStore.features, dataStore.currentSelection);
    ui.toggleYDropdown();

    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        updateVisualization(canvas);
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        updateVisualization(canvas);
    });

    $("select.visualization").change(function () {
        ui.toggleYDropdown();
        updateVisualization(canvas);
    });

    updateVisualization(canvas);
};


