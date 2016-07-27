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

    countyDict[countyKey] = countyDict[countyKey] || {};
    countyDict[countyKey].orders = ++countyDict[countyKey].orders || 1;
    countyDict[countyKey].quantity = (countyDict[countyKey].quantity + Number(item.Quantity)) || (Number(item.Quantity) || 1);
    countyDict[countyKey].sales = (countyDict[countyKey].sales + Number(item.Sales)) || Number(item.Sales);
    countyDict[countyKey].profit = (countyDict[countyKey].profit + Number(item.Profit)) || Number(item.Profit);
})
.on("end", function(){

    let result = [];

    result.push([
        "GEO_ID",
        "ID",
        "AMOUNT",
        "AVG_QUANTITY",
        "AVG_SALES",
        "AVG_PROFIT"
    ]);

    for (let [key,value] of objectEntries(countyDict)) {
        let row = [];
        row.push(`0500000US${key}`);
        row.push(key);
        row.push(value.orders);
        row.push(Math.ceil(value.quantity / value.orders));
        row.push((value.sales / value.orders).toFixed(2));
        row.push((value.profit / value.orders).toFixed(2));
        result.push(row);
    }

    let ws = fs.createWriteStream(
        "./data/superstore-aggregated.csv",
        {encoding: "utf8"}
    );
    // comma seperation needed because of topojson
    csv.write(result, {headers: true, delimiter: ","}).pipe(ws);
});
