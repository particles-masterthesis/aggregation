/* jshint esversion: 6 */

import "pixi.js";
import "fpsmeter";
import ScatterPlot from "./diagram/scatter-plot";
import BarChart from "./diagram/bar-chart";
import PhysicsJS from "./diagram/physics-js";

var Physics = require("./../../node_modules/physicsjs/dist/physicsjs-full");

export default class Canvas {

    constructor() {
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
            meta: false,
            styles: {
                "circle": {
                    strokeStyle: "0x1d6b98",
                    lineWidth: 1,
                    fillStyle: "0x14546f",
                    angleIndicator: "0xa42222",
                    alpha: 1
                }
            }
        });

        this.height = this.renderer.el.firstChild.clientHeight + 90;
        this.width = this.renderer.el.firstChild.clientWidth + 40;

        this.world = Physics();
        this.world.add(this.renderer);
        this.world.on("step", this.render.bind(this));
    }

    draw(dataset) {
        var viewportBounds = Physics.aabb(0, 0, this.width, this.height);
        this.world.add(Physics.behavior("edge-collision-detection", {
            aabb: viewportBounds,
            restitution: 0,         // How "bouncy" is the body
            cof: 1                  // Coefficient of friction
        }));

        var x = null, y = null;

        for (let i = 0; i < 20; i++) {
            x = Math.abs(parseFloat(dataset[i].Longitude));
            y = Math.abs(parseFloat(dataset[i].Latitude));

            this.world.add(
                Physics.body("circle", {
                    x: x * 10,
                    y: y * 10,
                    radius: 10,
                    restitution: 0,
                    cof: 1
                })
            );
        }

        // add some collision detection
        this.world.add(Physics.behavior("body-collision-detection"));

        // this massively improves the speed of collision detection
        this.world.add(Physics.behavior("sweep-prune"));

        // ensure objects bounce when collision is detected
        this.world.add(Physics.behavior("body-impulse-response"));

        // add some gravity
        // this.world.add(Physics.behavior("constant-acceleration"));

        // add some interactivity
        this.world.add(Physics.behavior("interactive", {el: this.renderer.container}));

        this.world.add(Physics.behavior("attractor", {
            strength: 10,
            min: 50,
            pos: {"x": 700, "y": 450}
        }));

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
