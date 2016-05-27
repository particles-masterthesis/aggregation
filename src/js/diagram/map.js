export default class Map {

    /**
     * @param container
     */
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.projection = d3.geo.albersUsa()
            .scale(1400)
            .translate([this.width / 2, this.height / 2]);

        let path = d3.geo.path()
            .projection(projection);

        this.svg = d3.select("body").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        d3.select(self.frameElement).style("height", this.height + "px");
    }

    /**
     * Resets the drawn diagram
     */
    reset() {
        this.stage.removeChildren();
    }

    json(path, cb){
        d3.json(
            `${location.origin}${location.pathname}/dist/dataset/topojson/us.json`,
            function(error, us) {
                if (error) throw error;
                cb(us);
            });
    }
}
