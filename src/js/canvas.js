/* jshint esversion: 6 */

import "pixi.js";
import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";

export default class Canvas {

    constructor(dataset, features) {
        this.barChartParticles = true;
        this.requestFrameID = null;

        this.height = window.innerHeight - 90; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 40; //windowH width - css-paddings

        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            backgroundColor: 0xF8F8F8,
            clearBeforeRender: true,
            antialias: true
        });
        document.body.appendChild(this.renderer.view);

        console.log(this.renderer);

        this.stage = new PIXI.Container();
    }

    addScatterPlot(dataStore, title) {
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        new ScatterPlot(container, dataStore, title);
    }

    addBarChart(dataset, schema, features, title) {
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        new BarChart(container, dataset, schema, features, title, this.barChartParticles);
    }

    reset() {
        this.stage.removeChildren();

        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    addVisualization(width, height, origin){
        var container = new PIXI.Container();
        container.width = width;
        container.height = height;
        container.x = origin.x;
        container.y = origin.y;

        this.stage.addChild(container);

        return container;
    }

    render() {
        this.renderer.render(this.stage);
        //this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }
}
