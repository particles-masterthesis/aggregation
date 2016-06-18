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

        this.height = window.innerHeight - 142; //windowH height - menu height - css-paddings
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

            // the scales of the viz contains the scaling ratio
            let ratio = this.visualization.scale.x;

            // Change appearance of the new visualization
            this.visualization.scale.x = 1;
            this.visualization.scale.y = 1;
            this.visualization.x = 0;
            this.visualization.y = 0;

            if (transitionLayout === "juxtaposition") {
                let particle;
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    if(particle.alpha === 0) {
                        continue;
                    }
                    particle.width = particle._width * 2;
                    particle.height = particle._height * 2;
                    particle.position.x = particle.position.x * 2 - this.width;
                    particle.position.y = (particle.position.y - this.height / 4) * 2;
                }
            } else if (transitionLayout === "stacked") {
                let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(this.visualization);

                let particle;
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    if(particle.alpha === 0) {
                        continue;
                    }
                    particle.width = particle._width / ratio;
                    particle.height = particle._height / ratio;
                    particle.position.x = (particle.position.x + width / 2 - this.width / 2) / ratio;
                    particle.position.y = (particle.position.y + yTranslate * ratio - this.height / 2) / ratio;
                }
            }
        }

        this.isCleaningNecessary = false;
    }

    calculateTranslationLayoutValues(visualization){
        // height of visualization + labels
        let height = visualization.padding * 2 + visualization.heightVisualization;

        // place for the visualization at the screen
        let possibleHeight = this.height / 2;

        // how much we can scale the visualization, scale can be 1 <= 0
        let ratio = Math.min(possibleHeight / height, 1);

        // calculate how much blank space there is
        let yTranslate = this.height - height;

        // calculate the new width
        let width = this.width * ratio;

        return {
            height,
            width,
            ratio,
            yTranslate
        };
    }

    drawParticles(dataset) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new Overview(this.width, this.height, this.particlesContainer, placeParticlesDirectly);
        this.particlesContainer.startAnimation();
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    moveVisualization(visualization, place){
        let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(visualization);

        if (place === "left" || place === "right") {
            visualization.x = 0;
            visualization.y = this.height / 4;
            visualization.scale.x = 0.5;
            visualization.scale.y = 0.5;

            if(place === "right"){
                visualization.x += this.width/2;
            }
        } else if (place === "top" || place === "bottom") {
            // set the visualization to the middle and half the new width to the left
            visualization.x = this.width / 2 - visualization._width * ratio / 2;

            // move the visualization slightly outside of the allowed area
            // because we don't need the blank space on the top of the viz
            visualization.y = -yTranslate * ratio;
            visualization.scale.x = ratio;
            visualization.scale.y = ratio;

            if(place === "bottom"){
                visualization.y += this.height / 2;
            }
        }

        // The particles should move also the left or the right
        if(place === "left"){
            let particle;
            for (let i = 0; i < this.particlesContainer.children.length; i++) {
                particle = this.particlesContainer.children[i];
                if(particle.alpha === 0) {
                    continue;
                }
                particle.width = particle._width / 2;
                particle.height = particle._height / 2;
                particle.position.x = particle.position.x - particle.position.x / 2;
                particle.position.y = visualization.y + particle.position.y / 2;
            }
        }

        if(place === "top"){
            let particle;
            for (let i = 0; i < this.particlesContainer.children.length; i++) {
                particle = this.particlesContainer.children[i];
                if(particle.alpha === 0) {
                    continue;
                }
                particle.width = particle._width * ratio;
                particle.height = particle._height * ratio;
                particle.position.x = visualization.x + particle.position.x * ratio;
                particle.position.y = particle.position.y * ratio - yTranslate * ratio;
            }
        }
    }

    drawBarChart(dataset, schema, features, oldFeatureX, title) {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.createParticles(dataset);

        // If the sorting of the particles should be automatic be by the last chosen attribute
        // we have to sort it before we start the transition
        if ($("select.sort-type").val() === "automatically") {
            let oldFeature = oldFeatureX || $("select.feature-x").children(":selected")[0].innerHTML;

            $("select.sort-by option").filter(function (index) {
                return $(this).text() === oldFeatureX;
            }).prop('selected', true);

            this.particlesContainer.children.sortBy(oldFeature, "data");
        }

        /**
         * Move the old visualization to the left or to the top
         */
        if (!areParticlesNew && this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {

            if (transitionLayout === "juxtaposition") {
                this.moveVisualization(this.visualization, "left");
            } else if (transitionLayout === "stacked") {
                this.moveVisualization(this.visualization, "top");
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

            if (transitionLayout === "juxtaposition") {
                this.moveVisualization(barChart, "right");
            } else if (transitionLayout === "stacked") {
                this.moveVisualization(barChart, "bottom");
            }
        }

        barChart.drawParticles(this.useBars, areParticlesNew);

        if (!areParticlesNew && this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {
            let particle;

            if (transitionLayout === "juxtaposition") {
                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    if(particle.alpha === 0) {
                        continue;
                    }
                    particle.aimedSize.width = particle.aimedSize.width / 2;
                    particle.aimedSize.height = particle.aimedSize.height / 2;
                    particle.destination.x = particle.destination.x - particle.destination.x / 2 + this.width / 2;
                    particle.destination.y = particle.destination.y - particle.destination.y / 2 + this.height / 4;
                }
            } else if (transitionLayout === "stacked") {
                let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(barChart);

                for (let i = 0; i < this.particlesContainer.children.length; i++) {
                    particle = this.particlesContainer.children[i];
                    if(particle.alpha === 0) {
                        continue;
                    }
                    particle.aimedSize.width = particle.aimedSize.width * ratio;
                    particle.aimedSize.height = particle.aimedSize.height * ratio;
                    particle.destination.x = this.width / 2 - width / 2 + particle.destination.x * ratio;
                    particle.destination.y = this.height / 2 + particle.destination.y * ratio - yTranslate * ratio;
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

    changeSorting(feature) {
        this.particlesContainer.children.sortBy(feature, "data");
        this.visualization.drawParticles(this.useBars, false);
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
