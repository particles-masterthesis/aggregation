export default class DataStore {
    constructor() {
        this.dataSet = [];
        this.data = [];
        this.features = [];
        this.schema = {};
        this.useSubset = true;

        this.sizeOfSubset = 20;

        this.currentSelection = {
            x: null,
            y: null
        };
    }

    createFeatures(header = []) {
        this.features = [];

        for (const feature in header) {
            if (header.hasOwnProperty(feature)) {
                this.features.push(feature);
            }
        }
    }

    classifyFeatures() {
        this.schema = {};

        let key = null, cell = null;
        for (let i = 0; i < this.features.length; i++) {
            key = this.features[i];
            cell = this.data[0][key];

            if (cell.isNumeric()) {
                this.schema[key] = "numeric";
            }
            else if (cell.isDate()) {
                this.schema[key] = "date";
            }
            else if (typeof cell === "string") {
                this.schema[key] = "nominal";
            }
            else {
                this.schema[key] = "unknown";
            }
        }
    }

    createSubset() {

        if (this.useSubset) {
            this.data = [];
            let indices = [], idx = 0;
            while (this.data.length < this.sizeOfSubset) {
                idx = Math.floor(Math.random() * this.dataSet.length);
                if (indices.indexOf(idx) < 0) {
                    indices.push(idx);
                    this.data.push(this.dataSet[idx]);
                }
            }
            console.info(`Using data with ${this.sizeOfSubset} items.`);
        } else {
            this.data = JSON.parse(JSON.stringify(this.dataSet));
            console.info(`Using data with ${this.dataSet.length} items.`);
        }

    }

    changeSorting(feature) {
        this.data.sortBy(feature);
    }

    import(url) {

        $.ajax({
            async: false,
            context: this,
            dataType: "text",
            type: "GET",
            url,
            error(XMLHttpRequest, textStatus, errorThrown) {
                console.error(XMLHttpRequest, textStatus, errorThrown);
            },
            success(data) {
                this.dataSet = $.csv.toObjects(data, {"separator": ";"});
                console.info("Imported Data Set.", this.dataSet);

                const header = this.dataSet.shift();
                this.createFeatures(header);
                this.createSubset();
                this.classifyFeatures();

                this.currentSelection.x = this.features[this.features.indexOf("Region")];
                this.currentSelection.y = this.features[this.features.indexOf("Latitude")];

            }
        });

    }
}
