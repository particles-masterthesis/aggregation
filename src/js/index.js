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

    let folderDataSet = ui.DatGui.addFolder('DataSet');
    folderDataSet.add(dataStore, "useSubset").onChange(() => {
        dataStore.createSubset();
        updateVisualization();
    });
    folderDataSet.add(dataStore, 'sizeOfSubset', 1, 1500).onChange(() => {
        dataStore.sizeOfSubset = Math.floor(dataStore.sizeOfSubset);
        dataStore.createSubset();
        updateVisualization();
    });
    folderDataSet.open();

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');
    folderBarChart.add(canvas, "barChartParticles").onChange(() => {
        updateVisualization();
    });
    folderBarChart.open();

    // After import the dataset we now can update the dropboxes with the features
    ui.updateDropdown(dataStore.features, dataStore.currentSelection);
    ui.toggleYDropdown();

    $("select.feature-x").change(function () {
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        updateVisualization();
    });

    dataStore.import(`${location.origin}/dist/dataset/superstore_preprocessed.csv`);

    $("select.visualization").change(function () {
        // ui.toggleYDropdown();
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
            canvas.addBarChart(dataStore.data, dataStore.schema, dataStore.currentSelection, "Superstore");
            break;

        case "scatterPlot":
            canvas.addScatterPlot(dataStore, "Superstore");
            break;

        case "dot":
            canvas.addDotMap(
                dataStore,
                "Superstore"
            );
            break;

        default:
            break;
    }
    canvas.render();
}




