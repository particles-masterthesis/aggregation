import Chart from "./chart";
import BaseMap from "./base-map";
export default class DotMap extends Chart {

    constructor(container, dataStore, title, levelOfDetail){

        super(container);
        this.baseMap = new BaseMap(this.width, this.height, levelOfDetail);

        // this.addAxes();
        // this.addLabels(dataStore.currentSelection, "Superstore");
        // this.addTicks(boundaries);
        // this.addItems(dataStore.subset, dataStore.currentSelection, boundaries);
    }

    updateBaseMap(levelOfDetail){
        this.baseMap.update(levelOfDetail);
    }

    hide(levelOfDetail){
        this.baseMap.hide();
    }

    show(){
        this.baseMap.show();
    }

    // addTicks(boundaries) {
    //     const ticks = new PIXI.Graphics();
    //     ticks.lineStyle(1, 0x111111, 1);

    //     this.drawNumericalTicks(ticks, boundaries.values.minX, boundaries.values.maxX, 'x');
    //     this.drawNumericalTicks(ticks, boundaries.values.minY, boundaries.values.maxY, 'y');

    //     this.stage.addChild(ticks);
    // }

    // addTickY(y, labelText, ticks) {
    //     const tickLabel = new PIXI.Text(labelText, {
    //         font: "12px Arial"
    //     });
    //     tickLabel.anchor = new PIXI.Point(1, 0.5);
    //     tickLabel.x = this.padding - 10;
    //     tickLabel.y = this.padding + y;
    //     this.stage.addChild(tickLabel);

    //     ticks.moveTo(this.padding, this.padding + y);
    //     ticks.lineTo(this.padding - 8, this.padding + y);
    // }

    // addTickX(x, labelText, ticks, rotate) {
    //     const tickLabel = new PIXI.Text(labelText, {
    //         font: "12px Arial"
    //     });
    //     tickLabel.anchor = new PIXI.Point(0.5, 0.5);
    //     tickLabel.x = this.padding + x;
    //     tickLabel.y = this.padding + this.heightVisualization + 16;

    //     if(rotate){
    //         tickLabel.anchor = new PIXI.Point(1, 0.5);
    //         tickLabel.rotation = -Math.PI / 2;
    //     }

    //     this.stage.addChild(tickLabel);

    //     ticks.moveTo(this.padding + x, this.padding + this.heightVisualization);
    //     ticks.lineTo(this.padding + x, this.padding + this.heightVisualization + 8);
    // }

    // drawNumericalTicks (ticks, minValue, maxValue, axis){
    //     const pxDistanceBetweenTicks = 100;

    //     let iteration, addTickFnc;
    //     if(axis === 'x'){
    //         iteration  = this.widthVisualization;
    //         addTickFnc = this.addTickX;
    //     }
    //     else {
    //         iteration  = this.heightVisualization;
    //         addTickFnc = this.addTickY;
    //     }

    //     let amountMarker = Math.floor(iteration / pxDistanceBetweenTicks);
    //     let pxStep       = iteration / amountMarker;
    //     let range        = Math.abs(maxValue) + Math.abs(minValue);
    //     let valMapped    = Math.abs(maxValue).map(0, range, 0, iteration);

    //     let val = valMapped;

    //     // this is only needed to turn x axis from left to right
    //     if(axis === 'x'){
    //         let tmp = maxValue;
    //         maxValue = minValue;
    //         minValue = tmp;
    //     }

    //     let labelText;
    //     while (val >= 0) {
    //         labelText = Math.floor(val.map(
    //                     0,
    //                     iteration,
    //                     maxValue,
    //                     minValue
    //                 ) * 100) / 100;
    //         addTickFnc.call(this, val, labelText, ticks);
    //         val -= pxStep;
    //     }

    //     val = valMapped + pxStep;
    //     while (val < iteration) {
    //         labelText = Math.floor(val.map(
    //                     0,
    //                     iteration,
    //                     maxValue,
    //                     minValue
    //                 ) * 100) / 100;
    //         addTickFnc.call(this, val, labelText, ticks);
    //         val += pxStep;
    //     }
    // }

}
