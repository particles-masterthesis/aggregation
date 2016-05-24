import "pixi.js";
import "fpsmeter";
import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";

export default class Canvas {

    constructor() {
        //windowH height - menu height - css-paddings
        this.height = window.innerHeight - 90;
        //windowH width - css-paddings
        this.width = window.innerWidth - 40;

        // arguments: width, height, view, transparent, antialias
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            backgroundColor: 0xF8F8F8,
            clearBeforeRender: true
        }, true, true);

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

        this.barChartParticles = true;
    }

    reset() {
        this.stage.removeChildren();

        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    addVisualization(width, height, origin){
        let container = new PIXI.Container();
        container.width = width;
        container.height = height;
        container.x = origin.x;
        container.y = origin.y;
        this.stage.addChild(container);
        return container;
    }

    addScatterPlot(dataStore, title) {
        let container = this.addVisualization(
            this.width,
            this.height,
            new PIXI.Point(0,0)
        );
        new ScatterPlot(container, dataStore, title);
    }

    addBarChart(dataset, features, title) {
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        new BarChart(container, dataset, features, title, this.barChartParticles);
    }

    render() {
        this.renderer.render(this.stage);
        // this.FPSMeter.tick();
        // this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }
}
