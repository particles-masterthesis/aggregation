import "pixi.js";

export default class Visualization extends PIXI.Container{

    /**
     * @param container
     */
    constructor(width, height){
        super();

        this.padding = 120;
        this.width = width;
        this.height = height;
        this.heightVisualization = this.height - this.padding*2;
        this.widthVisualization = this.width - this.padding*2;
    }

    /**
     * Resets the drawn diagram
     */
    reset() {
        this.removeChildren();
    }

}
