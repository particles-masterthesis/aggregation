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
        this.barChartParticles = true;
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

            let callbackAdd  = data => () => this.toggleDataRow(data);
            let callbackRemove = () => () => document.body.removeChild(document.getElementById("dataRow"));

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

        let tmp = features.splice(0, Math.round(features.length/2));
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

    removeVisualization() {
        // Because barchart creates a x axis which should be also removed after that function call
        if(document.getElementById("x-axis")){
            document.body.removeChild(document.getElementById("x-axis"));
        }

        this.stage.removeChild(this.visualization);
    }

    reset() {
        this.removeParticles();
        this.removeVisualization();
    }

    drawParticles(dataset) {
        let placeParticlesDirectly = this.createParticles(dataStore.data);
        this.visualization = new Overview(this.width, this.height, this.particlesContainer, placeParticlesDirectly);
        this.particlesContainer.startAnimation();
        this.stage.addChild(this.visualization);
        return this.visualization;
    }

    drawBarChart(dataset, schema, features, title) {
        let placeParticlesDirectly = this.createParticles(dataset);
        this.visualization = new BarChart(this.width, this.height, this.particlesContainer, schema, features, this.barChartParticles, placeParticlesDirectly, title);
        this.particlesContainer.startAnimation();
        this.stage.addChild(this.visualization);
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

        if(isCurrentVisualization){
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

        if(isCurrentVisualization){
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

    drawChoroplethMap(dataset, isCurrentVisualization){
        this.reset();
        this.createParticles(dataset);

        if(isCurrentVisualization){
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

    drawCartogram(dataset, isCurrentVisualization){
        this.reset();
        this.createParticles(dataset);

        if(isCurrentVisualization){
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

        this.particlesContainer.nextStep();
        this.renderer.render(this.stage);

        this.stats.end();
        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }

}
