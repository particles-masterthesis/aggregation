import barChartGui from './bar-chart';
import dotVisualizationsGui from './dot-visualizations';
import baseMapGui from './base-map';
import datasetGui from './dataset';
import choroplethMapGui from './choropleth-map';
import particleGui from './particles';

export default function (dataStore, ui, canvas, update) {
    datasetGui(dataStore, ui, canvas, update);
    barChartGui(dataStore, ui, canvas, update);
    particleGui(dataStore, ui, canvas, update);
    baseMapGui(dataStore, ui, canvas, update);
    choroplethMapGui(dataStore, ui, canvas, update);
    dotVisualizationsGui(dataStore, ui, canvas, update);
}
