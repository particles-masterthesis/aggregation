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
        this.height = window.innerHeight - 90;
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
            width: this.width,
            height: this.height,
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
        this.draw();
    }

    draw(){
        var viewportBounds = Physics.aabb(0, 0, this.width, this.height);
        this.world.add(Physics.behavior("edge-collision-detection", {
            aabb: viewportBounds,
            restitution: 0.99,
            cof: 0.99
        }));

        // constrain objects to these bounds
        this.world.add(
            Physics.body("circle", {
                x: 50,
                y: 30,
                vx: 1.6, // velocity in x-direction
                vy: 0.08, // velocity in y-direction
                radius: 20
            })
        );

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
        this.world.removeChildren();
        this.world.on("step", null);
    }

    render() {
        this.world.render();
    }
}
