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
            width: 500,
            height: 500,
            meta: true,
            options: {  
                antialias: true
            },
            styles: {
                "circle": {
                    strokeStyle: "0x5555AA",
                    lineWidth: 0,
                    fillStyle: "0x5555AA",
                },
                "rectangle": {
                    lineWidth: 0,
                    fillStyle: "0x5555AA",
                    alpha: 1
                }
            }
        });

        this.height = 600;
        this.width = 800;

        this.world = Physics();
        this.world.add(this.renderer);

        for(var i=0; i<100;i++) {
            this.world.add(
                Physics.body("circle", {
                    x: Math.random() * 500,
                    y: Math.random() * 500,
                    radius: 3
                })
            );
        }

        this.world.on("step", this.render.bind(this));
        Physics.util.ticker.on(function (time, dt) {
            this.world.step(time);
        }.bind(this));
        Physics.util.ticker.start();
    }

    addScatterPlot(dataStore, title) {
        new ScatterPlot(this.world, this.renderer.stage, dataStore, title);
    }

    addBarChart(dataset, features, title) {
        new BarChart(this.world, this.renderer.stage, dataset, features, title, this.barChartParticles);
    }

    reset() {
        this.renderer.stage.removeChildren();
    }

    render() {
        this.world.render();
    }
}
