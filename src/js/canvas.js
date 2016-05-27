import "pixi.js";

import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";
import DotMap from "./diagram/dot-map";
import { bbox } from './bbox';

export default class Canvas {

    constructor(dataset, features) {
        this.barChartParticles = true;
        this.levelOfDetail = 'country';
        this.requestFrameID = null;

        this.height = window.innerHeight - 90; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 40; //windowH width - css-paddings

        // arguments: width, height, view, transparent, antialias
//         this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
//             transparent: true,
//             clearBeforeRender: true
//         }, true, true);
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            transparent: true,
            clearBeforeRender: true,
            antialias: true
        });
        document.body.appendChild(this.renderer.view);

        this.stage = new PIXI.Container();
    }

    addScatterPlot(dataStore, title) {
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        return new ScatterPlot(container, dataStore, title);
    }

    addBarChart(dataset, schema, features, title) {
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        return new BarChart(container, dataset, schema, features, title, this.barChartParticles);
    }

    addDotMap(dataStore, title){
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        return new DotMap(container, dataStore, title, this.levelOfDetail);
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
