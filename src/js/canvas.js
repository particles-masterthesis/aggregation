/* jshint esversion: 6 */
import "pixi.js";
import "fpsmeter";

export default class Canvas {

    constructor(){
        this.height = window.innerHeight - 90; //windowH height - menu height - css-paddings
        this.width = window.innerWidth - 40; //windowH width - css-paddings

        this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
            backgroundColor: 0xF8F8F8,
            clearBeforeRender: true
        });

        this.stage = new PIXI.Container();

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

        this.FPSMeter = new FPSMeter({
            "theme": "light",
            "graph": 1,
            "position": "absolute",
            "zIndex": 10,
            "left": "auto",
            "right": "6px",
            "margin": "0 0 0 0",
            "top": "6px"
        });

        this.requestFrameID = null;
        this.padding = {
            "top": 40,
            "left": 60,
            "bottom": 60,
            "right": 40
        };
    }

    reset() {
        this.stage.removeChildren();

        if (this.requestFrameID) {
            window.cancelAnimationFrame(this.requestFrameID);
            this.requestFrameID = null;
        }
    }

    addLabels(features, title = "Title") {
        this.labels.x.text = features.x;
        this.labels.x.anchor = new PIXI.Point(0.5, 0.5);
        this.labels.x.x = (this.width - this.padding.left - this.padding.right) / 2 + this.padding.left;
        this.labels.x.y = this.height - 16;
        this.stage.addChild(this.labels.x);

        this.labels.y.text = features.y;
        this.labels.y.anchor = new PIXI.Point(0.5, 0.5);
        this.labels.y.x = 16;
        this.labels.y.y = (this.height - this.padding.top - this.padding.bottom) / 2 + this.padding.top;
        this.labels.y.rotation = -Math.PI / 2;
        this.stage.addChild(this.labels.y);

        this.labels.title.text = title;
        this.labels.title.anchor = new PIXI.Point(0.5, 0.5);
        this.labels.title.x = this.width / 2;
        this.labels.title.y = this.padding.top / 2;
        this.stage.addChild(this.labels.title);
    }

    addAxes() {
        const axes = new PIXI.Graphics();
        axes.lineStyle(1, 0x111111, 1);

        axes.moveTo(this.padding.left - 10, this.padding.top);
        axes.lineTo(this.padding.left, this.padding.top);
        axes.lineTo(this.padding.left, this.height - this.padding.bottom + 10);

        axes.moveTo(this.padding.left - 10, this.height - this.padding.bottom);
        axes.lineTo(this.width - this.padding.right, this.height - this.padding.bottom);
        axes.lineTo(this.width - this.padding.right, this.height - this.padding.bottom + 10);

        this.stage.addChild(axes);
    }

    /**
     * Add ticks along the axes
     * @param {object} boundaries
     */
    addTicks(boundaries) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        const amountOfMarkerX = Math.floor((this.width - this.padding.left - this.padding.right) / 100);
        const amountOfMarkerY = Math.floor((this.height - this.padding.left - this.padding.right) / 100);
        const stepX = Math.floor((this.width - this.padding.left - this.padding.right) / amountOfMarkerX);
        const stepY = Math.floor((this.height - this.padding.top - this.padding.bottom) / amountOfMarkerY);
        const rangeX = Math.abs(boundaries.maxX) + Math.abs(boundaries.minX);
        const rangeY = Math.abs(boundaries.maxY) + Math.abs(boundaries.minY);

        let x = Math.abs(boundaries.minX).map(0, rangeX, 0, this.width - this.padding.left - this.padding.right);
        while (x >= 0) {
            this.addTickX(x, boundaries, ticks);
            x -= stepX;
        }
        x = Math.abs(boundaries.minX).map(0, rangeX, 0, this.width - this.padding.left - this.padding.right) + stepX;
        while (x < this.width - this.padding.left - this.padding.right) {
            this.addTickX(x, boundaries, ticks);
            x += stepX;
        }

        let y = Math.abs(boundaries.maxY).map(0, rangeY, 0, this.height - this.padding.left - this.padding.right);
        while (y >= 0) {
            this.addTickY(y, boundaries, ticks);
            y -= stepY;
        }
        y = Math.abs(boundaries.maxY).map(0, rangeY, 0, this.height - this.padding.left - this.padding.right) + stepY;
        while (y < this.height - this.padding.top - this.padding.bottom) {
            this.addTickY(y, boundaries, ticks);
            y += stepY;
        }

        this.stage.addChild(ticks);
    }

    addTickX(y, boundaries, ticks) {
        const text = y.map(0, this.height - this.padding.left - this.padding.right, boundaries.maxY, boundaries.minY);
        const markerLabel = new PIXI.Text(Math.floor(text * 100) / 100, {
            font: "12px Arial"
        });
        markerLabel.anchor = new PIXI.Point(1, 0.5);
        markerLabel.x = this.padding.left - 10;
        markerLabel.y = this.padding.top + y;
        this.stage.addChild(markerLabel);

        ticks.moveTo(this.padding.left, this.padding.top + y);
        ticks.lineTo(this.padding.left - 8, this.padding.top + y);
    }

    addTickY(x, boundaries, ticks) {
        const text = x.map(0, this.width - this.padding.left - this.padding.right, boundaries.minX, boundaries.maxX);
        const markerLabel = new PIXI.Text(Math.floor(text * 100) / 100, {
            font: "12px Arial"
        });
        markerLabel.anchor = new PIXI.Point(0.5, 0.5);
        markerLabel.x = this.padding.left + x;
        markerLabel.y = this.height - this.padding.bottom + 16;
        this.stage.addChild(markerLabel);

        ticks.moveTo(this.padding.left + x, this.height - this.padding.bottom);
        ticks.lineTo(this.padding.left + x, this.height - this.padding.bottom + 8);
    }

    addItems(data, features, boundaries) {
        const items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA, 1);
        items.beginFill(0xF8F8F8, 1);

        let x = 0;
        let y = 0;
        for (let i = 0; i < data.length; i++) {
            x = parseFloat(data[i][features.x]);
            y = parseFloat(data[i][features.y]);

            x = x.map(boundaries.minX, boundaries.maxX, 0, this.width - this.padding.left - this.padding.right);
            y = y.map(boundaries.minY, boundaries.maxY, 0, this.height - this.padding.top - this.padding.bottom);

            items.drawCircle(x + this.padding.left, this.height - this.padding.bottom - y, 3);
        }

        this.stage.addChild(items);
    }

    render() {
        this.renderer.render(this.stage);
        this.FPSMeter.tick();

        this.requestFrameID = requestAnimationFrame(this.render.bind(this));
    }
}
