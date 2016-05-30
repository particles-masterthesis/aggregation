/* jshint esversion: 6 */

export default class Visualization {

    /**
     * @param container
     */
    constructor(stage){
        this.padding = 120;
        this.width = stage._width;
        this.height = stage._height;
        this.heightVisualization = this.height - this.padding*2;
        this.widthVisualization = this.width - this.padding*2;
        this.stage = stage;
    }

    /**
     * Resets the drawn diagram
     */
    reset() {
        this.stage.removeChildren();
    }

}
