import Chart from "./chart";
var d3 = require("d3");

export default class BarChart extends Chart {

    /**
     * @param width
     * @param height
     * @param particles
     * @param schema
     * @param xyFeatures
     * @param useParticles
     * @param newParticles
     * @param title
     */
    constructor(width, height, particlesContainer, schema, xyFeatures, useParticles, newParticles, title) {
        super(width, height, particlesContainer);

        // It easier and better for performance to just hide the particles behind a graphic
        // then to set every particles alpha to 0
        this.overlayBars = new PIXI.Graphics();

        let {uniqueValues, maxAppearance} = this.analyzeFeature(particlesContainer.children, schema, xyFeatures.x);

        let {size, particlesPerRow} = this.addItems(particlesContainer.children, xyFeatures.x, uniqueValues, maxAppearance, newParticles);

        // we want to fill the highest bar with particles
        // even if there is just one it the most top row
        // to calculate the correct height of the axis and place the ticks correct
        let itemsToAdd = maxAppearance % particlesPerRow > 0 ? particlesPerRow - (maxAppearance % particlesPerRow) : 0;
        let heightYAxis = size * (maxAppearance + itemsToAdd) / particlesPerRow;
        this.addYAxis(heightYAxis);

        let dataXAxis = [];
        Object.keys(uniqueValues).forEach(function (key) {
            dataXAxis.push({"key": key, "appearance": uniqueValues[key].appearance});
        });
        this.addXAxis(dataXAxis);

        this.addTicksY(size, maxAppearance + itemsToAdd, particlesPerRow);
        this.addLabels({"x": xyFeatures.x, "y": "Amount"}, title, heightYAxis);

        if (!useParticles) {
            this.hideParticles();
            this.addBars(particlesContainer.children, uniqueValues, maxAppearance);
        }
        else {
            this.showParticles();
        }
    }

    hideParticles() {
        console.log("draw area");
        this.overlayBars.lineStyle(0, 0xf8f8f8, 1);
        this.overlayBars.beginFill(0xf8f8f8, 1);
        this.overlayBars.drawRect(this.widthVisualization, this.heightVisualization, 0, 0);
        this.addChild(this.overlayBars);
    }

    showParticles() {
        this.removeChild(this.overlayBars);
    }

    /**
     * Check how often a value threaten as nominal value does appear
     * @param data
     * @param feature
     * @returns object = {
     *                      key: appearance,
     *                      key: appearance,
     *                      ...
     *                   }
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

    addXAxis(data) {
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, this.widthVisualization], 0.1);

        // Because d3 places dynamically margin to the most right and left bar
        // we have to place the ticks manually
        let postEditingTicks = function (selection) {
            let collection = selection.selectAll('ticks')[0].parentNode.getElementsByClassName("tick");
            let matrix = document.getElementsByTagName("svg")[0].createSVGMatrix();
            let widthBar = this.widthVisualization / data.length;

            for (let i = 0; i < collection.length; i++) {
                let matrix = document.getElementsByTagName("svg")[0].createSVGMatrix();
                matrix = matrix.translate(parseInt(widthBar / 2 + i * widthBar, 10), 0);
                collection[i].transform.baseVal.getItem(0).setMatrix(matrix);
                collection[i].placement = i;
            }
        };

        var xAxis = d3.svg.axis()
            .scale(x);

        var svg = d3.select("body").append("svg")
            .attr("width", this._width)
            .attr("height", this._height)
            .attr("id", "x-axis")
            .append("g")
            .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

        x.domain(data.map(function (d) {
            return d.key;
        }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.heightVisualization + ")")
            .call(xAxis)
            .call(postEditingTicks.bind(this))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        let allTicksInactive = function(){
            let ticks = document.getElementsByClassName("tick");
            for (var i = 0; i < ticks.length; i++) {
                ticks[i].classList.remove("tick-active");
            }
        };

        svg.selectAll(".x.axis g.tick").on("click", function (d) {
            let classList = d3.event.target.parentNode.classList;
            if(classList.contains("tick-active")){
                classList.remove("tick-active");
                this.particlesContainer.resetHighPriorityParticles();
            } else {
                allTicksInactive();
                classList.add("tick-active");
                this.particlesContainer.setHighPriorityParticles(d3.event.target.parentNode.placement);
            }
        }.bind(this));
    }

    addYAxis(heightYAxis) {
        const yAxis = new PIXI.Graphics();
        yAxis.lineStyle(1, 0x111111, 1);

        yAxis.moveTo(this.padding, this.padding + this.heightVisualization);
        yAxis.lineTo(this.padding, this.padding + this.heightVisualization - heightYAxis);
        yAxis.lineTo(this.padding - 10, this.padding + this.heightVisualization - heightYAxis);

        this.addChild(yAxis);
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
     * Add Labels to the diagram
     * @param features
     * @param title
     */
    addLabels(features, title, heightYAxis) {
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
        yLabel.y = this.padding + this.heightVisualization - heightYAxis / 2;
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

            particles[i].bar = values.indexOf(uniqueValue);
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
