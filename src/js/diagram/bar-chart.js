/* jshint esversion: 6 */

import Chart from "./chart";
var Physics = require("./../../../node_modules/physicsjs/dist/physicsjs-full");

export default class BarChart extends Chart {

    /**
     * @param container
     * @param dataSet
     * @param features
     * @param title
     */
    constructor(world, stage, dataSet, features, title, useParticles) {
        super(world, stage);

        this.addAxes();
        this.addLabels({"x": features.x, "y": "Amount"}, title);

        let {uniqueValues, maxAppearance, amountUniqueValues} = this.analyzeFeature(dataSet, features.x);
        this.addTicks(uniqueValues, maxAppearance, amountUniqueValues);

        console.log(uniqueValues, maxAppearance, amountUniqueValues);

        if (useParticles) {
            this.addItems(dataSet, features.x, uniqueValues, maxAppearance, amountUniqueValues);
        } else {
            this.addBars(uniqueValues, maxAppearance);
        }
    }

    /**
     * Check how often a value threaten as nominal value does appear
     * @param data
     * @param feature
     * @returns {Object}
     */
    analyzeFeature(data, feature) {
        let uniqueValues = {};
        let counter = 0;

        // Create a dictionary for the values of the current feature
        for (var row of data) {
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

        // Because more than ~ 50 unique values haven't enough space on the nominal axis
        // we show only the first 50 unique values
        let values = Object.keys(uniqueValues);
        let maxValues = 50;
        if (values.length > maxValues) {
            let firstValues = values.splice(0, maxValues);

            var newUniqueValues = {};
            var sumDeletedValues = 0;
            //Create a new unique values object, where the last key does contains every key after the first 130 keys
            for (let key in uniqueValues) {
                if (firstValues.indexOf(key) > -1) {
                    newUniqueValues[key] = uniqueValues[key];
                }
            }

            newUniqueValues["..."] = {};
            uniqueValues = newUniqueValues;
            counter = ++maxValues;
        }

        // We need the most appeared value, because this value fills the complete visualization
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
     * @param uniqueValues
     * @param maxAppearance
     * @param amountOfBarsX
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

            console.log(Object.keys(uniqueValues)[i], i);
            const tickLabel = new PIXI.Text(Object.keys(uniqueValues)[i], {
                font: "12px Arial"
            });
            tickLabel.anchor = new PIXI.Point(0.5, 0.5);
            tickLabel.x = this.padding + x;
            tickLabel.y = this.padding + this.heightVisualization + 16;
            tickLabel.anchor = new PIXI.Point(0, 0.5);
            tickLabel.rotation = Math.PI/4;
            this.stage.addChild(tickLabel);

            ticks.moveTo(this.padding + x, this.padding + this.heightVisualization);
            ticks.lineTo(this.padding + x, this.padding + this.heightVisualization + 8);
        }

        this.stage.addChild(ticks);
    }

    /**
     * Adds bars to the diagram
     * @param {Object} uniqueValues
     */
    addBars(uniqueValues, maxAppearance) {
        const items = new PIXI.Graphics();
        items.lineStyle(0, 0x5555AA, 1);
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

    /**
     * Add items to the diagram
     * @param data
     * @param feature
     * @param uniqueValues
     * @param maxAppearance
     */
    addItems(data, feature, uniqueValues, maxAppearance) {
        const items = new PIXI.Graphics();
        const values = Object.keys(uniqueValues);

        let widthBar = this.widthVisualization / values.length;
        this.marginBar = widthBar.map(1, this.widthVisualization, 1, 100);
        this.marginParticle = 0.5;
        let widthBarExclusiveMargin = widthBar - this.marginBar * 2;

        // Calculate the size a particle
        let availableAreaHighestBar = this.heightVisualization * widthBarExclusiveMargin;
        let areaEveryParticleHighestBar = availableAreaHighestBar / maxAppearance;
        let sizeEveryParticle = Math.sqrt(areaEveryParticleHighestBar);

        // Except for integers we want to make the particles smaller
        // Example particlesPerRow = 3.5, so we need to create at least 4 particles per row
        let particlesPerRow = Math.floor(widthBarExclusiveMargin / sizeEveryParticle);
        particlesPerRow = maxAppearance === 1 ? 1 : ++particlesPerRow;
        let width = widthBarExclusiveMargin / particlesPerRow;
        width -= this.marginParticle * 2;

        // now we want to fill the area of the highest bar
        let maxParticleHighestBar = maxAppearance + particlesPerRow - ((maxAppearance % particlesPerRow) || particlesPerRow);
        let height = this.heightVisualization / (maxParticleHighestBar / particlesPerRow) - this.marginParticle * 2;
        height = Math.min(this.heightVisualization, height);


        let x = null, y = null, uniqueValue = null;
        let particles = [];


        for (let i = 0; i < data.length; i++) {
            uniqueValue = data[i][feature];
            if (typeof uniqueValues[uniqueValue] === "undefined") {
                continue;
            }

            y = uniqueValues[uniqueValue].y || this.heightVisualization + this.padding;

            uniqueValues[uniqueValue].particlesRowCounter = ++uniqueValues[uniqueValue].particlesRowCounter || 0;
            uniqueValues[uniqueValue].particleNumberInRow = uniqueValues[uniqueValue].particlesRowCounter % particlesPerRow;

            x = this.padding + this.marginBar + this.marginParticle + (width + this.marginParticle * 2) * uniqueValues[uniqueValue].particleNumberInRow + values.indexOf(uniqueValue) * widthBar;

            particles.push(
                Physics.body("rectangle", {
                    x: x + width / 2,
                    y: y - height / 2,
                    width: width,
                    height: height,
                    data: data[i]
                })
            );

            if (uniqueValues[uniqueValue].particleNumberInRow === particlesPerRow - 1) {
                uniqueValues[uniqueValue].y = y - height - this.marginParticle * 2;
            }
        }

        if (values.length >= 51) {
            let radius = 1;
            for (let i = 0; i < 3; i++) {
                particles.push(
                    Physics.body("circle", {
                        x: this.padding + this.widthVisualization - widthBar + this.marginBar + i * radius * 4,
                        y: this.padding + this.heightVisualization/2,
                        radius: radius,
                        data: data[i]
                    })
                );
            }
        }

        this.world.add(particles);
    }
}
