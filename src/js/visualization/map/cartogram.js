import BaseMap from "./base-map";

function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

export default class Cartogram extends BaseMap {
    constructor(
        width,
        height,
        particlesContainer,
        levelOfDetail,
        colorScheme
    ){
        super(
            width,
            height,
            particlesContainer,
            levelOfDetail,
            false,
            colorScheme
        );

        this.symbolPadding = 0.01;

        this.force = this.baseMap._d3.layout.force()
        .charge(0)
        .gravity(0)
        .size([
            this.width - this.symbolPadding,
            this.height - this.symbolPadding
        ]);

        // if(!keepInformation){
        //     super.show(true, false);
        //     this.drawSymbols(false, animationCb);
        // } else{
        //     this.nodes = keepInformation.data;
        //     this.node = keepInformation.symbols;

        //     if(this.levelOfDetail === 'county'){
        //         this.counties = this.node;
        //     } else {
        //         this.states = this.node;
        //     }

        //     this.force
        //     .nodes(this.nodes)
        //     .on("tick", this.tick.bind(this, 0.0099))
        //     .start();

        //     animationCb();
        // }

    }

    initSymbols(nodes, symbols){
        let map = this.baseMap;

        this.nodes = nodes == null? map.nodes[this.id]: nodes;
        this.nodes.sort( (a, b) => {
            return b.data.population - a.data.population;
        });

        if(symbols){
            this[this.id] = symbols;
            map.svg
            .select(`#${this[this.id][0].parentNode.id}`)
            .attr("id", `cartogram-${this.id}`);
            return;
        }

        this[this.id] = map.svg.append("g")
        .attr("id", `cartogram-${this.id}`)
        .attr("class", "bubble")
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr('cx', d => { return d.x; })
        .attr('cy', d => { return d.y; });
    }

    drawDefaultSymbols(){
        this[this.id]
        .attr("r", 20)
        .attr('fill', d => { return this.colorScale(1); })
        .attr('class', d => { return `${this.id}-${d.id}`; });
    }

    colorSymbol(id){
        this.baseMap.svg
        .select(`.${this.id}-${id}`)
        .attr('fill', d => {
            return this.colorScale(d.particles);
        });
    }

    colorSymbols(){
        this[this.id]
        .attr('fill', d => {
            return this.colorScale(d.particles);
        });
    }

    translateSymbolsToOrigin(animationCb){
        this.force.stop();
        this[this.id]
        .transition()
        .attr("cx", d => { return d.x0; })
        .attr("cy", d => { return d.y0; })
        .call(window.endall, animationCb(() => {
            let circles = this[this.id][0];
            for(let i = 0; i < circles.length; i++){
                if(circles[i] == null) continue;
                circles[i].__data__.x = circles[i].__data__.x0;
                circles[i].__data__.y = circles[i].__data__.y0;
            }
            this[this.id][0] = circles;
        }));

    }

    scaleSymbols(defaultValue, animationCb){
        this[this.id]
        .transition()
        .duration(1000)
        .attr("r", d => { return defaultValue || d.r; })
        .call(window.endall, animationCb((enableSelection) => {
            sleep(1500).then(() => {
                this.force
                .nodes(this.nodes)
                .on("tick", this.tick.bind(this, 0.00599))
                .on("end", () => {
                    enableSelection();
                    this.hide(false, true);
                })
                .start();
            });
        }));
    }

    drawSymbols(forceRedraw, animationCb){
        if(forceRedraw){
            if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
            if (typeof this.states !== 'undefined') this.removeSvgElement('states');
        }

        switch (this.levelOfDetail) {
            case "country":
            case "state":
                if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
                if (typeof this.states === 'undefined') this.draw("states", animationCb);
                break;
            case "county":
                if (typeof this.states !== 'undefined') this.removeSvgElement('states');
                if (typeof this.counties === 'undefined') this.draw("counties", animationCb);
                break;
            default:
                break;
        }
    }

    // draw(id, animationCb){
    //     const map = this.baseMap;

    //     const data = map._topojson.feature(map.data.us, map.data.us.objects[id]).features;
    //     this.nodes = data
    //     .filter( d => {
    //         let centroid = map.path.centroid(d);
    //         return !(isNaN(centroid[0]) || isNaN(centroid[1]));
    //     })
    //     .map( d => {
    //         let centroid = map.path.centroid(d);
    //         let r = map.symbolScale(d.properties.population) || 0;
    //         return{
    //             x: centroid[0],
    //             x0: centroid[0],
    //             y: centroid[1],
    //             y0: centroid[1],
    //             r: r,
    //             data: d.properties
    //         };
    //     });

    //     this.node = map.svg.append("g")
    //     .attr("id", `cartogram-${id}`)
    //     .attr("class", "bubble")
    //     .selectAll("circle")
    //     .data(this.nodes)
    //     .enter()
    //     .append("circle")
    //     .attr('class', `${id}-bubbles`)
    //     .attr('fill', d => {
    //         return this.colorScale(d.data.orders);
    //     })
    //     .attr('cx', d => { return d.x; })
    //     .attr('cy', d => { return d.y; });

    //     if(this.isFunction(animationCb)){
    //         this.node
    //         .attr('r', 0)
    //         .transition()
    //         .duration(1000)
    //         .attr("r", d => { return d.r; })
    //         .each("end", () => {
    //             animationCb();

    //             this.force
    //             .nodes(this.nodes)
    //             .on("tick", this.tick.bind(this, 0.00599))
    //             .start();

    //         });
    //         this[id] = this.node;
    //     } else {
    //         this.node
    //         .attr('r', d => { return d.r; });

    //         this[id] = this.node;

    //         this.force
    //         .nodes(this.nodes)
    //         .on("tick", this.tick.bind(this, 0.0099))
    //         .start();
    //     }

    //     this[id] = this.node;
    //     this.symbols = this[id];
    // }

    tick(gravity) {
        this[this.id]
        .each(this.gravity(gravity))
        .each(this.collide(0.25))
        .attr("cx", d => { return d.x; })
        .attr("cy", d => { return d.y; });
    }

    gravity(k) {
        return d => {
            d.x += (d.x0 - d.x) * k;
            d.y += (d.y0 - d.y) * k;
        };
    }

    collide(k) {
        let q = this.baseMap._d3.geom.quadtree(this.nodes);
        return node => {
            let nr = node.r + this.symbolPadding;
            let nx1 = node.x - nr;
            let nx2 = node.x + nr;
            let ny1 = node.y - nr;
            let ny2 = node.y + nr;
            q.visit( (quad, x1, y1, x2, y2) => {
                if (quad.point && (quad.point !== node)) {
                    let x = node.x - quad.point.x;
                    let y = node.y - quad.point.y;

                    let l = Math.sqrt(x * x + y * y);
                    let r = nr + quad.point.r;

                    if (l < r) {
                        l = (l - r) / l * k;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;

                    }
                }

                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    update(levelOfDetail, colorScheme){
        if(levelOfDetail !== this.levelOfDetail){
            this.removeSvgElement(this.id);
            this.levelOfDetail = levelOfDetail;

            this.setId();

            this.initSymbols(
                super.updateParticlesOnLevel(levelOfDetail)
            );
            this.scaleSymbols(false, () => {
                this.colorSymbols();
                this.force
                .nodes(this.nodes)
                .on("tick", this.tick.bind(this, 0.00599))
                .start();
            });

            super.updateBaseMap(levelOfDetail);
        }

        if(colorScheme !== this.colorScheme){
            this.colorScheme = colorScheme;

            this.colorScale = this.baseMap.colorScale
            .range(this.baseMap.colorbrewer[this.colorScheme][9]);
            this.colorSymbols();
            this.drawColorLegend(true);
        }

        this.drawSymbolLegend();
    }

    removeAllDomNodes(animationCb){
        this.removeSvgElement('colorLegend');
        this.removeSvgElement('symbolLegend');
        this.removeSvgElement(this.id, () => {
            this.removeSvgElement(this.id);
            animationCb();
        });
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){
            this[element]
            .transition()
            .attr("r", 0)
            .call(endall, function(){ animationCb(); });
        } else{
            this[element].remove();
            this.baseMap._d3.selectAll(`#cartogram-${element}`).remove();
            return delete this[element];
        }
    }


    drawSymbolLegend(){
        let map = this.baseMap;

        if (typeof this.symbolLegend !== 'undefined') return;

        this.symbolLegend = map.svg.append("g")
        .attr("id", "cartogram-symbolLegend")
        .attr("class", "legend")
        .attr("transform", "translate(50, 60)");

        this.symbolLegend.append('text')
        .attr('class', 'info-text')
        .attr('x', 50)
        .attr('y', -21)
        .text('Population');

        let tmp = this.symbolLegend;

        this.symbolLegend = this.symbolLegend
        .selectAll("g")
        .data([1e6, 3e6, 6e6])
        .enter().append("g");

        this.symbolLegend.append("circle")
        .attr("cy", function(d) { return -map.symbolScale(d); })
        .attr("r", map.symbolScale);

        this.symbolLegend.append("text")
        .attr("y", function(d) { return -2 * map.symbolScale(d); })
        .attr("dy", "1.3em")
        .text(this.baseMap._d3.format(".1s"));

        this.symbolLegend = tmp;
    }

    drawColorLegend(forceRedraw){

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
        .attr("id", "cartogram-colorLegend");

        let legend = this.colorLegend.selectAll("g.legend")
        .data(values)
        .enter()
        .append("g")
        .attr("transform", "translate(150,0)")
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


}

