import "pixi.js";

import {Stats} from 'stats.js';

import Overview from "./visualization/overview/overview";
import Particle from "./visualization/particle";
import ParticlesContainer from "./visualization/particlesContainer";

import ScatterPlot from "./visualization/chart/scatter-plot";
import BarChart from "./visualization/chart/bar-chart";

import DotMap from "./visualization/map/dot-map";
import ProportionalSymbolMap from "./visualization/map/proportional-symbol-map";
import ChoroplethMap from "./visualization/map/choropleth-map";
import Cartogram from "./visualization/map/cartogram";

export default class Canvas {

    constructor(dataset, features) {
        this.useBars = false;
        this.levelOfDetail = 'country';
        this.colorScheme = 'Oranges';
        this.requestFrameID = null;

        this.particles = {
            shape: "rectangle"
        };

        this.height = window.innerHeight - 90; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 40; //windowH width - css-paddings

        // arguments: width, height, view, transparent, antialias
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            transparent: true,
            clearBeforeRender: true,
            antialias: true
        });
        document.body.appendChild(this.renderer.view);

        this.stage = new PIXI.Container();

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);
        this.stats.dom.style.cssText = "position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;height:48px;width:100px;";

        // Can't use particle container from pixi because it doesn't support interactivity
        // our container handles also the placing, transitions and animations
        this.particlesContainer = new ParticlesContainer();
        this.stage.addChild(this.particlesContainer);

        // Layout during transition
        this.isCleaningNecessary = false;
    }

    createParticles(dataset) {
        if (this.particlesContainer.children.length === 0) {

            let texture, textureHover;

            if (this.particles.shape === "rectangle") {
                texture = PIXI.Texture.fromImage("dist/img/particle.png");
                textureHover = PIXI.Texture.fromImage("dist/img/particle_hover.png");
            } else {
                texture = PIXI.Texture.fromImage("dist/img/particle_circle.png");
                textureHover = PIXI.Texture.fromImage("dist/img/particle_circle_hover.png");
            }

            let callbackAdd = data => () => this.toggleDataRow(data);
            let callbackRemove = () => () => {
                if (document.getElementById("dataRow")) {
                    document.body.removeChild(document.getElementById("dataRow"));
                }
            };

            for (let i = 0; i < dataset.length; i++) {
                let sprite = new Particle(texture, textureHover, dataset[i], 0, 0, 3, 3);
                sprite.on("mouseover", callbackAdd(sprite.data));
                sprite.on("mouseout", callbackRemove());
                this.particlesContainer.addChild(sprite);
            }

            this.particlesContainer.interactive = true;
            this.stage.interactive = true;

            return true;
        }
        else {
            return false;
        }
    }

    toggleDataRow(data) {
        var table = document.getElementById("dataRow");
        table = table ? document.body.removeChild(table) : document.createElement('table');

        var features = Object.keys(data);

        let tmp = features.splice(0, Math.round(features.length / 2));
        let tmp2 = features.splice(0, features.length);

        var text = "<tr>";
        tmp.forEach(function (key) {
            text += `<th>${key}</th>`;
        });
        text += "</tr><tr>";
        tmp.forEach(function (key) {
            text += `<td>${data[key]}</td>`;
        });
        text += "</tr><tr>";

        tmp2.forEach(function (key) {
            text += `<th>${key}</th>`;
        });
        text += "</tr><tr>";
        tmp2.forEach(function (key) {
            text += `<td>${data[key]}</td>`;
        });
        text += "</tr>";

        table.innerHTML = text;
        table.id = "dataRow";
        document.body.appendChild(table);
    }

    removeParticles() {
        this.particlesContainer.removeChildren();
    }

    prepareCanvas() {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();

        // Only remove the vizualization if we don't need it any more
        // for transitions with layout != in place we need the viz as optical source
        if (transitionType === "none" || transitionLayout === "inPlace") {
            this.removeVisualization();
        }
    }

    removeVisualization() {
        // Because barchart creates a x axis which should be also removed after that function call
        if (document.getElementById("x-axis")) {
            document.body.removeChild(document.getElementById("x-axis"));
        }

        this.stage.removeChild(this.visualization);
    }

    reset() {
        this.removeParticles();
        this.removeVisualization();
    }

    clean() {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();

        if (this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {

            // Remove old visualization
            this.stage.removeChild(this.visualizationOld);
            document.body.removeChild(document.getElementById("x-axis-old"));

            // Change appearance of the new visualization
            this.visualization.scale.x = 1;
            this.visualization.scale.y = 1;
            this.visualization.x = 0;
            this.visualization.y = 0;

            document.getElementById("x-axis").style.transform = "scale(1) translate(0,0)";

            if (transitionLayout === "juxtaposition") {
                let particle;
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    particle.width = particle._width * 2;
                    particle.height = particle._height * 2;
                    particle.position.x = particle.position.x * 2 - this.width;
                    particle.position.y = particle.position.y * 2;
                }
            } else if (transitionLayout === "stacked") {
                let particle;
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    particle.width = particle._width * 2;
                    particle.height = particle._height * 2;
                    particle.position.x = particle.position.x * 2 - this.width / 2;
                    particle.position.y = particle.position.y *2 - this.height;
                }
            }
        }

        this.isCleaningNecessary = false;
        console.log("CLEANED");
    }

    drawParticles(dataset) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new Overview(this.width, this.height, this.particlesContainer, placeParticlesDirectly);
        this.particlesContainer.startAnimation();
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawBarChart(dataset, schema, features, title) {

        // TODO currently all the following stuff is not animated - but it should be animated!

        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.createParticles(dataset);


        /**
         * Move the current visualization to the left or to the top
         */
        if (!areParticlesNew && this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {

            this.visualization.scale.x = 0.5;
            this.visualization.scale.y = 0.5;
            let xAxisOld = document.getElementById("x-axis");

            if (transitionLayout === "juxtaposition") {
                this.visualization.x = 0;
                this.visualization.y = 0;

                xAxisOld.style.transform = "scale(0.5) translate(-" + this.width * 0.5 + "px,-" + this.height * 0.5 + "px)";
                xAxisOld.id = "x-axis-old";

                let particle;
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    particle.width = particle._width / 2;
                    particle.height = particle._height / 2;
                    particle.position.x = particle.position.x - particle.position.x / 2;
                    particle.position.y = particle.position.y - particle.position.y / 2;
                }
            } else if (transitionLayout === "stacked") {
                this.visualization.x = this.width / 4;
                this.visualization.y = 0;

                xAxisOld.style.transform = "scale(0.5) translate(0px,-" + this.height * 0.5 + "px)";
                xAxisOld.id = "x-axis-old";

                let particle;
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    particle.width = particle._width / 2;
                    particle.height = particle._height / 2;
                    particle.position.x = particle.position.x - particle.position.x / 2 + this.width / 4;
                    particle.position.y = particle.position.y - particle.position.y / 2;
                }
            }

            this.isCleaningNecessary = true;
        }

        /**
         * Create the new visualization
         */

        let barChart = new BarChart(this.width, this.height, this.particlesContainer, {
            schema,
            features,
            title
        });

        /**
         * Move the new visualization to the right or to the bottom
         */
        if (!areParticlesNew && this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {
            barChart.scale.x = 0.5;
            barChart.scale.y = 0.5;

            if (transitionLayout === "juxtaposition") {
                barChart.x = this.width / 2;
                barChart.y = 0;

                let xAxis = document.getElementById("x-axis");
                xAxis.style.transform = "scale(0.5) translate(" + this.width * 0.5 + "px,-" + this.height * 0.5 + "px)";
            } else if (transitionLayout === "stacked") {
                barChart.x = this.width / 4;
                barChart.y = this.height / 2;

                let xAxis = document.getElementById("x-axis");
                xAxis.style.transform = "scale(0.5) translate(0px," + this.height * 0.5 + "px)";
            }
        }

        barChart.drawParticles(this.useBars, areParticlesNew);

        if (!areParticlesNew && this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {
            let particle;

            if (transitionLayout === "juxtaposition") {
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    particle.aimedSize.width = particle.aimedSize.width / 2;
                    particle.aimedSize.height = particle.aimedSize.height / 2;
                    particle.destination.x = particle.destination.x - particle.destination.x / 2 + this.width / 2;
                    particle.destination.y = particle.destination.y - particle.destination.y / 2;
                }
            } else if (transitionLayout === "stacked") {
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    particle.aimedSize.width = particle.aimedSize.width / 2;
                    particle.aimedSize.height = particle.aimedSize.height / 2;
                    particle.destination.x = particle.destination.x - particle.destination.x / 2 + this.width / 4;
                    particle.destination.y = particle.destination.y - particle.destination.y / 2 + this.height / 2;
                }
            }
        }

        if (this.visualization) {
            this.visualizationOld = this.visualization;
        }

        this.visualization = barChart;
        this.stage.addChild(this.visualization);

        this.particlesContainer.startAnimation();
        return this.visualization;

    }

    drawScatterPlot(dataStore, title) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new ScatterPlot(this.width, this.height, this.particlesContainer, dataStore, placeParticlesDirectly, title);
        this.particlesContainer.startAnimation();
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawDotMap(dataset, isCurrentVisualization) {
        this.reset();
        this.createParticles(dataset);

        if (isCurrentVisualization) {
            this.visualization.updateBaseMap(this.levelOfDetail);
            this.visualization.drawDots(this.particlesContainer);
            return this.visualization;
        }

        this.visualization = new DotMap(
            this.width,
            this.height,
            this.particlesContainer.children,
            this.levelOfDetail
        );
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawProportionalSymbolMap(dataset, isCurrentVisualization) {
        this.reset();
        this.createParticles(dataset);

        if (isCurrentVisualization) {
            this.visualization.update(this.levelOfDetail);
            return this.visualization;
        }

        this.visualization = new ProportionalSymbolMap(
            this.width,
            this.height,
            this.particlesContainer.children,
            this.levelOfDetail
        );
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawChoroplethMap(dataset, isCurrentVisualization) {
        this.reset();
        this.createParticles(dataset);

        if (isCurrentVisualization) {
            this.visualization.update(this.levelOfDetail, this.colorScheme);
            return this.visualization;
        }

        this.visualization = new ChoroplethMap(
            this.width,
            this.height,
            this.particlesContainer.children,
            this.levelOfDetail,
            this.colorScheme
        );
        return this.visualization;
    }

    drawCartogram(dataset, isCurrentVisualization) {
        this.reset();
        this.createParticles(dataset);

        if (isCurrentVisualization) {
            this.visualization.update(this.levelOfDetail);
            return this.visualization;
        }

        this.visualization = new Cartogram(
            this.width,
            this.height,
            this.particlesContainer.children,
            this.levelOfDetail
        );
        return this.visualization;
    }

    stop() {
        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    render() {
        this.stats.begin();

        if (!this.particlesContainer.nextStep() && this.isCleaningNecessary) {
            this.clean();
        }

        this.renderer.render(this.stage);

        this.stats.end();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }

}
