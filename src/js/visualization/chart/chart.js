import Visualization from "./../visualization";

export default class Chart extends Visualization {

    constructor(width, height, particlesContainer) {
        super(width, height, particlesContainer);
    }

    drawAxes() {
        const axes = new PIXI.Graphics();
        axes.lineStyle(1, 0x111111, 1);

        // X
        // From bottom left to the right and to the bottom
        axes.moveTo(this.padding - 10, this._height - this.padding);
        axes.lineTo(this.widthVisualization + this.padding, this._height - this.padding);
        axes.lineTo(this.widthVisualization + this.padding, this._height - this.padding + 10);

        // Y
        // From bottom left to top and to the left
        axes.moveTo(this.padding, this._height - this.padding + 10);
        axes.lineTo(this.padding, this._height - this.padding - this.heightVisualization);
        axes.lineTo(this.padding - 10, this._height - this.padding - this.heightVisualization);

        this.addChild(axes);
    }

}
