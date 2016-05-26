/* jshint esversion: 6 */

export default class Chart {

    /**
     * @param container
     */
    constructor(stage){
        this.padding = 120;
        this.width = stage._width;
        this.height = stage._height;
        this.heightVisualization = this.height - this.padding*2;
        this.widthVisualization = this.width - this.padding*2;
        this.stage = stage;
    }

    /**
     * Resets the drawn diagram
     */
    reset() {
        this.stage.removeChildren();
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
        xLabel.x = this.width/2;
        xLabel.y = this.height - 20;
        this.stage.addChild(xLabel);

        const yLabel = new PIXI.Text(features.y, {
            font: "14px Arial"
        });
        yLabel.anchor = new PIXI.Point(0.5, 0.5);
        yLabel.x = 20;
        yLabel.y = this.height / 2;
        yLabel.rotation = -Math.PI / 2;
        this.stage.addChild(yLabel);

        const titleLabel = new PIXI.Text(title, {
            font: "16px Arial"
        });
        titleLabel.anchor = new PIXI.Point(0.5, 0.5);
        titleLabel.x = this.width / 2;
        titleLabel.y = this.padding / 2;
        this.stage.addChild(titleLabel);
    }

    /**
     * Add the axes to the diagram
     */
    addAxes() {
        const axes = new PIXI.Graphics();
        axes.lineStyle(1, 0x111111, 1);

        axes.moveTo(this.padding - 10, this.padding);
        axes.lineTo(this.padding, this.padding);
        axes.lineTo(this.padding, this.height - this.padding + 10);

        axes.moveTo(this.padding - 10, this.height - this.padding);
        axes.lineTo(this.width - this.padding, this.height - this.padding);
        axes.lineTo(this.width - this.padding, this.height - this.padding + 10);

        this.stage.addChild(axes);
    }
}
