import BaseMap from "./base-map";

export default class ChoroplethMap extends BaseMap {

    constructor(width, height, particlesContainer, levelOfDetail, colorScheme, useSybols, animationCb){
        super(width, height, particlesContainer, levelOfDetail, true, colorScheme);

        this.levelOfDetail = levelOfDetail;
        this.colorScale = this.baseMap.colorScale
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);
        this.useSybols = useSybols;

        super.show(true, true);
        this.drawChoropleth(false, animationCb);
        this.drawLegend(false);
    }

    drawChoropleth(forceRedraw, animationCb){
        if(forceRedraw){
            if (typeof this['counties-units'] !== 'undefined'){
                this['counties-units']
                .attr('fill', d => {
                    return this.colorScale(d.particles);
                });
                return;
            }
            if (typeof this['states-units'] !== 'undefined'){
                this['states-units']
                .attr('fill', d => {
                    return this.colorScale(d.particles);
                });
                return;
            }
        }

        switch (this.levelOfDetail) {
            case "country":
            case "state":
                // this.baseMap.colorScale.domain([0, 2100]);
                if (typeof this['counties-units'] !== 'undefined')
                    this.removeSvgElement('counties');
                if (typeof this['states-units'] === 'undefined')
                    this.draw("states", animationCb);
                break;
            case "county":
                // this.baseMap.colorScale.domain([0, 1000]);
                if (typeof this['states-units'] !== 'undefined')
                    this.removeSvgElement('states');
                if (typeof this['counties-units'] === 'undefined')
                    this.draw("counties", animationCb);
                break;
            default:
                break;
        }
    }

    drawLegend(forceRedraw){
        if (!forceRedraw && typeof this.colorLegend !== 'undefined') return;
        if (forceRedraw && typeof this.colorLegend !== 'undefined')
            this.removeSvgElement('colorLegend');

        // let values = [];
        // for(var i = 0; i<1000; i++){
        //     let color = this.colorScale(i);
        //     if(!(res.indexOf(color) > -1)){
        //         console.log(i);
        //         res.push(color);
        //     }
        // }

        let values =[1, 112, 223, 334, 445, 556, 667, 778, 889];
        let labels = ["1-112", "112-222", "223-333", "334-444","445-555", "556-666", "667-777", "778-888", "889 <"];
        let map = this.baseMap;
        let width = 40, height = 20;

        this.colorLegend = map.svg.append("g")
        .attr("id", "choropleth-color-legend");

        let legend = this.colorLegend.selectAll("g.legend")
        .data(values)
        .enter()
        .append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "legend");

        legend.append("rect")
        .attr("x", height)
        .attr("y", (d, i) => { return i * height; })
        .attr("width", width)
        .attr("height", height)
        .attr("fill", d => {
            return this.colorScale(d);
        });

        legend.append("text")
        .attr("x", width * 3.5)
        .attr("y", (d, i) => { return (i * height) + height - 5; })
        .text((d, i) => { return `${labels[i]} ammount of orders`; });
    }

    removeAllDomNodes(animationCb){
        if (typeof this['states-symbols'] !== 'undefined')
            this.removeSymbols('states-symbols', animationCb);

        if (typeof this['units-symbols'] !== 'undefined')
            this.removeSymbols('states-symbols', animationCb);

        this.baseMap.reset();
        this.baseMap._d3.selectAll('#choropleth-units-states').remove();
        this.baseMap._d3.selectAll('#choropleth-units-counties').remove();
        this.baseMap._d3.selectAll('#choropleth-color-legend').remove();
    }

    removeSymbols(id, animationCb){
        let d3 = this.baseMap._d3;
        let symbols = this[id];
        symbols
        .transition()
        .attr('r', 0)
        .call(window.endall, function(){
            d3.selectAll('#choropleth-symbols-states').remove();
            animationCb();
        });
        this[id] = undefined;
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){
            this[element]
            .transition()
            .attr("fill", "#D3D3D3")
            .call(endall, function(){ animationCb(); })
            .remove();
        } else {
            if(this[element]) this[element].remove();
            this.baseMap._d3.selectAll(`#choropleth-${element}`).remove();
        }
        this[element] = undefined;
    }

    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;

        this.colorScale = this.baseMap.colorScale
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);

        super.updateBaseMap(levelOfDetail);
        this.drawChoropleth(true);
        this.drawLegend(true);
    }

    calculateCircle(coords){
        let circle = [];
        let length = 0;
        let lengths = [length];
        let polygon = this.baseMap._d3.geom.polygon(coords);
        let p0 = coords[0];
        let p1, x, y, i = 0, n = coords.length;

        while(++i < n){
            p1 = coords[i];
            x = p1[0] - p0[0];
            y = p1[1] - p0[1];
            lengths.push(length =+ Math.sqrt(x * x + y * y));
            p0 = p1;
        }

        let area = polygon.area();
        let radius = 20;
        let centroid = polygon.centroid(-1 / (6 * area));
        let angleOffset = -Math.PI / 2;
        let angle, k = 2 * Math.PI / lengths[lengths.length - 1];
        i = -1;

        while(++i < n){
            angle = angleOffset + lengths[i] * k;
            circle.push([
                centroid[0] + radius * Math.cos(angle),
                centroid[1] + radius * Math.sin(angle),
            ]);
        }
        return circle;

    }

    draw(id, animationCb){
        let map = this.baseMap;

        const data = map._topojson.feature(map.data.us, map.data.us.objects[id]).features;

        this.nodes = data
        .filter( d => {
            let centroid = map.path.centroid(d);
            return !(isNaN(centroid[0]) || isNaN(centroid[1]));
        })
        .map( d => {
            let centroid = map.path.centroid(d);
            // let originCoords = d.geometry.coordinates[0][0].map(
            //     map.projection
            // );
            // let circleCoords = this.calculateCircle(originCoords);
            // let shapePath = 'M' + originCoords.join('L') + 'Z';
            // let circlePath = 'M' + circleCoords.join('L') + 'Z';
            return{
                type: d.type,
                id: d.id,
                geometry: d.geometry,
                // shapePath: shapePath,
                // circlePath: circlePath,
                x: centroid[0],
                y: centroid[1],
                value: d.properties.orders,
                particles: 0,
                data: d.properties
            };
        });

        this[`${id}-units`] = map.svg
        .append("g")
        .attr("id", `choropleth-units-${id}`)
        .selectAll("path")
        .data(this.nodes)
        .enter()
        .append('path')
        .attr('class', 'show-boundaries');

        if(this.isFunction(animationCb)){

            this[`${id}-units`]
            .attr("fill", "#D3D3D3");

            if(this.useSybols){
                this[`${id}-symbols`] = map.svg
                .append("g")
                .attr("id", `choropleth-symbols-${id}`)
                .selectAll("circle")
                .data(this.nodes)
                .enter()
                .append('circle')
                .attr('class', d => {
                    return `state-${d.data.stateId}`; })
                .attr('cx', d => { return d.x; })
                .attr('cy', d => { return d.y; })
                .attr('r', 20)
                .attr('fill', d => { return this.colorScale(1); });
            }
        } else {
            this[`${id}-units`]
            .attr("fill", d => {return this.colorScale(d.value);})
            .attr("d", map.path);
            // .attr("d", d => {
            //     return d.shapePath;
            // });
        }
    }

    colorSymbolsAndRemoveArea(levelOfDetail, animationCb){
        let map = this.baseMap;
        let id;
        switch (levelOfDetail) {
            case "country":
            case "state":
                id = 'states';
                break;
            case "county":
                id = 'counties';
                break;
            default:
                break;
        }

        this[`${id}-symbols`] = map.svg
        .append("g")
        .attr("id", `choropleth-symbols-${id}`)
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append('circle')
        .attr('class', d => { return `state-${d.data.stateId}`; })
        .attr('cx', d => { return d.x; })
        .attr('cy', d => { return d.y; })
        .attr('r', 20)
        .attr('fill', d => {
            return this.colorScale(d.particles);
        });

        this.removeSvgElement(`${id}-units`, animationCb);
    }

    colorSymbol(levelOfDetail, stateId){
        let map = this.baseMap;
        let id;
        switch (levelOfDetail) {
            case "country":
            case "state":
                id = 'states';
                break;
            case "county":
                id = 'counties';
                break;
            default:
                break;
        }

        map.svg
        .select(`.state-${stateId}`)
        .attr('fill', d => {
            return this.colorScale(d.particles);
        });
    }

    colorAreaAndRemoveSymbols(levelOfDetail, useParticles, animationCb){
        let map = this.baseMap;
        let id;
        switch (levelOfDetail) {
            case "country":
            case "state":
                id = 'states';
                break;
            case "county":
                id = 'counties';
                break;
            default:
                break;
        }

        var symbols = this[`${id}-symbols`];
        var units = this[`${id}-units`];
        var colorScale = this.colorScale;

        let unitTransition = map._d3
        .transition()
        .duration(1000)
        .each( function() {
            if(symbols != null){
                units
                .transition()
                .attr('fill', d => {
                    return useParticles? colorScale(d.particles) : colorScale(d.value);
                })
                .attr("d", map.path);
            } else {
                units
                .transition()
                .attr('fill', d => {
                    return useParticles? colorScale(d.particles) : colorScale(d.value);
                })
                .attr("d", map.path)
                .call(endall, function(){
                    animationCb();
                    map._d3.selectAll('#psm-states').remove();
                    map._d3.selectAll('#psm-counties').remove();
                });
            }
        });

        if(symbols != null){
            unitTransition
            .transition()
            .each( function() {
                symbols
                .transition()
                .attr('r', 0)
                .remove()
                .call(endall, function(){
                    map._d3.selectAll('#choropleth-symbols-states').remove();

                    animationCb();
                });
            });
        }
        this[`${id}-symbols`] = undefined;
    }
}
