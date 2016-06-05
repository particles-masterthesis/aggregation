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

        // Can't use particle container because it doesn't support interactivity
        this.particlesContainer = new PIXI.Container();
        this.stage.addChild(this.particlesContainer);

        this.dataRow = new PIXI.Container();
    }

    createParticles(dataset) {
        if (this.particlesContainer.children.length === 0) {
            let texture = PIXI.Texture.fromImage("dist/img/particle.png");
            let textureHover = PIXI.Texture.fromImage("dist/img/particle_hover.png");
            let callback = data => () => this.toggleDataRow(data);

            for (let i = 0; i < dataset.length; i++) {
                let sprite = new Particle(texture, textureHover, dataset[i], 0, 0, 3, 3);
                sprite.on("click", callback(sprite.data));
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
        if (this.dataRow.id === data["Row ID"]) {
            this.stage.removeChild(this.dataRow);
            this.dataRow = new PIXI.Text("");
            return;
        } else if(this.dataRow.id){
            this.stage.removeChild(this.dataRow);
        }

        let text = "";

        Object.keys(data).forEach(function (key) {
            text += key + ": " + data[key] + "\n";
        });

        this.dataRow = new PIXI.Text(text, {
            font: '13px Arial',
            wordWrap: true,
            wordWrapWidth: 100,
        });
        this.dataRow.x = 0;
        this.dataRow.y = 0;
        this.dataRow.id = data["Row ID"];

        this.stage.addChild(this.dataRow);
    }

    removeParticles(){
        this.particlesContainer.removeChildren();
    }

    removeVisualization(){
        console.log("remove", this.visualization);
        this.stage.removeChild(this.visualization);
    }

    drawParticles(dataset) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new Overview(this.width, this.height, this.particlesContainer.children, placeParticlesDirectly);
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawScatterPlot(dataStore, title) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new ScatterPlot(this.width, this.height, this.particlesContainer.children, dataStore, placeParticlesDirectly, title);
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawBarChart(dataset, schema, features, title) {
        let placeParticlesDirectly = this.createParticles(dataset);
        this.visualization = new BarChart(this.width, this.height, this.particlesContainer.children, schema, features, this.barChartParticles, placeParticlesDirectly, title);
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawDotMap(dataset, title) {
        this.createParticles(dataset);
        this.visualization = new DotMap(this.width, this.height, this.particlesContainer.children, title, this.levelOfDetail);
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawProportionalSymbolMap(dataset, title) {
        this.createParticles(dataset);
        this.visualization = new ProportionalSymbolMap(this.width, this.height, this.particlesContainer.children, title, this.levelOfDetail);
        this.stage.addChild(this.visualization);
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

        for (let i = 0; i < this.particlesContainer.children.length; i++) {
            this.particlesContainer.getChildAt(i).animate();
        }
        this.renderer.render(this.stage);

        this.stats.end();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }

}
