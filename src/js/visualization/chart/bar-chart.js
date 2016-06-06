import Chart from "./chart";

export default class BarChart extends Chart {

    /**
     * @param container
     * @param dataSet
     * @param features
     * @param title
     */
    constructor(width, height, particles, schema, xyFeatures, useParticles, newParticles, title) {
        super(width, height);

        let {uniqueValues, maxAppearance} = this.analyzeFeature(particles, schema, xyFeatures.x);

        if (useParticles) {
            let {size, particlesPerRow} = this.addItems(particles, xyFeatures.x, uniqueValues, maxAppearance, newParticles);


            let itemsToAdd = maxAppearance % particlesPerRow > 0 ? particlesPerRow-maxAppearance % particlesPerRow : 0;
            let heightYAxis = this.padding + this.heightVisualization - size * (maxAppearance + itemsToAdd) / particlesPerRow;

            this.addTicksY(size, maxAppearance+itemsToAdd, particlesPerRow);
            this.addAxes("barChart", heightYAxis);
            this.addLabels({"x": xyFeatures.x, "y": "Amount"}, title, heightYAxis);
        } else {
            this.addBars(particles, uniqueValues, maxAppearance);
            this.addTicksY(60, maxAppearance);
            this.addAxes();
            this.addLabels({"x": xyFeatures.x, "y": "Amount"}, title);
        }

        this.addTicksX(uniqueValues);
    }

    /**
     * Check how often a value threaten as nominal value does appear
     * @param data
     * @param feature
     * @returns {Object}
     */
    analyzeFeature(particles, schema, feature) {
        let uniqueValues = {};

        // Create a dictionary for the values of the current feature
        for (let i = 0; i < particles.length; i++) {
            if (typeof uniqueValues[particles[i].data[feature]] === "undefined") {
                uniqueValues[particles[i].data[feature]] = {
                    "appearance": 1
                };
            }
            else {
                uniqueValues[particles[i].data[feature]].appearance++;
            }
        }

        const tmp = {};

        // For alphabetic, date or numeric order on the nominal axis we sort the object keys
        if (schema[feature] === "numeric") {
            Object.keys(uniqueValues).sort((a, b) => a - b).forEach(function (key) {
                tmp[key] = uniqueValues[key];
            });
        } else if (schema[feature] === "date") {
            Object.keys(uniqueValues).sort(function (a, b) {
                a = a.split(".");
                b = b.split(".");
                return new Date(a[2], a[1], a[0]) - new Date(b[2], b[1], b[0]);
            }).forEach(function (key) {
                tmp[key] = uniqueValues[key];
            });
        } else {
            Object.keys(uniqueValues).sort().forEach(function (key) {
                tmp[key] = uniqueValues[key];
            });
        }

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
            maxAppearance: maxAppearance
        };
    }

    /**
     * Add ticks along the axes
     * @param uniqueValues
     */
    addTicksX(uniqueValues) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        let amountOfBarsX = Object.keys(uniqueValues).length;

        let pxStepX = this.widthVisualization / amountOfBarsX;
        let x, text, maxLengthText = 14;

        // Print ticks to the x axis
        for (let i = 0; i < amountOfBarsX; i++) {
            x = i * pxStepX + pxStepX / 2;

            text = Object.keys(uniqueValues)[i];
            text = text.length > maxLengthText ? text.substring(0, maxLengthText - 1) + "..." : text;
            text = text.replace("ä", "ae").replace("Ä", "Ae");
            text = text.replace("ö", "oe").replace("Ö", "Oe");
            text = text.replace("ü", "ue").replace("Ü", "Ue");

            const tickLabel = new PIXI.Text(text, {
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

        this.addChild(ticks);
    }

    addTicksY(size, maxAppearance, particlesPerRow) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        let y = this.heightVisualization + this.padding;
        let pxStepY = size;
        while (pxStepY < 50) {
            pxStepY += size;
        }

        let endPointTicksY = this.heightVisualization + this.padding - size * maxAppearance / particlesPerRow;
        while (y >= endPointTicksY) {
            const text = Math.round(Math.abs(this.heightVisualization + this.padding - y) / size * particlesPerRow);
            const tickLabel = new PIXI.Text(text, {
                font: "12px Arial"
            });
            tickLabel.anchor = new PIXI.Point(1, 0.5);
            tickLabel.x = this.padding - 10;
            tickLabel.y = y;
            this.addChild(tickLabel);

            ticks.moveTo(this.padding, y);
            ticks.lineTo(this.padding - 8, y);

            y -= pxStepY;
        }

        this.addChild(ticks);
    }

    /**
     * Adds bars to the diagram
     * @param {Object} uniqueValues
     */
    addBars(particles, uniqueValues, maxAppearance) {
        const items = new PIXI.Graphics();
        items.lineStyle(0, 0x5555AA, 1);
        items.beginFill(0x5555AA, 1);

        const values = Object.keys(uniqueValues);

        let widthBar = this.widthVisualization / values.length;
        this.marginBar = widthBar.map(1, this.widthVisualization, 1, 100);
        let widthBarExlusiveMargin = widthBar - this.marginBar * 2 - particles[0].margin;

        for (let i = 0; i < values.length; i++) {
            if (typeof uniqueValues[values[i]].appearance === "undefined") {
                continue;
            }
            let height = uniqueValues[values[i]].appearance.map(0, maxAppearance, 0, this.heightVisualization);
            items.drawRect(this.padding + this.marginBar + widthBar * i, this.heightVisualization + this.padding, widthBarExlusiveMargin, -height);
        }

        this.addChild(items);
    }

    /**
     * Add items to the diagram
     * @param particles
     * @param feature
     * @param uniqueValues
     * @param maxAppearance
     */
    addItems(particles, feature, uniqueValues, maxAppearance, newParticles) {
        const values = Object.keys(uniqueValues);

        // Calculate the size of a bar
        let widthAreaPerValue = this.widthVisualization / values.length;
        let marginBar = widthAreaPerValue.map(1, this.widthVisualization, 1, 100);
        let widthBarExclusiveMargin = widthAreaPerValue - marginBar * 2;

        // Calculate the size a particle
        let availableAreaHighestBar = this.heightVisualization * widthBarExclusiveMargin;
        let areaEveryParticleInHighestBar = availableAreaHighestBar / maxAppearance;
        let sizeEveryParticle = Math.sqrt(areaEveryParticleInHighestBar);

        // Except for integers we want to make the particles smaller
        // Example particlesPerRow = 3.5, so we need to create at least 4 particles per row
        let particlesPerRow = Math.floor(widthBarExclusiveMargin / sizeEveryParticle);
        particlesPerRow = maxAppearance === 1 ? 1 : ++particlesPerRow;
        let size = Math.min(widthBarExclusiveMargin / particlesPerRow, this.heightVisualization, this.widthVisualization);

        let x = null, y = null, uniqueValue = null;
        let transitionType = $("select.transition").val();

        for (let i = 0; i < particles.length; i++) {
            uniqueValue = particles[i].data[feature];
            if (typeof uniqueValues[uniqueValue] === "undefined") {
                particles[i].alpha = 0;
                continue;
            } else {
                particles[i].alpha = 1;
            }

            particles[i].alpha = 1;

            y = uniqueValues[uniqueValue].y || this.heightVisualization + this.padding - size;

            uniqueValues[uniqueValue].particlesRowCounter = ++uniqueValues[uniqueValue].particlesRowCounter || 0;
            uniqueValues[uniqueValue].particleNumberInRow = uniqueValues[uniqueValue].particlesRowCounter % particlesPerRow;

            x = this.padding + marginBar + size * uniqueValues[uniqueValue].particleNumberInRow + values.indexOf(uniqueValue) * widthAreaPerValue;

            let sizeToDraw = size - particles[i].margin;

            if (newParticles) {
                particles[i].setPosition(x, y).setSize(sizeToDraw, sizeToDraw);
            } else {
                particles[i].transitionTo(x, y, sizeToDraw, sizeToDraw, transitionType);
            }

            if (uniqueValues[uniqueValue].particleNumberInRow === particlesPerRow - 1) {
                uniqueValues[uniqueValue].y = y - size;
            }
        }

        return {
            size,
            particlesPerRow
        };
    }
}
