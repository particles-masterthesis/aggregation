var centroids = require('./dataset/topojson/us-state-centroids.json');
var superstore = './dataset/superstore_preprocessed.csv';
var outfile = './dataset/topojson/us-state-centroids-preprocessed.json'

var fs=require("fs");
var jsonfile = require('jsonfile')

var Converter = require("csvtojson").Converter;
var converter = new Converter({
    "delimiter": [";"]
});

converter.on("end_parsed", function (data) {

   var dict = {};
   for(var i in data){
    dict[data[i].State] = ++dict[data[i].State] || 1;
   }

   var features = centroids.features;
   for(var i in features){
        var state = features[i].properties.name;
        if (state in dict){
            features[i].properties.orders = dict[state];
        } else {
            features[i].properties.orders = 0;
        }
        delete features[i].properties.population;
   }

   writeFile(centroids);
});

function writeFile(obj){
    jsonfile.writeFile(
        outfile,
        obj,
        {
            spaces: 4
        },
        function(err) {
            if(err) throw err;
            console.log('done');
        })
}

fs.createReadStream(superstore).pipe(converter);
