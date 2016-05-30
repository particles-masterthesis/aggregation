let singleton = Symbol();
let singletonEnforcer = Symbol();

export default class D3 {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer){
            throw "Cannot construct D3 singleton";
        }
    }

    init(width, height, levelOfDetail){
        this.width = width;
        this.height = height;
        this.projection = d3.geo.albersUsa()
            .scale(1400)
            .translate([this.width / 2, this.height / 2]);

        // this.tmpScale = d3.scale.sqrt()
        //     .domain([0, 2100])
        //     .range([0, 30]);

        this.path = d3.geo.path().projection(this.projection);
        this.svg = d3.select("body > svg");
        if (this.svg.empty()){
            this.svg = d3.select("body").append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
        }

        this.data = {};

        // queue()
        // .defer(d3.json, `${location.origin}${location.pathname}/dist/dataset/topojson/us.json`)
        // .defer(d3.json, `${location.origin}${location.pathname}/dist/dataset/topojson/us-state-centroids-preprocessed.json`)
        // .await( (error, us, centroids)  => {
        //     if (error) throw error;
        //     this.data.us = us;
        //     this.data.centroids = centroids;
        //     this.update(levelOfDetail);
        // });

        $.ajax({
            dataType: "json",
            url: `${location.origin}${location.pathname}/dist/dataset/topojson/us.json`,
            async: false,
            success: (us) => {
                this.data.us = us;
            }
        });

        $.ajax({
            dataType: "json",
            url: `${location.origin}${location.pathname}/dist/dataset/topojson/us-state-centroids-preprocessed.json`,
            async: false,
            success: (centroids) => {
                this.data.centroids = centroids;
            }
        });

        this.update(levelOfDetail);

        d3.select(self.frameElement).style("height", this.height + "px");
    }

    static get instance() {
        if(!this[singleton]) {
            this[singleton] = new D3(singletonEnforcer);
        }
        return this[singleton];
    }

    update(levelOfDetail) {
        switch (levelOfDetail) {
            case "country":
                d3.select("#states").remove();
                d3.select("#counties").remove();
                this.drawCountry();
                break;
            case "state":
                d3.select("#counties").remove();
                this.drawStates();
                break;
            case "county":
                this.drawStates();
                this.drawCounties();
                break;
            default:
                break;
        }
    }

    drawCountry(){
        this.svg.insert("path", ".graticule")
        .datum(topojson.feature(this.data.us, this.data.us.objects.land))
        .attr("id","country")
        .attr("class", "land")
        .attr("d", this.path);
    }

    drawStates(){
        this.svg.insert("path", ".graticule")
        .datum(topojson.mesh(this.data.us, this.data.us.objects.states,
            function(a, b) {
                return a !== b;
            }
        ))
        .attr("id","states")
        .attr("class", "state-boundary")
        .attr("d", this.path);
    }

    drawCounties(){
        this.svg.insert("path", ".graticule")
        .datum(topojson.mesh(this.data.us, this.data.us.objects.counties,
            function(a, b) {
                return a !== b && !(a.id / 1000 ^ b.id / 1000);
            }
        ))
        .attr("id","counties")
        .attr("class", "county-boundary")
        .attr("d", this.path);
    }

    hide(){
        this.svg.style('visibility', 'hidden');
    }

    show(){
        this.svg.style('visibility', 'visible');
    }

}
