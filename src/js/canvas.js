import "pixi.js";

import {Stats} from "stats.js";

import Overview from "./visualization/overview/overview";
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
            "speedPxPerFrame": 2,
            "arrivalSync": false,
            "shape": "rectangle",
            "sizeOfParticles": 4        // Only for scatter-plot relevant
        };

        this.height = window.innerHeight - 142; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 285; //windowH width - css-paddings

        // arguments: width, height, view, transparent, antialias
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            transparent: true,
            clearBeforeRender: true,
            antialias: true
        });
        document.body.appendChild(this.renderer.view);

        this.stage = new PIXI.Container();
        this.stage.interactive = true;

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);
        this.stats.dom.style.cssText = "position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;height:48px;width:100px;";

        // Can't use particle container from pixi because it doesn't support interactivity
        // our container handles also the placing, transitions and animations
        this.particlesContainer = new ParticlesContainer();
        this.particlesContainer.interactive = true;
        this.stage.addChild(this.particlesContainer);

        // Layout during transition
        this.isCleaningNecessary = false;

        this.animationQueue = new Queue();
    }

    moveVisualization(visualization, place, transition) {
        let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(visualization);

        if (place === "left" || place === "right") {

            visualization.transitionTo(
                place === "right" ? this.width / 2 : 0,
                this.height / 4,
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
                transition
            );

        } else if (place === "default") {

            visualization.transitionTo(
                0,
                0,
                1,
                transition
            );

        }
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
        this.visualization.drawData(this.useBars, false);
    }

    drawParticles(dataset) {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.particlesContainer.createParticles(dataset, this.particles);

        this.visualizationOld = this.visualization ? this.visualization : null;
        this.visualization = new Overview(this.width, this.height, this.particlesContainer);

        this.animationQueue.push(() => {
            this.minimizeOldVisualization(areParticlesNew, transitionType, transitionLayout);
        });

        this.animationQueue.push(() => {
            this.moveNewVisualization(areParticlesNew, transitionType, transitionLayout);
            this.stage.addChild(this.visualization);
            this.visualization.drawData(areParticlesNew);
            this.moveParticlesDestination(areParticlesNew, transitionType, transitionLayout);

            // After defining the destination we have to calculate the speed for the particles
            // so the reach at the same time their destination
            if (this.particles.arrivalSync) this.particlesContainer.calculateSpeedArrivingSameTime();
        });

        this.animationQueue.push(() => {
            this.cleanLayout();
        });

        return this.visualization;
    }

    drawBarChart(dataset, schema, features, oldFeatureX, title) {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.particlesContainer.createParticles(dataset, this.particles);

        this.automaticallySortParticles(oldFeatureX);

        this.visualizationOld = this.visualization ? this.visualization : null;
        this.visualization = new BarChart(this.width, this.height, this.particlesContainer, {
            schema,
            features,
            title
        });

        this.animationQueue.push(() => {
            this.minimizeOldVisualization(areParticlesNew, transitionType, transitionLayout);
        });

        this.animationQueue.push(() => {
            this.moveNewVisualization(areParticlesNew, transitionType, transitionLayout);
            this.stage.addChild(this.visualization);
            this.visualization.drawData(this.useBars, areParticlesNew);
            this.moveParticlesDestination(areParticlesNew, transitionType, transitionLayout);

            // After defining the destination we have to calculate the speed for the particles
            // so the reach at the same time their destination
            if (this.particles.arrivalSync) this.particlesContainer.calculateSpeedArrivingSameTime();
        });

        this.animationQueue.push(() => {
            this.cleanLayout();
        });

        return this.visualization;
    }

    drawScatterPlot(dataset, schema, features, title) {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.particlesContainer.createParticles(dataset, this.particles);

        this.visualizationOld = this.visualization ? this.visualization : null;
        this.visualization = new ScatterPlot(this.width, this.height, this.particlesContainer, {
            schema,
            features,
            title,
            sizeParticles: this.particles.sizeOfParticles
        });

        this.animationQueue.push(() => {
            this.minimizeOldVisualization(areParticlesNew, transitionType, transitionLayout);
        });

        this.animationQueue.push(() => {
            this.moveNewVisualization(areParticlesNew, transitionType, transitionLayout);
            this.stage.addChild(this.visualization);
            this.visualization.drawData(areParticlesNew);
            this.moveParticlesDestination(areParticlesNew, transitionType, transitionLayout);

            // After defining the destination we have to calculate the speed for the particles
            // so the reach at the same time their destination
            if (this.particles.arrivalSync) this.particlesContainer.calculateSpeedArrivingSameTime();
        });

        this.animationQueue.push(() => {
            this.cleanLayout();
        });

        return this.visualization;
    }

    drawDotMap(dataset, animationCb) {
        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();
        let areParticlesNew = this.particlesContainer.createParticles(dataset, this.particles);

        this.visualizationOld = this.visualization ? this.visualization : null;
        this.visualization = new DotMap(
            this.width,
            this.height,
            this.particlesContainer,
            this.levelOfDetail,
            animationCb
        );

        this.animationQueue.push(() => {
            this.minimizeOldVisualization(areParticlesNew, transitionType, transitionLayout);
        });

        this.animationQueue.push(() => {
            this.moveNewVisualization(areParticlesNew, transitionType, transitionLayout);
            this.stage.addChild(this.visualization);
            this.visualization.drawData(animationCb, areParticlesNew);
            this.moveParticlesDestination(areParticlesNew, transitionType, transitionLayout);

            // After defining the destination we have to calculate the speed for the particles
            // so the reach at the same time their destination
            if (this.particles.arrivalSync) this.particlesContainer.calculateSpeedArrivingSameTime();
        });

        this.animationQueue.push(() => {
            this.cleanLayout();
        });

        return this.visualization;
    }

    drawProportionalSymbolMap(dataset, isCurrentVisualization, animationCb) {
        if (!isFunction(animationCb)) {
            this.reset();
            this.particlesContainer.createParticles(dataset, this.particles);
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
        // return new Promise( (resolve, reject) => { resolve(this.visualization); });
        return this.visualization;
    }

    drawChoroplethMap(dataset, isCurrentVisualization, animationCb) {
        if (!isFunction(animationCb)) {
            this.reset();
            this.particlesContainer.createParticles(dataset, this.particles);
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
            this.particlesContainer.createParticles(dataset, this.particles);
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

    minimizeOldVisualization(areParticlesNew, transitionType, transitionLayout){
        if (!areParticlesNew && this.visualizationOld && transitionType != "none") {
            let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(this.visualizationOld);

            if (transitionLayout === "juxtaposition") {
                this.moveVisualization(this.visualizationOld, "left", "linear");
                let amountOfFrames = this.particlesContainer.moveParticles("left", "linear", {
                    "x": this.visualizationOld.destination.x,
                    "y": this.visualizationOld.destination.y
                }, yTranslate, ratio);
                this.visualizationOld.calculateSpeed(amountOfFrames);
            } else if (transitionLayout === "stacked") {
                this.moveVisualization(this.visualizationOld, "top", "linear");
                let amountOfFrames = this.particlesContainer.moveParticles("top", "linear", {
                    "x": this.visualizationOld.destination.x,
                    "y": this.visualizationOld.destination.y
                }, yTranslate, ratio);
                this.visualizationOld.calculateSpeed(amountOfFrames);
            }

            this.isCleaningNecessary = true;

            // After defining the destination we have to calculate the speed for the particles
            // so the reach at the same time their destination
            if (this.particles.arrivalSync) this.particlesContainer.calculateSpeedArrivingSameTime();
        }
    }

    moveNewVisualization(areParticlesNew, transitionType, transitionLayout){
        if (!areParticlesNew && this.visualizationOld && transitionType != "none") {
            if (transitionLayout === "juxtaposition") {
                this.moveVisualization(this.visualization, "right", "none");
            } else if (transitionLayout === "stacked") {
                this.moveVisualization(this.visualization, "bottom", "none");
            }
        }
    }

    moveParticlesDestination(areParticlesNew, transitionType, transitionLayout){
        if (!areParticlesNew && this.visualizationOld && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {

            let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(this.visualization);

            this.particlesContainer.moveParticlesDestination(
                this.width,
                this.height,
                transitionLayout === "juxtaposition" ? "right" : "bottom",
                transitionType,
                width,
                yTranslate,
                ratio
            );
        }
    }

    removeVisualization() {
        this.stage.removeChild(this.visualization);
        if(this.visualizationOld) this.stage.removeChild(this.visualizationOld);
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
        if (!this.isCleaningNecessary) {
            return;
        }

        let transitionType = $("select.transition").val();
        let transitionLayout = $("select.transition-layout").val();

        if (this.visualizationOld && transitionType != "none" &&
            (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {

            this.stage.removeChild(this.visualizationOld);

            let {height, width, ratio, yTranslate} = this.calculateTranslationLayoutValues(this.visualization);
            let amountOfFrames = this.particlesContainer.moveParticlesBack(
                this.width,
                this.height,
                transitionLayout === "juxtaposition" ? "right" : "bottom",
                transitionType,
                width,
                yTranslate,
                ratio
            );
            this.moveVisualization(this.visualization, "default", "linear");
            this.visualization.calculateSpeed(amountOfFrames);
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
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
        this.stats.begin();

        let areParticlesAnimating = this.particlesContainer.nextStep();
        let isOldVisualizationAnimating = this.visualizationOld ? this.visualizationOld.nextStep() : false;
        let isNewVisualizationAnimating = this.visualization.nextStep();

        // Get the next job when there is one and the last job finished
        if (!areParticlesAnimating && !isOldVisualizationAnimating && !isNewVisualizationAnimating && this.animationQueue.length > 0) {
            this.animationQueue.pop()();
            this.particlesContainer.startAnimation();
            if (this.visualizationOld) this.visualizationOld.startAnimation();
            this.visualization.startAnimation();
        }

        this.renderer.render(this.stage);

        this.stats.end();
    }
}
