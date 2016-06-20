import Chart from "./chart";

export default class ScatterPlot extends Chart {

    constructor(width, height, particlesContainer, options) {
        super(width, height, particlesContainer);

        this.boundaries = this.getBoundaries(options.schema);
        this.nominalDict = {};
        this.options = options;

        this.addAxes();
        this.addLabels(options.features, "Superstore");
        this.addTicks(this.boundaries);
    }

    /**
     * Add Labels to the diagram
     * @param features
     * @param title
     */
    addLabels(features, title) {
        const xLabel = new PIXI.Text(features.x, {
            font: "14px Arial"
        });
        xLabel.anchor = new PIXI.Point(0.5, 0.5);
        xLabel.x = this._width / 2;
        xLabel.y = this._height - 20;
        this.addChild(xLabel);

        const yLabel = new PIXI.Text(features.y, {
            font: "14px Arial"
        });
        yLabel.anchor = new PIXI.Point(0.5, 0.5);
        yLabel.x = 20;
        yLabel.y = this.padding + this.heightVisualization / 2;
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

    addAxes(){
        const axes = new PIXI.Graphics();
        axes.lineStyle(1, 0x111111, 1);

        // y axis
        axes.moveTo(this.padding - 10, this.padding);
        axes.lineTo(this.padding, this.padding);
        axes.lineTo(this.padding, this.heightVisualization + this.padding + 10);

        // x axis
        axes.moveTo(this.padding - 10, this.heightVisualization + this.padding);
        axes.lineTo(this.widthVisualization + this.padding, this.heightVisualization + this.padding);
        axes.lineTo(this.widthVisualization + this.padding, this.heightVisualization + this.padding + 10);

        this.addChild(axes);
    }

    /**
     * Add ticks along the axes
     */
    addTicks(boundaries) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        switch (boundaries.schema) {
            case "date numeric":
            case "nominal numeric":
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxX, boundaries.values.uniqueX, "x");
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minY, boundaries.values.maxY, "y");
                break;

            case "numeric date":
            case "numeric nominal":
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minX, boundaries.values.maxX, "x");
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxY, boundaries.values.uniqueY, "y");
                break;

            case "date date":
            case "nominal nominal":
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxX, boundaries.values.uniqueX, "x");
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxY, boundaries.values.uniqueY, "y");
                break;

            case "numeric numeric":
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minX, boundaries.values.maxX, "x");
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minY, boundaries.values.maxY, "y");
                break;

            default:
                throw new Error(`Schema not handled ("${schema}")`);

        }

        this.addChild(ticks);
    }

    /**
     * Creates ticks on the x axis
     * @param {Integer} x
     * @param {Object} labelText
     * @param {PIXI.Graphics} ticks
     */
    addTickX(x, labelText, ticks, rotate) {
        const tickLabel = new PIXI.Text(labelText, {
            font: "12px Arial"
        });
        tickLabel.anchor = new PIXI.Point(0.5, 0.5);
        tickLabel.x = this.padding + x;
        tickLabel.y = this.padding + this.heightVisualization + 16;

        tickLabel.anchor = new PIXI.Point(0, 0.5);
        tickLabel.rotation = Math.PI / 4;

        this.addChild(tickLabel);

        ticks.moveTo(this.padding + x, this.padding + this.heightVisualization);
        ticks.lineTo(this.padding + x, this.padding + this.heightVisualization + 8);
    }

    /**
     * Creates ticks on the y axis
     * @param {Integer} y
     * @param {Object} labelText
     * @param {PIXI.Graphics} ticks
     */
    addTickY(y, labelText, ticks) {
        const tickLabel = new PIXI.Text(labelText, {
            font: "12px Arial"
        });
        tickLabel.anchor = new PIXI.Point(1, 0.5);
        tickLabel.x = this.padding - 10;
        tickLabel.y = this.padding + y;
        tickLabel.rotation = Math.PI / 4;
        this.addChild(tickLabel);

        ticks.moveTo(this.padding, this.padding + y);
        ticks.lineTo(this.padding - 8, this.padding + y);
    }

    drawNominalTicks(ticks, maxValue, uniqueValues, axis) {
        let iteration, addTickFnc;
        if (axis === "x") {
            iteration = this.widthVisualization;
            addTickFnc = this.addTickX;
        }
        else {
            iteration = this.heightVisualization;
            addTickFnc = this.addTickY;
        }

        let pxStep = iteration / maxValue;
        let counter = -1;
        for (let key in uniqueValues) {
            let val = (++counter) * pxStep + pxStep / 2;
            this.nominalDict[key] = this.nominalDict[key] || {};
            this.nominalDict[key][axis] = val;
            addTickFnc.call(this, val, `${key}`, ticks, true);
        }
    }

    drawNumericalTicks(ticks, minValue, maxValue, axis) {
        const pxDistanceBetweenTicks = 100;

        let iteration, addTickFnc;
        if (axis === "x") {
            iteration = this.widthVisualization;
            addTickFnc = this.addTickX;
        }
        else {
            iteration = this.heightVisualization;
            addTickFnc = this.addTickY;
        }

        let amountMarker = Math.floor(iteration / pxDistanceBetweenTicks);
        let pxStep = iteration / amountMarker;
        let range = Math.abs(maxValue) + Math.abs(minValue);
        let valMapped = Math.abs(maxValue).map(0, range, 0, iteration);

        let val = valMapped;

        // this is only needed to turn x axis from left to right
        if (axis === "x") {
            let tmp = maxValue;
            maxValue = minValue;
            minValue = tmp;
        }

        let labelText;
        while (val >= 0) {
            labelText = Math.round(val.map(
                        0,
                        iteration,
                        maxValue,
                        minValue
                    ) * 100) / 100;
            addTickFnc.call(this, val, labelText, ticks);
            val -= pxStep;
        }

        val = valMapped + pxStep;
        while (val < iteration) {
            labelText = Math.round(val.map(
                        0,
                        iteration,
                        maxValue,
                        minValue
                    ) * 100) / 100;
            addTickFnc.call(this, val, labelText, ticks);
            val += pxStep;
        }
    }

    /**
     * Adds the items to the diagram
     * @param {Array} data
     * @param {Object} features
     */
    drawData(newParticles) {
        let size = 5, x, y;
        let transitionType = $("select.transition").val();

        switch (this.boundaries.schema) {

            case "date numeric":
            case "nominal numeric":

                for (let i = 0; i < this.particles.length; i++) {
                    x = this.nominalDict[this.particles[i].data[this.options.features.x]].x;
                    y = parseFloat(this.particles[i].data[this.options.features.y]);
                    y = y.map(this.boundaries.values.minY, this.boundaries.values.maxY, 0, this.heightVisualization);

                    this.particles[i].alpha = 1;

                    if (newParticles) {
                        this.particles[i].setPosition(x + this.padding, this.heightVisualization + this.padding - y).setSize(size, size);
                    } else {
                        this.particles[i].transitionTo(x + this.padding, this.heightVisualization + this.padding - y, size, size, transitionType);
                    }
                }
                break;

            case "numeric date":
            case "numeric nominal":

                for (let i = 0; i < this.particles.length; i++) {
                    x = parseFloat(this.particles[i].data[this.options.features.x]);
                    x = x.map(this.boundaries.values.minX, this.boundaries.values.maxX, 0, this.widthVisualization);
                    y = this.nominalDict[particles[i].data[this.options.features.y]].y;

                    this.particles[i].alpha = 1;

                    if (newParticles) {
                        this.particles[i].setPosition(x + this.padding, y + this.padding).setSize(size, size);
                    } else {
                        this.particles[i].transitionTo(x + this.padding, y + this.padding, size, size, transitionType);
                    }
                }
                break;

            case "date date":
            case "date nominal":
            case "nominal date":
            case "nominal nominal":

                for (let i = 0; i < this.particles.length; i++) {
                    x = this.nominalDict[this.particles[i].data[this.options.features.x]].x;
                    y = this.nominalDict[this.particles[i].data[this.options.features.y]].y;

                    this.particles[i].alpha = 1;

                    if (newParticles) {
                        this.particles[i].setPosition(x + this.padding, y + this.padding).setSize(size, size);
                    } else {
                        this.particles[i].transitionTo(x + this.padding, y + this.padding, size, size, transitionType);
                    }
                }
                break;

            case "numeric numeric":

                for (let i = 0; i < this.particles.length; i++) {
                    x = parseFloat(this.particles[i].data[this.options.features.x]);
                    y = parseFloat(this.particles[i].data[this.options.features.y]);

                    x = x.map(this.boundaries.values.minX, this.boundaries.values.maxX, 0, this.widthVisualization) - size / 2;
                    y = y.map(this.boundaries.values.minY, this.boundaries.values.maxY, 0, this.heightVisualization) - size / 2;

                    this.particles[i].alpha = 1;

                    if (newParticles) {
                        this.particles[i].setPosition(x + this.padding, this.heightVisualization + this.padding - y).setSize(size, size);
                    } else {
                        this.particles[i].transitionTo(x + this.padding, this.heightVisualization + this.padding - y, size, size, transitionType);
                    }
                }
                break;

            default:
                throw new Error(`Schema not handled ("${this.boundaries.schema}")`);
        }
    }

    /**
     * @param dataStore
     * @returns {{schema: string, values: {}}}
     */
    getBoundaries(schema) {
        schema = `${schema[dataStore.currentSelection.x]} ${schema[dataStore.currentSelection.y]}`;
        let result = {}, nominals, numerics;

        switch (schema) {

            case "date numeric":
            case "nominal numeric":
                nominals = dataStore.data.getNominalBoundaries(dataStore.currentSelection.x, false, "x");
                numerics = dataStore.data.getNumericalBoundaries(dataStore.currentSelection, false, "y");

                Object.assign(result, nominals, numerics);
                break;

            case "numeric date":
            case "numeric nominal":
                nominals = dataStore.data.getNominalBoundaries(dataStore.currentSelection.y, false, "y");
                numerics = dataStore.data.getNumericalBoundaries(dataStore.currentSelection, false, "x");

                Object.assign(result, nominals, numerics);
                break;

            case "date date":
            case "nominal nominal":
                result = dataStore.data.getNominalBoundaries(dataStore.currentSelection, true);

                break;

            case "numeric numeric":
                result = dataStore.data.getNumericalBoundaries(dataStore.currentSelection, true);
                break;

            default:
                throw new Error(`Schema not handled ("${schema}")`);
        }

        return {
            schema: schema,
            values: result
        };
    }
}
