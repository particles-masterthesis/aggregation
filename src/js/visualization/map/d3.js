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

        // this.scale = d3.scale.sqrt()
        // .domain([0, 500])
        // .range([0, 15]);

        this.scale = d3.scale.log()
        .domain([1, 100])
        .range([0, 20]);

        this.path = d3.geo.path().projection(this.projection);
        this.svg = d3.select("body > svg");
        if (this.svg.empty()){
            this.svg = d3.select("body").append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
        }

        this.data = {};

        $.ajax({
            dataType: "json",
            url: `${location.origin}${location.pathname}/dist/datasets/us.json`,
            async: false,
            success: (us) => {
                this.data.us = us;
                window.us = us;

                let counties = topojson.feature(us, us.objects.counties).features;
                let states = topojson.feature(us, us.objects.states).features;

                function filterFnc(obj){
                    return obj.id === stateId;
                }

                // get orders aggregated on states object
                for(let i = 0; i < counties.length; i++){
                    var stateId = counties[i].properties.stateId;
                    let state = states.filter(filterFnc)[0];

                    if ('orders' in state.properties){
                        state.properties.orders += Number((counties[i].properties.orders || 0));
                    } else {
                        state.properties.orders = Number((counties[i].properties.orders || 0));
                    }
                }
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
                if (typeof this.d3Counties !== 'undefined') this.removeSvgElement('d3Counties');
                if (typeof this.d3States !== 'undefined') this.removeSvgElement('d3States');
                if (typeof this.d3Country === 'undefined') this.drawCountry();
                break;
            case "state":
                if (typeof this.d3Counties !== 'undefined') this.removeSvgElement('d3Counties');
                if (typeof this.d3States === 'undefined') this.drawStates();
                break;
            case "county":
                if (typeof this.d3States === 'undefined') this.drawStates();
                if (typeof this.d3Counties == 'undefined') this.drawCounties();
                break;
            default:
                break;
        }
    }

    removeSvgElement(element){
        this[element].remove();
        this[element] = undefined;
    }

    drawCountry(){
        this.d3Country = this.svg.append("path", ".graticule")
        .datum(topojson.feature(this.data.us, this.data.us.objects.country))
        .attr("class", "country")
        .attr("d", this.path);
    }

    drawStates(){
        this.d3States = this.svg.insert("svg:path", ".country + *")
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
        this.d3Counties = this.svg.insert("svg:path", ".states + *")
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
