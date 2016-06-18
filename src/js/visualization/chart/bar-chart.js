import Chart from "./chart";

export default class BarChart extends Chart {

    /**
     * @param width
     * @param height
     * @param particles
     * @param options
     */
    constructor(width, height, particlesContainer, options) {
        super(width, height, particlesContainer);
        this.options = options;

        // It easier and better for performance to just hide the particles behind a graphic
        // then to set every particles alpha to 0
        this.overlayBars = new PIXI.Graphics();

        this.createStage();
    }


    createStage() {
        let {uniqueValues, maxAppearance} = this.analyzeFeature(this.options.schema, this.options.features.x);
        let {size, particlesPerRow, widthAreaPerValue, marginBar, blankParticlesHighestBar} = this.calculateValues(uniqueValues, maxAppearance);

        // X- AND Y-AXIS
        this.drawAxes();

        // X-TICKS
        this.drawTicksX(uniqueValues);

        // Y-TICKS
        this.drawTicksY(size, maxAppearance + blankParticlesHighestBar, particlesPerRow);

        // LABELS
        this.drawLabels({"x": this.options.features.x, "y": "Amount"}, this.options.title);
    }

    /**
     * Check how often a value threaten as nominal value does appear
     * @param particles
     * @param schema
     * @param feature
     * @returns object = {
     *                      key: appearance,
     *                      key: appearance,
     *                      ...
     *                   }
     */
    analyzeFeature(schema, feature) {
        let uniqueValues = {};

        // Create a dictionary for the values of the current feature
        for (let i = 0; i < this.particles.length; i++) {
            if (typeof uniqueValues[this.particles[i].data[feature]] === "undefined") {
                uniqueValues[this.particles[i].data[feature]] = {
                    "appearance": 1
                };
            }
            else {
                uniqueValues[this.particles[i].data[feature]].appearance++;
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
        let maxValues = 100;
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
     * Calculates some important values for drawing ticks and axes and for placing the particles
     * @param feature
     * @param uniqueValues
     * @param maxAppearance
     * @param newParticles
     * @returns {{size: number, particlesPerRow: number, widthAreaPerValue: number, marginBar: number, blankParticlesHighestBar: number}}
     */
    calculateValues(uniqueValues, maxAppearance) {
        const values = Object.keys(uniqueValues);

        // Calculate the size of a bar
        let widthAreaPerValue = this.widthVisualization / values.length;
        let marginBar = widthAreaPerValue.map(1, this.widthVisualization, 1, 100);
        let widthBarExclusiveMargin = widthAreaPerValue - marginBar * 2;

        // Calculate the size a particle
        let availableAreaHighestBar = (this._height - this.padding * 2) * widthBarExclusiveMargin;
        let areaEveryParticleInHighestBar = availableAreaHighestBar / maxAppearance;
        let sizeEveryParticle = Math.sqrt(areaEveryParticleInHighestBar);

        // Except for integers we want to make the particles smaller
        // Example particlesPerRow = 3.5, so we need to create at least 4 particles per row
        let particlesPerRow = Math.floor(widthBarExclusiveMargin / sizeEveryParticle);
        particlesPerRow = maxAppearance === 1 ? 1 : ++particlesPerRow;
        let size = Math.min(widthBarExclusiveMargin / particlesPerRow, this.heightVisualization, this.widthVisualization);

        // we want to fill the highest bar with particles
        // even if there is just one it the most top row
        // to calculate the correct height of the axis and place the ticks correct
        let blankParticlesHighestBar = maxAppearance % particlesPerRow > 0 ? particlesPerRow - (maxAppearance % particlesPerRow) : 0;
        this.heightVisualization = size * (maxAppearance + blankParticlesHighestBar) / particlesPerRow;

        return {
            size,
            particlesPerRow,
            widthAreaPerValue,
            marginBar,
            blankParticlesHighestBar
        };
    }

    /**
     * @param useBars
     * @param areParticlesNew
     */
    drawParticles(useBars, areParticlesNew) {
        let {uniqueValues, maxAppearance} = this.analyzeFeature(this.options.schema, this.options.features.x);
        let {size, particlesPerRow, widthAreaPerValue, marginBar, blankParticlesHighestBar} = this.calculateValues(uniqueValues, maxAppearance);

        if (useBars) {
            this.hideParticles();
            this.drawBars(uniqueValues, maxAppearance + blankParticlesHighestBar);
        }
        else {
            this.placeParticles(uniqueValues, size, particlesPerRow, marginBar, widthAreaPerValue, areParticlesNew);
            this.showParticles();
        }
    }

    /**
     * @param uniqueValues
     * @param size
     * @param particlesPerRow
     * @param marginBar
     * @param widthAreaPerValue
     * @param areParticlesNew
     */
    placeParticles(uniqueValues, size, particlesPerRow, marginBar, widthAreaPerValue, areParticlesNew) {
        let x, y, uniqueValue;
        let transitionType = $("select.transition").val();
        let values = Object.keys(uniqueValues);

        for (let i = 0; i < this.particles.length; i++) {
            uniqueValue = this.particles[i].data[this.options.features.x];
            if (typeof uniqueValues[uniqueValue] === "undefined") {
                this.particles[i].alpha = 0;
                continue;
            } else {
                this.particles[i].alpha = 1;
            }

            this.particles[i].bar = values.indexOf(uniqueValue);
            this.particles[i].alpha = 1;

            y = uniqueValues[uniqueValue].y || this._height - this.padding - size;

            uniqueValues[uniqueValue].particlesRowCounter = ++uniqueValues[uniqueValue].particlesRowCounter || 0;
            uniqueValues[uniqueValue].particleNumberInRow = uniqueValues[uniqueValue].particlesRowCounter % particlesPerRow;

            x = this.padding + marginBar + size * uniqueValues[uniqueValue].particleNumberInRow + values.indexOf(uniqueValue) * widthAreaPerValue;


            let sizeToDraw = size - this.particles[i].margin;

            if (areParticlesNew) {
                this.particles[i].setPosition(x, y).setSize(sizeToDraw, sizeToDraw);
            } else {
                this.particles[i].transitionTo(x, y, sizeToDraw, sizeToDraw, transitionType);
            }

            if (uniqueValues[uniqueValue].particleNumberInRow === particlesPerRow - 1) {
                uniqueValues[uniqueValue].y = y - size;
            }
        }

    }

    /**
     * Adds bars to the diagram
     * @param uniqueValues
     * @param maxAppearance
     * @param maxHeight
     */
    drawBars(uniqueValues, maxAppearance) {
        const items = new PIXI.Graphics();
        items.lineStyle(0, 0x4285f4, 1);
        items.beginFill(0x4285f4, 1);

        const values = Object.keys(uniqueValues);

        let widthBar = this.widthVisualization / values.length;
        marginBar = widthBar.map(1, this.widthVisualization, 1, 100);
        let widthBarExlusiveMargin = widthBar - marginBar * 2;

        for (let i = 0; i < values.length; i++) {
            if (typeof uniqueValues[values[i]].appearance === "undefined") {
                continue;
            }
            let height = uniqueValues[values[i]].appearance.map(0, maxAppearance, 0, this.heightVisualization);
            items.drawRect(this.padding + marginBar + widthBar * i, this._height - this.padding, widthBarExlusiveMargin, -height);
        }

        this.addChild(items);
    }

    drawTicksX(uniqueValues) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        let amountOfBarsX = Object.keys(uniqueValues).length;
        let pxStepX = this.widthVisualization / amountOfBarsX;
        let x, text, maxLengthText = 12;

        this.labelsX = new PIXI.Container();

        let styleDefault = {
            font: "12px Arial",
            fill: 0x000000
        };

        let styleActive = {
            font: "12px Arial",
            fill: 0x34a853
        };

        let onClick = (index, label) => function() {
            if(label.isActive){
                label.isActive = false;
                for(let i=0; i<this.labelsX.children.length; i++){
                    this.labelsX.children[i].style = styleDefault;
                }
                this.particlesContainer.resetHighPriorityParticles();
                return;
            }

            label.isActive = true;
            label.style = styleActive;
            this.particlesContainer.setHighPriorityParticles(index);
        }.bind(this);

        // Print ticks to the x axis
        for (let i = 0; i < amountOfBarsX; i++) {
            x = i * pxStepX + pxStepX / 2;

            text = Object.keys(uniqueValues)[i];
            text = text.length > maxLengthText ? text.substring(0, maxLengthText - 1) + "..." : text;
            text = text.replace("ä", "ae").replace("Ä", "Ae");
            text = text.replace("ö", "oe").replace("Ö", "Oe");
            text = text.replace("ü", "ue").replace("Ü", "Ue");

            const tickLabel = new PIXI.Text(text, styleDefault);
            tickLabel.anchor = new PIXI.Point(0.5, 0.5);
            tickLabel.x = this.padding + x;
            tickLabel.y = this._height - this.padding + 16;
            tickLabel.anchor = new PIXI.Point(0, 0.5);
            tickLabel.rotation = Math.PI / 4;
            tickLabel.interactive = true;
            tickLabel.buttonMode = true;

            tickLabel.on("click", onClick(i, tickLabel), null);
            this.labelsX.addChild(tickLabel);

            ticks.moveTo(this.padding + x, this._height - this.padding);
            ticks.lineTo(this.padding + x, this._height - this.padding + 8);
        }

        this.addChild(this.labelsX);
        this.addChild(ticks);
    }

    /**
     * @param size
     * @param maxAppearance
     * @param particlesPerRow
     */
    drawTicksY(size, maxAppearance, particlesPerRow) {
        const ticks = new PIXI.Graphics();
        ticks.lineStyle(1, 0x111111, 1);

        // From bottom to top
        let y = this._height - this.padding;
        let pxStepY = size;
        while (pxStepY < 50) {
            pxStepY += size;
        }

        let endPointTicksY = this._height - this.padding - size * maxAppearance / particlesPerRow;
        while (y >= endPointTicksY) {
            const text = Math.round(Math.abs(this._height - this.padding - y) / size * particlesPerRow);
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
     * Add Labels to the diagram
     * @param features
     * @param title
     */
    drawLabels(features, title) {
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
        yLabel.y = this._height - this.padding - this.heightVisualization / 2;
        yLabel.rotation = -Math.PI / 2;
        this.addChild(yLabel);

        const titleLabel = new PIXI.Text(title, {
            font: "16px Arial"
        });
        titleLabel.anchor = new PIXI.Point(0.5, 0.5);
        titleLabel.x = this._width / 2;
        titleLabel.y = this._height - this.padding - this.heightVisualization - this.padding / 2;
        this.addChild(titleLabel);
    }

    hideParticles() {
        this.overlayBars.lineStyle(0, 0xffffff, 1);
        this.overlayBars.beginFill(0xffffff, 1);
        this.overlayBars.drawRect(this.padding + 1, this.padding, this.widthVisualization - 1, this.heightVisualization);
        this.addChild(this.overlayBars);
    }

    showParticles() {
        this.removeChild(this.overlayBars);
    }
}
