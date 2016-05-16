/* jshint esversion: 6 */
import * as dat from "exdat";

export default class UI {
    constructor(){
        this.DatGui = new dat.GUI();
    }

    updateDropdown(features, currentSelection) {
        for (let feature of features) {
            if (feature === currentSelection.x) {
                $(".feature-x").append(`<option selected>${feature}</option>`);
            } else {
                $(".feature-x").append(`<option>${feature}</option>`);
            }

            if (feature === currentSelection.y) {
                $(".feature-y").append(`<option selected>${feature}</option>`);
            } else {
                $(".feature-y").append(`<option>${feature}</option>`);
            }
        }
    }
    
    disableDropdown(){
        let chosenVisualization = $("select.visualization option:selected")[0].innerHTML;
        if(chosenVisualization == "Bar chart"){
            $("select.feature-y").attr("disabled", true);
        } else {
            $("select.feature-y").attr("disabled", false);
        }
    }
}
