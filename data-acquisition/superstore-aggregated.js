var fs         = require("fs");
var csv        = require("fast-csv");

let idx        = 0;
let countyDict = {};

function objectEntries(obj) {
    let index = 0;

    // In ES6, you can use strings or symbols as property keys,
    // Reflect.ownKeys() retrieves both
    let propKeys = Reflect.ownKeys(obj);

    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (index < propKeys.length) {
                let key = propKeys[index];
                index++;
                return { value: [key, obj[key]] };
            } else {
                return { done: true };
            }
        }
    };
}

csv.fromPath("./data/superstore-preprocessed-coords-geoids.csv", {
    headers: true,
    delimiter: ";"
})
.on("data", function(item){

    let countyKey = `${item.StateId}${item.CountyId}`;
    console.log("Item #", ++idx, countyKey);
    countyDict[countyKey] = ++countyDict[countyKey] || 1;

})
.on("end", function(){

    let result = [];

    result.push([
        "GEO_ID",
        "ID",
        "AMOUNT"
    ]);

    for (let [key,value] of objectEntries(countyDict)) {
        result.push([
            `0500000US${key}`,
            `${key}`,
            `${value}`
        ]);
    }

    let ws = fs.createWriteStream(
        "./data/superstore-aggregated.csv",
        {encoding: "utf8"}
    );
    // comma seperation needed because of topojson
    csv.write(result, {headers: true, delimiter: ","}).pipe(ws);
});
