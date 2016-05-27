function drawCountry(){
    this.countryPath = this.svg.insert("path", ".graticule")
        .datum(topojson.feature(this.data, this.data.objects.land))
        .attr("id","country")
        .attr("class", "land")
        .attr("d", this.path);
}

function drawStates(){
    drawCountry.call(this);

    this.statesPath = this.svg.insert("path", ".graticule")
        .datum(topojson.mesh(this.data, this.data.objects.states,
            function(a, b) {
                return a !== b;
            }
        ))
        .attr("id","states")
        .attr("class", "state-boundary")
        .attr("d", this.path);
}

function drawCounties(){
    drawCountry.call(this);
    drawStates.call(this);

    this.countiesPath = this.svg.insert("path", ".graticule")
        .datum(topojson.mesh(this.data, this.data.objects.counties,
            function(a, b) {
                return a !== b && !(a.id / 1000 ^ b.id / 1000);
            }
        ))
        .attr("id","counties")
        .attr("class", "county-boundary")
        .attr("d", this.path);
}

export default class BaseMap {

    constructor(width, height, levelOfDetail) {
        this.width = width;
        this.height = height;
        this.projection = d3.geo.albersUsa()
            .scale(1400)
            .translate([this.width / 2, this.height / 2]);

        this.path = d3.geo.path().projection(this.projection);
        this.svg = d3.select("body").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        d3.json(
            `${location.origin}${location.pathname}/dist/dataset/topojson/us.json`,
            (error, us) => {
                if (error) throw error;
                this.data = us;
                this.update(levelOfDetail);
            }
        );
        d3.select(self.frameElement).style("height", this.height + "px");
    }

    update(levelOfDetail) {
        switch (levelOfDetail) {
            case "country":
                d3.select("#states").remove();
                d3.select("#counties").remove();
                drawCountry.call(this);
                break;
            case "state":
                d3.select("#counties").remove();
                drawStates.call(this);
                break;
            case "county":
                drawCounties.call(this);
                break;
            default:
                break;
        }

    }

    hide(){
        this.svg.style('visibility', 'hidden');
    }

    show(){
        this.svg.style('visibility', 'visible');
    }

}
