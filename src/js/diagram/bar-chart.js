/* jshint esversion: 6 */

import Chart from "./chart";

export default class BarChart extends Chart {

    /**
     * @param container
     * @param dataset
     * @param features
     * @param title
     */
    constructor(container, dataset, features, title, useParticles) {
        super(container, dataset, features, title);

        this.padding = 100;
        this.width = container._width;
        this.height = container._height;
        this.heightVisualization = this.height - this.padding * 2;
        this.widthVisualization = this.width - this.padding * 2;

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

        let {uniqueValues, maxAppearance, amountUniqueValues} = this.createFeatureXSet(dataset, features.x);
        this.addAxes();
        this.addLabels({"x": features.x, "y": "Amount"}, "Superstore");
        this.addTicks(uniqueValues, maxAppearance, amountUniqueValues);

        if (useParticles) {
            this.addItems(dataset, features.x, uniqueValues, maxAppearance, amountUniqueValues);
        } else {
            this.addBars(uniqueValues, maxAppearance);
        }
    }

    /**
     * Check how often a value threaten as nominal value does appear
     * @param dataset
     * @param feature
     * @returns {Object}
     */
    createFeatureXSet(dataset, feature) {
        let uniqueValues = {};
        let counter = 0;
        for (var row of dataset) {
            if (typeof uniqueValues[row[feature]] === "undefined") {
                uniqueValues[row[feature]] = {
                    "appearance": 1
                };
                counter++;
            }
            else {
                uniqueValues[row[feature]].appearance++;
            }
        }

        // For alphabetic order on the nominal axis we sort the object keys
        const tmp = {};
        Object.keys(uniqueValues).sort().forEach(function (key) {
            tmp[key] = uniqueValues[key];
        });
        uniqueValues = tmp;

        // Because more than ~ 130 unique values haven't enough space on the nominal axis
        // we show only the first 130 unique values
        let values = Object.keys(uniqueValues);

        if (values.length > 130) {
            let firstValues = values.splice(0, 130);

            var newUniqueValues = {};
            var sumDeletedValues = 0;
            //Create a new unique values object, where the last key does contains every key after the first 130 keys
            for (let key in uniqueValues) {
                if (firstValues.indexOf(key) > -1) {
                    newUniqueValues[key] = uniqueValues[key];
                } else {
                    sumDeletedValues += uniqueValues[key].appearance;
                }
            }

            newUniqueValues.other = {};
            newUniqueValues.other.appearance = sumDeletedValues;
            uniqueValues = newUniqueValues;
            counter = 131;
        }

        let maxAppearance = 0;
        for (let key in uniqueValues) {
            if (uniqueValues[key].appearance > maxAppearance) {
                maxAppearance = uniqueValues[key].appearance;
            }
        }

        return {
            uniqueValues: uniqueValues,
            maxAppearance: maxAppearance,
            amountUniqueValues: counter
        };
    }

    /**
     * Add ticks along the axes
     */
    addTicks(uniqueValues, maxAppearance, amountOfBarsX) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        let pxStepY = this.heightVisualization / Math.floor(this.heightVisualization / 100);
        let pxStepX = this.widthVisualization / amountOfBarsX;

        // We only need integer on the y axis
        // Sometimes we don't need every 100 px a tick, because we have less
        // appearances per unique nominal then possible ticks space available
        if (maxAppearance < this.heightVisualization / pxStepY) {
            pxStepY = this.heightVisualization / maxAppearance;
        }

        // Print ticks to the y axis
        let y = maxAppearance.map(0, maxAppearance, 0, this.heightVisualization);
        while (y >= 0) {
            const text = y.map(0, this.heightVisualization, maxAppearance, 0);
            const tickLabel = new PIXI.Text(Math.ceil(text), {
                font: "12px Arial"
            });
            tickLabel.anchor = new PIXI.Point(1, 0.5);
            tickLabel.x = this.padding - 10;
            tickLabel.y = this.padding + y;
            this.stage.addChild(tickLabel);

            ticks.moveTo(this.padding, this.padding + y);
            ticks.lineTo(this.padding - 8, this.padding + y);

            y -= pxStepY;
        }

        // Print ticks to the x axis
        for (let i = 0; i < amountOfBarsX; i++) {
            let x = i * pxStepX + pxStepX / 2;

            const tickLabel = new PIXI.Text(Object.keys(uniqueValues)[i], {
                font: "12px Arial"
            });
            tickLabel.anchor = new PIXI.Point(0.5, 0.5);
            tickLabel.x = this.padding + x;
            tickLabel.y = this.padding + this.heightVisualization + 16;
            tickLabel.anchor = new PIXI.Point(1, 0.5);
            tickLabel.rotation = -Math.PI / 2;
            this.stage.addChild(tickLabel);

            ticks.moveTo(this.padding + x, this.padding + this.heightVisualization);
            ticks.lineTo(this.padding + x, this.padding + this.heightVisualization + 8);
        }

        this.stage.addChild(ticks);
    }

    /**
     * Adds the items to the diagram
     * @param {Object} uniqueValues
     */
    addBars(uniqueValues, maxAppearance) {
        const items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA, 1);
        items.beginFill(0x5555AA, 1);

        const values = Object.keys(uniqueValues);

        let widthBar = this.widthVisualization / values.length;
        this.marginBar = widthBar.map(1, this.widthVisualization, 1, 200);
        let widthBarExlusiveMargin = widthBar - this.marginBar * 2;

        for (let i = 0; i < values.length; i++) {
            let height = uniqueValues[values[i]].appearance.map(0, maxAppearance, 0, this.heightVisualization);
            items.drawRect(this.padding + this.marginBar + widthBar * i, this.heightVisualization + this.padding, widthBarExlusiveMargin, -height);
        }

        this.stage.addChild(items);
    }

    addItems(data, feature, uniqueValues, maxAppearance, amountOfBarsX) {
        const items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA, 1);
        items.beginFill(0x5555AA, 1);

        let widthBar = this.widthVisualization / Object.keys(uniqueValues).length;
        this.marginBar = widthBar.map(1, this.widthVisualization, 1, 200);
        let widthBarExclusiveMargin = widthBar - this.marginBar * 2;

        // Calculate the size a particle
        let availableAreaHighestBar = this.heightVisualization * widthBarExclusiveMargin;
        let areaEveryParticleHighestBar = availableAreaHighestBar / maxAppearance;
        let sizeEveryParticle = Math.sqrt(areaEveryParticleHighestBar);

        // Except for integers we want to make the particles smaller
        // Example particlesPerRow = 3.5, so we need to create at least 4 particles per row
        // Attention: Because of the smaller size it could happen that there is a empty row on the top
        // but with bigger (width filling particles) there won't be, so a empty row on the top is okay
        let particlesPerRow = Math.floor(widthBarExclusiveMargin / sizeEveryParticle);
        particlesPerRow = maxAppearance === 1 ? 1 : ++particlesPerRow;
        sizeEveryParticle = widthBarExclusiveMargin / particlesPerRow;

        this.marginParticle = 1.5;//Math.max(1.5, particlesPerRow.map(1, 40, 8, 2));
        let height = Math.max(-this.heightVisualization, -sizeEveryParticle + this.marginParticle * 2);

        const values = Object.keys(uniqueValues);

        console.log(values);

        let width = sizeEveryParticle - this.marginParticle * 2;
        let x = null, y = null;

        for (let i = 0; i < data.length; i++) {

            let uniqueValue = data[i][feature];

            if(typeof uniqueValues[uniqueValue] === "undefined"){
                uniqueValue = "other";
            }

            y = uniqueValues[uniqueValue].y || this.heightVisualization + this.padding;

            uniqueValues[uniqueValue].particlesRowCounter = ++uniqueValues[uniqueValue].particlesRowCounter || 0;
            uniqueValues[uniqueValue].particleNumberInRow = uniqueValues[uniqueValue].particlesRowCounter % particlesPerRow;

            x = this.padding + this.marginBar + this.marginParticle + sizeEveryParticle * uniqueValues[uniqueValue].particleNumberInRow + values.indexOf(uniqueValue) * widthBar;

            items.drawRect(x, y, width, height);

            if (uniqueValues[uniqueValue].particleNumberInRow === particlesPerRow - 1) {
                uniqueValues[uniqueValue].y = y - sizeEveryParticle;
            }
        }

        this.stage.addChild(items);
    }


}
