import "pixi.js";

import {Stats} from "stats.js";

import Overview from "./visualization/overview/overview";
import Particle from "./visualization/particle";
import ParticlesContainer from "./visualization/particlesContainer";

import ScatterPlot from "./visualization/chart/scatter-plot";
import BarChart from "./visualization/chart/bar-chart";

import DotMap from "./visualization/map/dot-map";
import ProportionalSymbolMap from "./visualization/map/proportional-symbol-map";
import ChoroplethMap from "./visualization/map/choropleth-map";
import Cartogram from "./visualization/map/cartogram";

import Queue from "./queue";

function isFunction(cb) {
    return cb && ({}).toString.call(cb) === "[object Function]";
}

export default class Canvas {

    constructor(dataset, features) {
        this.useBars = false;
        this.levelOfDetail = "country";
        this.colorScheme = "Oranges";
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

        this.animationQueue = new Queue();
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

    drawParticles(dataset) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new Overview(this.width, this.height, this.particlesContainer, placeParticlesDirectly);
        this.particlesContainer.startAnimation();
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    moveNewVisualizationForTransition(visualization, areParticlesNew, transitionType, transitionLayout) {
        if (!areParticlesNew && this.visualization && transitionType != "none") {
            if (transitionLayout === "juxtaposition") {
                this.moveVisualization(visualization, "right", "none");
            } else if (transitionLayout === "stacked") {
                this.moveVisualization(visualization, "bottom", "none");
            }
        }
    }

    moveOldVisualizationForTransition(visualization, areParticlesNew, transitionType, transitionLayout) {
        if (!areParticlesNew && visualization && transitionType != "none") {
            if (transitionLayout === "juxtaposition") {
                this.moveVisualization(visualization, "left", "none");
            } else if (transitionLayout === "stacked") {
                this.moveVisualization(visualization, "top", "none");
            }

            this.isCleaningNecessary = true;
        }
    }

    moveParticlesDestination(visualization, areParticlesNew, transitionType, transitionLayout) {
        if (!areParticlesNew && this.visualization && transitionType != "none" &&
            transitionLayout === "juxtaposition" || transitionLayout === "stacked") {

            let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(visualization);
            this.particlesContainer.moveParticlesDestinationOnBasisOfLayout(
                this.width,
                this.height,
                transitionType === "juxtaposition" ? "right" : "bottom",
                width,
                yTranslate,
                ratio
            );
        }
    }

    moveVisualization(visualization, place, transition) {
        let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(visualization);

        if (place === "left" || place === "right") {

            visualization.transitionTo(
                place === "right" ? this.width / 2 : 0,
                this.height / 4,
                0.5,
                0.5,
                transition
            );

        } else if (place === "top" || place === "bottom") {

            visualization.transitionTo(
                // set the visualization to the middle and half the new width to the left
                this.width / 2 - visualization._width * ratio / 2,
                // move the visualization slightly outside of the allowed area
                // because we don't need the blank space on the top of the viz
                place === "bottom" ? -yTranslate * ratio + this.height / 2 : -yTranslate * ratio,
                ratio,
                ratio,
                transition
            );
        }

        // The particles should move also the left or the top
        this.particlesContainer.moveParticlesOnBasisOfLayout(place, "none", {
            "x": visualization.x,
            "y": visualization.y
        }, yTranslate, ratio);
    }

    calculateTranslationLayoutValues(visualization) {
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

    automaticallySortParticles(oldFeature) {
        // If the sorting of the particles should be automatic be by the last chosen attribute
        // we have to sort it before we start the transition
        if ($("select.sort-type").val() === "automatically") {
            let oldFeature = oldFeature || $("select.feature-x").children(":selected")[0].innerHTML;

            $("select.sort-by option").filter(function (index) {
                return $(this).text() === oldFeature;
            }).prop("selected", true);

            this.particlesContainer.children.sortBy(oldFeature, "data");
        }
    }

    changeSorting(feature) {
        this.particlesContainer.children.sortBy(feature, "data");
        this.visualization.drawParticles(this.useBars, false);
    }

    toggleDataRow(data) {
        var table = document.getElementById("dataRow");
        table = table ? document.body.removeChild(table) : document.createElement("table");

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

    drawBarChart(dataset, schema, features, oldFeatureX, title) {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.createParticles(dataset);

        this.automaticallySortParticles(oldFeatureX);

        this.visualizationOld = this.visualization ? this.visualization : null;
        this.visualization = new BarChart(this.width, this.height, this.particlesContainer, {
            schema,
            features,
            title
        });
        this.visualization.drawData(this.useBars, areParticlesNew);

        // First step
        this.animationQueue.push(() => {
            this.moveOldVisualizationForTransition(this.visualizationOld, areParticlesNew, transitionType, transitionLayout);
        });

        // Second step
        this.animationQueue.push(() => {
            this.moveNewVisualizationForTransition(this.visualization, areParticlesNew, transitionType, transitionLayout);
            this.stage.addChild(this.visualization);
            this.moveParticlesDestination(barChart, areParticlesNew, transitionType, transitionLayout)
        });

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

    drawDotMap(dataset, isCurrentVisualization, animationCb) {
        this.createParticles(dataset);
        if (isCurrentVisualization) {
            this.visualization.updateBaseMap(this.levelOfDetail);
            this.visualization.drawDots(this.particlesContainer.children);
            return this.visualization;
        }

        this.visualization = new DotMap(
            this.width,
            this.height,
            this.particlesContainer,
            this.levelOfDetail,
            animationCb
        );
        this.stage.addChild(this.visualization);
        this.particlesContainer.startAnimation();
        return this.visualization;
    }

    drawProportionalSymbolMap(dataset, isCurrentVisualization, animationCb) {
        if (!isFunction(animationCb)) {
            this.reset();
            this.createParticles(dataset);
        }

        if (isCurrentVisualization) {
            this.visualization.update(this.levelOfDetail);
            return this.visualization;
        }

        this.visualization = new ProportionalSymbolMap(
            this.width,
            this.height,
            this.particlesContainer,
            this.levelOfDetail,
            animationCb
        );
        this.stage.addChild(this.visualization);

        this.particlesContainer.startAnimation();
        return this.visualization;
    }

    drawChoroplethMap(dataset, isCurrentVisualization, animationCb) {
        if (!isFunction(animationCb)) {
            this.reset();
            this.createParticles(dataset);
        }

        if (isCurrentVisualization) {
            this.visualization.update(this.levelOfDetail, this.colorScheme);
            return this.visualization;
        }

        this.visualization = new ChoroplethMap(
            this.width,
            this.height,
            this.particlesContainer,
            this.levelOfDetail,
            this.colorScheme,
            animationCb
        );

        this.particlesContainer.startAnimation();
        return this.visualization;
    }

    drawCartogram(dataset, isCurrentVisualization, animationCb) {
        if (!isFunction(animationCb)) {
            this.reset();
            this.createParticles(dataset);
        }

        if (isCurrentVisualization) {
            this.visualization.update(this.levelOfDetail);
            return this.visualization;
        }

        this.visualization = new Cartogram(
            this.width,
            this.height,
            this.particlesContainer,
            this.levelOfDetail,
            animationCb
        );

        this.particlesContainer.startAnimation();
        return this.visualization;
    }

    removeVisualization() {
        this.stage.removeChild(this.visualization);
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

    cleanLayout() {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();

        if (this.visualization && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {

            this.stage.removeChild(this.visualizationOld);
            let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(this.visualization);

            this.visualization.scale.x = this.visualization.scale.y = 1;
            this.visualization.x = this.visualization.y = 0;

            this.particlesContainer.moveBackParticlesOnBasisOfLayout(
                this.width,
                this.height,
                transitionLayout === "juxtaposition" ? "right" : "bottom",
                width,
                yTranslate,
                ratio
            );
        }

        this.isCleaningNecessary = false;
    }

    reset() {
        this.removeParticles();
        this.removeVisualization();
    }

    stop() {
        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    render() {
        this.stats.begin();

        let areParticlesAnimating = this.particlesContainer.nextStep();
        let areVisualizationsAnimating = this.visualization.nextStep();

        // Get the next job when there is one and the last job finished
        if(!areParticlesAnimating && !areVisualizationsAnimating && this.animationQueue.length > 0){
            this.animationQueue.pop()();
            this.particlesContainer.startAnimation();
            this.visualization.startAnimation();
        }

        // Clean layout then the animations are finished, the queue is empty and the cleaning is necessary
        if (!areParticlesAnimating && !areVisualizationsAnimating && this.animationQueue.length === 0 && this.isCleaningNecessary) {
            this.cleanLayout()
        }

        this.renderer.render(this.stage);

        this.stats.end();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }

}
