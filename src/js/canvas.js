/* jshint esversion: 6 */

import "pixi.js";
import "fpsmeter";
import ScatterPlot from "./diagram/scatterPlot";
import BarChart from "./diagram/barChart";

export default class Canvas {

    constructor() {
        this.height = window.innerHeight - 90; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 40; //windowH width - css-paddings

        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            backgroundColor: 0xF8F8F8,
            clearBeforeRender: true
        });

        this.stage = new PIXI.Container();

        this.labels = {
            x: new PIXI.Text("X", {
                font: "14px Arial"
            }),
            y: new PIXI.Text("Y", {
                font: "14px Arial"
            }),
            title: new PIXI.Text("Title", {
                font: "16px Arial"
            })
        };

        this.FPSMeter = new FPSMeter({
            "theme": "light",
            "graph": 1,
            "position": "absolute",
            "zIndex": 10,
            "left": "auto",
            "right": "6px",
            "margin": "0 0 0 0",
            "top": "6px"
        });

        this.requestFrameID = null;

        this.diagrams = [];
    }

    reset() {
        this.stage.removeChildren();

        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    addScatter(dataset, features, boundaries, title) {
        var container = new PIXI.Container();
        container.width = this.width;
        container.height = this.height;
        container.x = container.y = 0;
        this.stage.addChild(container);

        new ScatterPlot(container, dataset, features, boundaries, title);
    }

    render() {
        this.renderer.render(this.stage);
        this.FPSMeter.tick();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }
}
