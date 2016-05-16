/* jshint esversion: 6 */

import Chart from "./chart";

export default class ScatterPlot extends Chart {

    /**
     * @param container
     * @param dataset
     * @param features
     * @param title
     */
    constructor(container, dataStore, title){

        super(container);

        let boundaries = this.getBoundaries(dataStore);
        this.nominalDict = {};
        this.addAxes();
        this.addLabels(dataStore.currentSelection, "Superstore");
        this.addTicks(boundaries);
        this.addItems(dataStore.subset, dataStore.currentSelection, boundaries);
    }

    /**
     * Add ticks along the axes
     */
    addTicks(boundaries) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        switch (boundaries.schema) {
            case 'nominal numeric':
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxX, boundaries.values.uniqueX, 'x');
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minY, boundaries.values.maxY, 'y');
                break;

            case 'numeric nominal':
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minX, boundaries.values.maxX, 'x');
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxY, boundaries.values.uniqueY, 'y');
                break;

            case 'nominal nominal':
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxX, boundaries.values.uniqueX, 'x');
                this.drawNominalTicks.call(this, ticks, boundaries.values.maxY, boundaries.values.uniqueY, 'y');
                break;

            case 'numeric numeric':
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minX, boundaries.values.maxX, 'x');
                this.drawNumericalTicks.call(this, ticks, boundaries.values.minY, boundaries.values.maxY, 'y');
                break;

            default:
                throw new Error(`Schema not handled ("${schema}")`);

        }

        this.stage.addChild(ticks);
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

        if(rotate){
            tickLabel.anchor = new PIXI.Point(1, 0.5);
            tickLabel.rotation = -Math.PI / 2;
        }

        this.stage.addChild(tickLabel);

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
        this.stage.addChild(tickLabel);

        ticks.moveTo(this.padding, this.padding + y);
        ticks.lineTo(this.padding - 8, this.padding + y);
    }

    drawNominalTicks (ticks, maxValue, uniqueValues, axis){
        let iteration, addTickFnc;
        if(axis === 'x'){
            iteration  = this.widthVisualization;
            addTickFnc = this.addTickX;
        }
        else {
            iteration  = this.heightVisualization;
            addTickFnc = this.addTickY;
        }

        let pxStep  = iteration / maxValue;
        let counter = -1;
        for(let key in uniqueValues){
            let val = (++counter) * pxStep + pxStep / 2;
            this.nominalDict[key] = this.nominalDict[key] || {};
            this.nominalDict[key][axis] = val;
            addTickFnc.call(this, val, `${key}`, ticks, true);
        }
    }

    drawNumericalTicks (ticks, minValue, maxValue, axis){
        const pxDistanceBetweenTicks = 100;

        let iteration, addTickFnc;
        if(axis === 'x'){
            iteration  = this.widthVisualization;
            addTickFnc = this.addTickX;
        }
        else {
            iteration  = this.heightVisualization;
            addTickFnc = this.addTickY;
        }

        let amountMarker = Math.floor(iteration / pxDistanceBetweenTicks);
        let pxStep       = iteration / amountMarker;
        let range        = Math.abs(maxValue) + Math.abs(minValue);
        let valMapped    = Math.abs(maxValue).map(0, range, 0, iteration);

        let val = valMapped;

        // this is only needed to turn x axis from left to right
        if(axis === 'x'){
            let tmp = maxValue;
            maxValue = minValue;
            minValue = tmp;
        }

        let labelText;
        while (val >= 0) {
            labelText = Math.floor(val.map(
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
            labelText = Math.floor(val.map(
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
    addItems(data, features, boundaries) {
        let items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA, 1);
        items.beginFill(0xF8F8F8, 1);

        let x = 0;
        let y = 0;

        switch (boundaries.schema) {

            case 'nominal numeric':

                for (let i = 0; i < data.length; i++) {
                    x = this.nominalDict[data[i][features.x]].x;
                    y = parseFloat(data[i][features.y]);
                    y = y.map(boundaries.values.minY, boundaries.values.maxY, 0, this.heightVisualization);
                    items.drawCircle(x + this.padding, this.height - this.padding - y, 3);
                }
                break;

            case 'numeric nominal':

                for (let i = 0; i < data.length; i++) {
                    x = parseFloat(data[i][features.x]);
                    x = x.map(boundaries.values.minX, boundaries.values.maxX, 0, this.widthVisualization);
                    y = this.nominalDict[data[i][features.y]].y;
                    items.drawCircle(x + this.padding, y + this.padding, 3);
                }

                break;

            case 'nominal nominal':

                for (let i = 0; i < data.length; i++) {
                    x = this.nominalDict[data[i][features.x]].x;
                    y = this.nominalDict[data[i][features.y]].y;
                    items.drawCircle(x + this.padding, y + this.padding, 3);
                }

                break;

            case 'numeric numeric':

                for (let i = 0; i < data.length; i++) {

                    x = parseFloat(data[i][features.x]);
                    y = parseFloat(data[i][features.y]);

                    x = x.map(boundaries.values.minX, boundaries.values.maxX, 0, this.widthVisualization);
                    y = y.map(boundaries.values.minY, boundaries.values.maxY, 0, this.heightVisualization);

                    items.drawCircle(x + this.padding, this.height - this.padding - y, 3);
                }

                break;

            default:
                throw new Error(`Schema not handled ("${schema}")`);
        }

        this.stage.addChild(items);
    }

    /**
     * @param dataStore
     * @returns {{schema: string, values: {}}}
     */
    getBoundaries (dataStore) {
        let schema = `${dataStore.schema[dataStore.currentSelection.x]} ${dataStore.schema[dataStore.currentSelection.y]}`;
        let result = {}, nominals, numerics;

        switch (schema) {

            case 'nominal numeric':
                nominals = dataStore.subset.getNominalBoundaries(dataStore.currentSelection.x, false, 'x');
                numerics = dataStore.subset.getNumericalBoundaries(dataStore.currentSelection, false, 'y');

                Object.assign(result, nominals, numerics);
                break;

            case 'numeric nominal':
                nominals = dataStore.subset.getNominalBoundaries(dataStore.currentSelection.y, false, 'y');
                numerics = dataStore.subset.getNumericalBoundaries(dataStore.currentSelection, false, 'x');

                Object.assign(result, nominals, numerics);
                break;


            case 'nominal nominal':
                result = dataStore.subset.getNominalBoundaries(dataStore.currentSelection, true);

                break;

            case 'numeric numeric':
                result = dataStore.subset.getNumericalBoundaries(dataStore.currentSelection, true);
                break;

            default:
                throw new Error(`Schema not handled ("${schema}")`);
        }

        return {
            schema: schema,
            values: result
        };
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
