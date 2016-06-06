import barChartGui from './bar-chart';
import baseMapGui from './base-map';
import datasetGui from './dataset';
import particleGui from './particles';

export default function (dataStore, ui, canvas, update) {
    datasetGui(dataStore, ui, canvas, update);
    barChartGui(dataStore, ui, canvas, update);
    baseMapGui(dataStore, ui, canvas, update);
    particleGui(dataStore, ui, canvas, update);
}
