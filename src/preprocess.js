/* jshint esversion: 6 */

import fs from "fs";
import csv from "fast-csv";
import request from "sync-request";
import sleep from "sleep";
import config from "./config.json";
import "./js/helper.es6";

let idx = 0;

csv.fromPath("../../src/superstore.csv", {
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

        // Because of the Nominatim usage policy
        sleep.sleep(1);

        return item;
    })
    .pipe(csv.createWriteStream({headers: true, delimiter: ";"}))
    .pipe(fs.createWriteStream("../../src/superstore_preprocessed.csv", {encoding: "utf8"}));

