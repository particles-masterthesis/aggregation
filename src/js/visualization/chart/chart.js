import Visualization from "./../visualization";

export default class Chart extends Visualization {

    /**
     * @param container
     */
    constructor(width, height){
        super(width, height);
    }

    /**
     * Add Labels to the diagram
     * @param features
     * @param title
     */
    addLabels(features, title = "Title") {
        const xLabel = new PIXI.Text(features.x, {
            font: "14px Arial"
        });
        xLabel.anchor = new PIXI.Point(0.5, 0.5);
        xLabel.x = this._width/2;
        xLabel.y = this._height - 20;
        this.addChild(xLabel);

        const yLabel = new PIXI.Text(features.y, {
            font: "14px Arial"
        });
        yLabel.anchor = new PIXI.Point(0.5, 0.5);
        yLabel.x = 20;
        yLabel.y = this._height / 2;
        yLabel.rotation = -Math.PI / 2;
        this.addChild(yLabel);

        const titleLabel = new PIXI.Text(title, {
            font: "16px Arial"
        });
        titleLabel.anchor = new PIXI.Point(0.5, 0.5);
        titleLabel.x = this._width / 2;
        titleLabel.y = this.padding / 2;
        this.addChild(titleLabel);
    }

    /**
     * Add the axes to the diagram
     */
    addAxes() {
        const axes = new PIXI.Graphics();
        axes.lineStyle(1, 0x111111, 1);

        axes.moveTo(this.padding - 10, this.padding);
        axes.lineTo(this.padding, this.padding);
        axes.lineTo(this.padding, this.heightVisualization + this.padding + 10);

        axes.moveTo(this.padding - 10, this.heightVisualization + this.padding);
        axes.lineTo(this.widthVisualization + this.padding, this.heightVisualization + this.padding);
        axes.lineTo(this.widthVisualization + this.padding, this.heightVisualization + this.padding + 10);

        this.addChild(axes);
    }
}
