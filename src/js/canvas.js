/* jshint esversion: 6 */

import "pixi.js";
import "fpsmeter";
import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";
import PhysicsJS from "./diagram/physics-js";

var Physics = require("./../../node_modules/physicsjs/dist/physicsjs-full");

export default class Canvas {

    constructor() {
        //windowH height - menu height - css-paddings
        this.height = window.innerHeight - 10;
        //windowH width - css-paddings
        this.width = window.innerWidth - 40;

        this.requestFrameID = null;
        this.barChartParticles = true;

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

        /**
         * Init Physics JS
         */

        this.renderer = Physics.renderer("pixi", {
            el: "canvas-container",
            width: 600,
            height: 400,
            meta: true,
            styles: {
                "circle": {
                    strokeStyle: "#351024",
                    lineWidth: 1,
                    fillStyle: "#d33682",
                    angleIndicator: "#351024"
                }
            }
        });

        this.world = Physics();
        this.world.add(this.renderer);
        this.world.on("step", this.render.bind(this));
    }

    draw(dataset){
        var viewportBounds = Physics.aabb(0, 0, 600, 400);
        this.world.add(Physics.behavior("edge-collision-detection", {
            aabb: viewportBounds,
            restitution: 0.99,
            cof: 0.99
        }));

        var x = null, y = null;

        for (let i = 0; i < dataset.length; i++) {
            x = Math.abs(parseFloat(dataset[i].Longitude));
            y = Math.abs(parseFloat(dataset[i].Latitude));

            this.world.add(
                Physics.body("circle", {
                    x: x*2,
                    y: y*2,
                    vx: 0.01, // velocity in x-direction
                    vy: 0.001, // velocity in y-direction
                    radius: 5
                })
            );
        }

        // ensure objects bounce when edge collision is detected
        this.world.add(Physics.behavior("body-impulse-response"));

        // add some gravity
        this.world.add(Physics.behavior("constant-acceleration"));

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time, dt) {
            this.world.step(time);
        }.bind(this));

        Physics.util.ticker.start();
    }

    reset() {
    }

    render() {
        this.world.render();
    }
}
