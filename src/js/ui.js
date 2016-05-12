/* jshint esversion: 6 */
import * as dat from "exdat";

export default class UI {
    constructor(){
        this.DatGui = new dat.GUI();
    }

    updateDropdown(features, currentSelection) {
        for (let feature of features) {
            if (feature === currentSelection.x && feature === currentSelection.y) {
                $(".feature").append(`<option selected>${feature}</option>`);
            } else {
                $(".feature").append(`<option>${feature}</option>`);
            }
        }
    }
}
