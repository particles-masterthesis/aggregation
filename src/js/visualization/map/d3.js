import d3 from 'd3';
import topojson from  'topojson';

import { colorbrewer } from './colorbrewer.min.js';

let singleton = Symbol();
let singletonEnforcer = Symbol();


window.endall = function (transition, callback) {
    if (!callback) callback = function(){};
    if (transition.size() === 0) { callback(); }
    var n = 0;

    transition
    .each(function() { ++n; })
    .each("end", function() { if (!--n) callback.apply(this, arguments); });
};

export default class D3 {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer){
            throw "Cannot construct D3 singleton";
        }
        this._d3 = d3;
        this._topojson = topojson;
        this.colorbrewer = colorbrewer;

    }

    init(width, height, levelOfDetail, drawMap){
        this.width = width;
        this.height = height;
        this.projection = this._d3.geo.albersUsa()
                .scale(width)
            .translate([this.width / 2, this.height / 2]);

        this.symbolScale = this._d3.scale.log()
        .domain([1, 100])
        .range([0, 20]);

        this.colorScale = this._d3.scale.quantile()
        .domain(this._d3.range(10).map( i => i * 4 ))
        .range(this._d3.range(9));

        this.path = this._d3.geo.path().projection(this.projection);
        this.svg = this._d3.select("body > svg");
        if (this.svg.empty()){
            this.svg = this._d3.select("body").append("svg")
                .attr('class', 'default')
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

        this.data.topojson = {};
        this.data.topojson.country = topojson.feature(
            this.data.us,
            this.data.us.objects.country
        );
        this.data.topojson.states = topojson.mesh(
            this.data.us,
            this.data.us.objects.states,
            (a, b) => {
                return a !== b;
            }
        );
        this.data.topojson.counties = topojson.mesh(
            this.data.us,
            this.data.us.objects.counties,
            (a, b) => {
                return (
                    a !== b &&
                    !(this.getCountyIdentifier(a) / 1000 ^ this.getCountyIdentifier(b) / 1000)
                );
            }
        );

        if(drawMap) this.update(levelOfDetail);


        this._d3.select(self.frameElement).style("height", this.height + "px");

        this.centroids = {};
        this.calculateCentroids('states');
        this.calculateCentroids('counties');

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
                if (typeof this.d3Country === 'undefined') this.drawCountry();
                if (typeof this.d3States === 'undefined') this.drawStates();
                break;
            case "county":
                if (typeof this.d3Country === 'undefined') this.drawCountry();
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
        .datum(this.data.topojson.country)
        .attr("class", "country")
        .attr("d", this.path);
    }

    drawStates(){
        this.d3States = this.svg.insert("svg:path", ".country + *")
        .datum(this.data.topojson.states)
        .attr("id","states")
        .attr("class", "state-boundary")
        .attr("d", this.path);
    }

    drawCounties(){
        this.d3Counties = this.svg.insert("svg:path", ".states + *")
        .datum(this.data.topojson.counties)
        .attr("id","counties")
        .attr("class", "county-boundary")
        .attr("d", this.path);
    }

    hide(hideSvg, hideMap){
        if(hideSvg) this.svg.style('visibility', 'hidden');
        if(hideMap) this.svg.classed('hideMap', true);
    }

    show(showSvg, showMap){
        if(showSvg) this.svg.style('visibility', 'visible');
        if(showMap) this.svg.classed('hideMap', false);
    }

    reset(){
        this.svg.attr('class', 'default');
    }

    getCountyIdentifier(d){
        return Number(d.id.substring(d.id.search("S")+1, d.id.search("S")+6));
    }

    calculateCentroids(levelOfDetail){
        const boundaries = this._topojson.feature(
            this.data.us,
            this.data.us.objects[levelOfDetail]
        ).features;

        this.centroids[levelOfDetail] = {};
        for(let boundary of boundaries){
            this.centroids[levelOfDetail][boundary.id] = this.path.centroid(boundary);
        }
    }

}
