import * as dat from "exdat";

export default class UI {
    constructor() {
        this.DatGui = new dat.GUI();
    }

    static updateDropdown(features, currentSelection) {
        features.sort();

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

    static toggleFeatureDropdowns() {
        let chosenVisualization = $("select.visualization option:selected")[0].innerHTML;

        switch ($("select.visualization").val()) {
            case "barChart":
                $("select.feature-y").attr("disabled", true);
                $("select.feature-x").attr("disabled", false);
                break;

            case "scatterPlot":
                $("select.feature").attr("disabled", false);
                break;

            default:
                $("select.feature").attr("disabled", true);
                break;
        }
    }
}
