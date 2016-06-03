import "pixi.js";

import DotMap from "./visualization/map/dot-map";
import ProportionalSymbolMap from "./visualization/map/proportional-symbol-map";
import {Stats} from 'stats.js';

import ScatterPlot from "./visualization/chart/scatter-plot";
import BarChart from "./visualization/chart/bar-chart";
import Overview from "./visualization/overview/overview";
import Particle from "./visualization/particle";

export default class Canvas {

    constructor(dataset, features) {
        this.barChartParticles = true;
        this.levelOfDetail = 'country';
        this.requestFrameID = null;

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

        this.particlesContainer = new PIXI.ParticleContainer();
        this.stage.addChild(this.particlesContainer);
    }

    createParticles(dataset) {
        if (this.particlesContainer.children.length === 0) {
            for (let i = 0; i < dataset.length; i++) {
                let sprite = new Particle(PIXI.Texture.fromImage("dist/img/orange.png"), dataset[i], 0, 0, 0, 0);
                this.particlesContainer.addChild(sprite);
            }
            return true;
        }
        else {
            return false;
        }
    }

    removeParticles(){
        this.particlesContainer.removeChildren();
    }

    drawParticles(dataset) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        let visualization = new Overview(this.width, this.height, this.particlesContainer.children, placeParticlesDirectly);
        this.stage.addChild(visualization);
        return visualization;
    }

    drawScatterPlot(dataStore, title) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        let visualization = new ScatterPlot(this.width, this.height, this.particlesContainer.children, dataStore, placeParticlesDirectly, title);
        this.stage.addChild(visualization);
        return visualization;
    }

    drawBarChart(dataset, schema, features, title) {
        let placeParticlesDirectly = this.createParticles(dataset);
        let visualization = new BarChart(this.width, this.height, this.particlesContainer.children, schema, features, this.barChartParticles, placeParticlesDirectly, title);
        this.stage.addChild(visualization);
        return visualization;
    }

    drawDotMap(dataset, title) {
        this.createParticles(dataset);
        let visualization = new DotMap(this.width, this.height, this.particlesContainer.children, title, this.levelOfDetail);
        this.stage.addChild(visualization);
        return visualization;
    }

    drawProportionalSymbolMap(dataset, title) {
        this.createParticles(dataset);
        let visualization = new ProportionalSymbolMap(this.width, this.height, this.particlesContainer.children, title, this.levelOfDetail);
        this.stage.addChild(visualization);
        return visualization;
    }

    stop() {
        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    render() {
        this.stats.begin();

        for (let i = 0; i < this.particlesContainer.children.length; i++) {
            this.particlesContainer.getChildAt(i).animate();
        }
        this.renderer.render(this.stage);

        this.stats.end();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }

}
