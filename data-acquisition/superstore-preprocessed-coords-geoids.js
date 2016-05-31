let fs       = require("fs");
let csv      = require("fast-csv");
let request  = require("sync-request");
let sleep    = require("sleep");
let config   = require("./config.json");
let zipCodes = require("./zip-codes.json");
let idx      = 0;
require("../src/js/helper");

csv.fromPath("./superstore.csv", {
    headers: true,
    delimiter: ";"
})
.transform(item => {

    console.log("Item #", ++idx);

    // Convert numbers if necessary
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            if (item[key].isNumericGerman()) {
                item[key] = item[key].replace(",", ".");
            }
        }
    }

    // Add latitude and longitude if there is a geo information
    if (item.hasOwnProperty("Country") && item.hasOwnProperty("City") && item.hasOwnProperty("State")) {
        let url = `http://nominatim.openstreetmap.org/search?email=${config.email}&format=json&`;
        url += `country=${item.Country}&`;
        url += `state=${item.State}&`;
        url += `city=${item.City}`;

        const response = request("GET", url, {
            "headers": {
                "user-agent": "University of Applied Sciences Salzburg - Masterthesis Particles - MMT-M2014"
            }
        });
        const data = JSON.parse(response.getBody());
        item.Latitude = data[0].lat;
        item.Longitude = data[0].lon;
    }

    if (item.hasOwnProperty("Postal Code")) {
        let currentZip = item["Postal Code"];
        if(zipCodes.hasOwnProperty(currentZip)){
            let codes = zipCodes[currentZip];
            item.CountyId = codes.countyId[0];
            item.StateId = codes.stateId;
        } else {
            // superstore has no leading 0 of postal codes if code length < 5;
            currentZip = "0".concat(currentZip)
            if(zipCodes.hasOwnProperty(currentZip)){
                let codes = zipCodes[currentZip];
                item.CountyId = codes.countyId[0];
                item.StateId = codes.stateId;
            } else {
                console.log(`${currentZip} not found!`);
            }
        }
    }

    // Because of the Nominatim usage policy
    sleep.sleep(1);

    return item;
})
.pipe(csv.createWriteStream({headers: true, delimiter: ";"}))
.pipe(fs.createWriteStream(
    "./data/superstore-preprocessed-coords-geoids.csv",
    {encoding: "utf8"}
));

