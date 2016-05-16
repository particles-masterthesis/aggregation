/* jshint esversion: 6 */

export default class Chart {

    /**
     * @param container
     * @param dataset
     * @param features
     * @param boundaries
     * @param title
     */
    constructor(container, dataset, features, title){
        this.padding = 70;
        this.width = container._width;
        this.height = container._height;
        this.heightVisualization = this.height - this.padding*2;
        this.widthVisualization = this.width - this.padding*2;

        this.stage = container;

        this.labels = {
            x: new PIXI.Text("X", {
                font: "14px Arial"
            }),
            y: new PIXI.Text("Y", {
                font: "14px Arial"
            }),
            title: new PIXI.Text("Title", {
                font: "16px Arial"
            })
        };
    }

    /**
     * Resets the drawn diagram
     */
    reset() {
        this.stage.removeChildren();
    }

    /**
     * Add labels to the diagram
     * @param features
     * @param title
     */
    addLabels(features, title = "Title") {
        this.labels.x.text = features.x;
        this.labels.x.anchor = new PIXI.Point(0.5, 0.5);
        this.labels.x.x = this.width/2;
        this.labels.x.y = this.height - this.padding / 2;
        this.stage.addChild(this.labels.x);

        this.labels.y.text = features.y;
        this.labels.y.anchor = new PIXI.Point(0.5, 0.5);
        this.labels.y.x = this.padding / 2;
        this.labels.y.y = this.height / 2;
        this.labels.y.rotation = -Math.PI / 2;
        this.stage.addChild(this.labels.y);

        this.labels.title.text = title;
        this.labels.title.anchor = new PIXI.Point(0.5, 0.5);
        this.labels.title.x = this.width / 2;
        this.labels.title.y = this.padding / 2;
        this.stage.addChild(this.labels.title);
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
