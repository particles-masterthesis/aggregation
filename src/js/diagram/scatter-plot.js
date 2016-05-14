/* jshint esversion: 6 */

import Chart from "./chart";

export default class ScatterPlot extends Chart {

    /**
     * @param container
     * @param dataset
     * @param features
     * @param this.boundaries
     * @param title
     */
    constructor(container, dataset, features, title){
        super(container, dataset, features, title);

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

        this.addTicks();
        this.addItems(dataset, features);
    }

    /**
     * Add ticks along the axes
     */
    addTicks() {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        const pxDistanceBetweenTicks = 100;
        const amountOfMarkerX = Math.floor(this.widthVisualization / pxDistanceBetweenTicks);
        const amountOfMarkerY = Math.floor(this.heightVisualization / pxDistanceBetweenTicks);

        const pxStepX = this.widthVisualization / amountOfMarkerX;
        const pxStepY = this.heightVisualization / amountOfMarkerY;

        const rangeX = Math.abs(this.boundaries.maxX) + Math.abs(this.boundaries.minX);
        const rangeY = Math.abs(this.boundaries.maxY) + Math.abs(this.boundaries.minY);

        // Here the origin tick on the x axis gets drawn and any further ticks to the left
        let x = Math.abs(this.boundaries.minX).map(0, rangeX, 0, this.widthVisualization);
        while (x >= 0) {
            this.addTickX(x, ticks);
            x -= pxStepX;
        }

        x = Math.abs(this.boundaries.minX).map(0, rangeX, 0, this.widthVisualization) + pxStepX;
        while (x < this.widthVisualization) {
            this.addTickX(x, ticks);
            x += pxStepX;
        }

        let y = Math.abs(this.boundaries.maxY).map(0, rangeY, 0, this.heightVisualization);
        while (y >= 0) {
            this.addTickY(y, ticks);
            y -= pxStepY;
        }
        y = Math.abs(this.boundaries.maxY).map(0, rangeY, 0, this.heightVisualization) + pxStepY;
        while (y < this.heightVisualization) {
            this.addTickY(y, ticks);
            y += pxStepY;
        }

        this.stage.addChild(ticks);
    }

    /**
     * Creates ticks on the x axis
     * @param {Integer} x
     * @param {PIXI.Graphics} ticks
     */
    addTickX(x, ticks) {
        const text = x.map(0, this.widthVisualization, this.boundaries.minX, this.boundaries.maxX);
        const tickLabel = new PIXI.Text(Math.floor(text * 100) / 100, {
            font: "12px Arial"
        });
        tickLabel.anchor = new PIXI.Point(0.5, 0.5);
        tickLabel.x = this.padding + x;
        tickLabel.y = this.padding + this.heightVisualization + 16;
        this.stage.addChild(tickLabel);

        ticks.moveTo(this.padding + x, this.padding + this.heightVisualization);
        ticks.lineTo(this.padding + x, this.padding + this.heightVisualization + 8);
    }

    /**
     * Creates ticks on the y axis
     * @param {Integer} y
     * @param {PIXI.Graphics} ticks
     */
    addTickY(y, ticks) {
        const text = y.map(0, this.heightVisualization, this.boundaries.maxY, this.boundaries.minY);
        const tickLabel = new PIXI.Text(Math.floor(text * 100) / 100, {
            font: "12px Arial"
        });
        tickLabel.anchor = new PIXI.Point(1, 0.5);
        tickLabel.x = this.padding - 10;
        tickLabel.y = this.padding + y;
        this.stage.addChild(tickLabel);

        ticks.moveTo(this.padding, this.padding + y);
        ticks.lineTo(this.padding - 8, this.padding + y);
    }

    /**
     * Adds the items to the diagram
     * @param {Array} data
     * @param {Object} features
     */
    addItems(data, features) {
        const items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA, 1);
        items.beginFill(0xF8F8F8, 1);

        let x = 0;
        let y = 0;
        for (let i = 0; i < data.length; i++) {
            x = parseFloat(data[i][features.x]);
            y = parseFloat(data[i][features.y]);

            x = x.map(this.boundaries.minX, this.boundaries.maxX, 0, this.widthVisualization);
            y = y.map(this.boundaries.minY, this.boundaries.maxY, 0, this.heightVisualization);

            items.drawCircle(x + this.padding, this.height - this.padding - y, 3);
        }

        this.stage.addChild(items);
    }
}
