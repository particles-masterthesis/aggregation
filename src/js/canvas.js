/* jshint esversion: 6 */

import "pixi.js";
import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";

var Physics = require("./../../node_modules/physicsjs/dist/physicsjs-full");

export default class Canvas {

    constructor(dataset, features) {
        this.barChartParticles = true;

        this.renderer = Physics.renderer("pixi", {
            el: "canvas-container",
            meta: true,
            styles: {
                "circle": {
                    strokeStyle: "0x5555AA",
                    lineWidth: 0,
                    fillStyle: "0x5555AA"
                },
                "rectangle": {
                    lineWidth: 0,
                    fillStyle: "0x5555AA",
                    alpha: 1
                }
            }
        });

        this.height = this.renderer.el.firstChild.clientHeight + 90;
        this.width = this.renderer.el.firstChild.clientWidth + 40;

        this.renderer.stage.width = this.width;
        this.renderer.stage.height = this.height;

        this.world = Physics();
        this.world.add(this.renderer);

        this.world.on("step", this.render.bind(this));
        Physics.util.ticker.on(function (time, dt) {
            this.world.step(time);
        }.bind(this));
        Physics.util.ticker.start();
    }

    addScatterPlot(dataStore, title) {
        new ScatterPlot(this.world, this.renderer.stage, dataStore, title);
    }

    addBarChart(dataset, schema, features, title) {
        new BarChart(this.world, this.renderer.stage, dataset, schema, features, title, this.barChartParticles);
    }

    reset() {
        this.renderer.stage.removeChildren();
    }

    render() {
        this.world.render();
    }
}
