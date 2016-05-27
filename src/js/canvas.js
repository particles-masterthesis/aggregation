/* jshint esversion: 6 */

import "pixi.js";
import { Stats } from 'stats.js';

import ScatterPlot from "./visualization/chart/scatter-plot";
import BarChart from "./visualization/chart/bar-chart";
import ParticlesContainer from "./visualization/particle/container";

export default class Canvas {

    constructor(dataset, features) {
        this.barChartParticles = true;
        this.requestFrameID = null;

        this.height = window.innerHeight - 90; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 40; //windowH width - css-paddings

        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            backgroundColor: 0xF8F8F8,
            clearBeforeRender: true,
            antialias: true
        });
        document.body.appendChild(this.renderer.view);

        this.stage = new PIXI.Container();

        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        this.particlesContainer = new ParticlesContainer(container, dataset);

        this.particlesGraphics = new PIXI.Graphics();
        this.stage.addChild(this.particlesGraphics);

        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
        this.stats.dom.style.cssText = "position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;";
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
        this.stage.removeChildren();
        let newParticles = this.createParticles(window.dataStore.data);
        this.particlesContainer.draw(newParticles);
    }

    drawScatterPlot(dataStore, title) {
        this.stage.removeChildren();
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        let newParticles = this.createParticles(window.dataStore.data);
        new ScatterPlot(container, this.particlesContainer.particles, dataStore, newParticles, title);
    }

    drawBarChart(schema, features, title) {
        this.stage.removeChildren();
        let container = this.addVisualization(this.width, this.height, new PIXI.Point(0,0));
        let newParticles = this.createParticles(window.dataStore.data);
        new BarChart(container, this.particlesContainer.particles, schema, features, this.barChartParticles, newParticles, title);
    }

    reset() {
        this.stage.removeChildren();
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
        this.particlesGraphics = new PIXI.Graphics();
        this.particlesGraphics.lineStyle(2, 0x5555AA);
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
