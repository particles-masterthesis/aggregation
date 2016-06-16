import "pixi.js";

export default class Visualization extends PIXI.Container{

    constructor(width, height, particlesContainer){
        super();
        this.particlesContainer = particlesContainer;
        this.particles = particlesContainer.children;
        this.padding = 120;
        this.width = width;
        this.height = height;
        this.heightVisualization = this._height - this.padding*2;
        this.widthVisualization = this._width - this.padding*2;
    }

}
