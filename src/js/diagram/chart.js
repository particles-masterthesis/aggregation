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

        this.addAxes();
        this.addLabels(features, "Superstore");

        this.boundaries = this.getMaxAndMinValuesFromSelectedFeatures(dataset, features);
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

    /**
     * Evaluates the max and the min value form a feature of the dataset
     * @returns {{maxX: number, minX: number, maxY: number, minY: number}}
     */

    getMaxAndMinValuesFromSelectedFeatures(dataset, features) {
        let maxValueX = 0, minValueX = 0;
        let maxValueY = 0, minValueY = 0;
        let x = 0, y = 0;

        for (let i = 0; i < dataset.length; i++) {
            x = parseFloat(dataset[i][features.x]);
            y = parseFloat(dataset[i][features.y]);

            if (x > maxValueX) {
                maxValueX = x;
            } else if (x < minValueX) {
                minValueX = x;
            }

            if (y > maxValueY) {
                maxValueY = y;
            } else if (y < minValueY) {
                minValueY = y;
            }
        }

        return {
            maxX: maxValueX,
            minX: minValueX,
            maxY: maxValueY,
            minY: minValueY
        };
    }
}
