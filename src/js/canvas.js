import "pixi.js";

import DotMap from "./visualization/map/dot-map";
import ProportionalSymbolMap from "./visualization/map/proportional-symbol-map";
import { Stats } from 'stats.js';

import ScatterPlot from "./visualization/chart/scatter-plot";
import BarChart from "./visualization/chart/bar-chart";
import ParticlesContainer from "./visualization/overview/overview";

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
        this.stage.interactive = true;

        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        this.particlesContainer = new ParticlesContainer(container, dataset);

        this.particlesGraphics = new PIXI.Graphics();
        this.stage.addChild(this.particlesGraphics);

        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
        this.stats.dom.style.cssText = "position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;height:48px;width:100px;";
    }

    createParticles(dataset){
        if(this.particlesContainer && this.particlesContainer.particles.length <= 0){
            this.particlesContainer.createParticles(dataset);
            return true;
        } else {
            return false;
        }
    }

    drawParticles(dataset){
        this.clear();
        let newParticles = this.createParticles(dataset);
        this.particlesContainer.draw(newParticles);
    }

    drawScatterPlot(dataStore, title) {
        this.clear();
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        let newParticles = this.createParticles(dataStore.data);
        return new ScatterPlot(container, this.particlesContainer.particles, dataStore, newParticles, title);
    }

    drawBarChart(dataset, schema, features, title) {
        this.clear();
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        let newParticles = this.createParticles(dataset);
        new BarChart(container, this.particlesContainer.particles, schema, features, this.barChartParticles, newParticles, title);
    }

    drawDotMap(dataset, title){
        this.clear();
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        this.createParticles(dataset);
        return new DotMap(container, this.particlesContainer.particles, title, this.levelOfDetail);
    }

    drawProportionalSymbolMap(dataset, title){
        this.reset();
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        this.createParticles(dataset);
        return new ProportionalSymbolMap(container, this.particlesContainer.particles, title, this.levelOfDetail);
    }

    clear(){
        this.stage.removeChildren();
    }

    reset() {
        this.clear();
        this.particlesContainer.reset();
    }

    stop(){
        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    addVisualization(width, height, origin){
        var container = new PIXI.Container();
        container.width = width;
        container.height = height;
        container.x = origin.x;
        container.y = origin.y;
        this.stage.addChild(container);
        return container;
    }

    render() {
        this.stats.begin();

        this.stage.removeChild(this.particlesGraphics);
        this.particlesGraphics.clear();
        this.particlesGraphics.lineStyle(0, 0x000000, 0);
        this.particlesGraphics.beginFill(0x5555AA);

        for(let i=0;i<this.particlesContainer.particles.length; i++){
            this.particlesContainer.particles[i].animate();
            this.particlesContainer.particles[i].draw(this.particlesGraphics);
        }

        this.stage.addChild(this.particlesGraphics);
        this.renderer.render(this.stage);

        this.stats.end();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }

}
