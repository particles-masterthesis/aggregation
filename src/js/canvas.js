import "pixi.js";
import "fpsmeter";

import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";
import DotMap from "./diagram/dot-map";
import { bbox } from './bbox';

export default class Canvas {

    constructor() {
        //windowH height - menu height - css-paddings
        this.height = window.innerHeight - 90;
        //windowH width - css-paddings
        this.width = window.innerWidth - 40;

        // arguments: width, height, view, transparent, antialias
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            transparent: true,
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

    addDotMap(dataStore, title){

        let projection = d3.geo.albersUsa()
            .scale(1400)
            .translate([this.width / 2, this.height / 2]);

        let path = d3.geo.path()
            .projection(projection);

        let svg = d3.select("body").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        d3.json(`${location.origin}/dist/dataset/topojson/us.json`, function(error, us) {
          if (error) throw error;

          svg.insert("path", ".graticule")
              .datum(topojson.feature(us, us.objects.land))
              .attr("class", "land")
              .attr("d", path);

          // svg.insert("path", ".graticule")
          //     .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
          //     .attr("class", "county-boundary")
          //     .attr("d", path);

          // svg.insert("path", ".graticule")
          //     .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          //     .attr("class", "state-boundary")
          //     .attr("d", path);
        });

        d3.select(self.frameElement).style("height", this.height + "px");

    }

    render() {
        this.renderer.render(this.stage);
        // this.FPSMeter.tick();
        // this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }
}
