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
    let dataStore = window.dataStore = new DataStore();
    dataStore.import(`${location.origin}${location.pathname}/dist/datasets/superstore-preprocessed-coords-geoids.csv`);

    let ui = window.ui = new UI();
    let canvas = window.canvas = new Canvas(dataStore.data, dataStore.currentSelection);

    initDatGui(dataStore, ui, canvas);

    UI.updateDropdown(dataStore.features, dataStore.currentSelection);
    UI.toggleFeatureDropdowns();

    addEventListener(dataStore, canvas);
    updateVisualization(dataStore, canvas);
};

function addEventListener(dataStore, canvas){
    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        updateVisualization(dataStore, canvas);
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        updateVisualization(dataStore, canvas);
    });

    $("select.visualization").change(function () {
        UI.toggleFeatureDropdowns();
        updateVisualization(dataStore, canvas);
    });
}
