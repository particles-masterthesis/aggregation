import BaseMap from "./base-map";

export default class Cartogram extends BaseMap {
    constructor(width, height, particlesContainer, levelOfDetail, colorScheme, keepInformation, animationCb){
        super(width, height, particlesContainer, levelOfDetail, false, colorScheme);
        this.levelOfDetail = levelOfDetail;

        this.symbolPadding = 0.01;
        this.force = this.baseMap._d3.layout.force()
        .charge(0)
        .gravity(0)
        .size([this.width - this.symbolPadding, this.height - this.symbolPadding]);


        if(!keepInformation){
            super.show(true, false);
            this.drawSymbols(false, animationCb);
        } else{
            this.nodes = keepInformation.data;
            this.node = keepInformation.symbols;

            if(this.levelOfDetail === 'county'){
                this.counties = this.node;
            } else {
                this.states = this.node;
            }

            this.force
            .nodes(this.nodes)
            .on("tick", this.tick.bind(this, 0.0099))
            .start();

            animationCb();
        }

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

    draw(id, animationCb){
        const map = this.baseMap;

        const data = map._topojson.feature(map.data.us, map.data.us.objects[id]).features;
        this.nodes = data
        .filter( d => {
            let centroid = map.path.centroid(d);
            return !(isNaN(centroid[0]) || isNaN(centroid[1]));
        })
        .map( d => {
            let centroid = map.path.centroid(d);
            let orders = d.properties.orders || 0;
            let r = map.symbolScale(orders) || 0;
            return{
                x: centroid[0],
                x0: centroid[0],
                y: centroid[1],
                y0: centroid[1],
                r: r,
                value: orders
            };

        });

        this.node = map.svg.append("g")
        .attr("id", `cartogram-${id}`)
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr('class', 'bubble')
        .attr('fill', d => {
            let scaled = map.colorScale(d.r);
            return this.getColor[scaled];
        })
        .attr('cx', d => { return d.x; })
        .attr('cy', d => { return d.y; });


        if(this.isFunction(animationCb)){
            this.node
            .attr('r', 0)
            .transition()
            .duration(1000)
            .attr("r", d => { return d.r; })
            .each("end", () => {
                animationCb();

                this.force
                .nodes(this.nodes)
                .on("tick", this.tick.bind(this, 0.00599))
                .start();

            });
            this[id] = this.node;
        } else {
            this.node
            .attr('r', d => { return d.r; });

            this[id] = this.node;

            this.force
            .nodes(this.nodes)
            .on("tick", this.tick.bind(this, 0.0099))
            .start();
        }

        this[id] = this.node;
        this.symbols = this[id];
    }

    tick(gravity) {
        this.node
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

    removeAllDomNodes(animationCb){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties', animationCb);
        if (typeof this.states !== 'undefined') this.removeSvgElement('states', animationCb);
        if (typeof this.symbolLegend !== 'undefined') this.removeSvgElement('symbolLegend');
        if (typeof this.colorLegend !== 'undefined') this.removeSvgElement('colorLegend');

        this.baseMap._d3.selectAll('#cartogram-symbol-legend').remove();
        this.baseMap._d3.selectAll('#cartogram-color-legend').remove();
        this.baseMap._d3.selectAll('#psm-symbol-legend').remove();
        this.baseMap._d3.selectAll('#psm-color-legend').remove();
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){
            this[element]
            .transition()
            .attr("r", 0)
            .call(endall, function(){ animationCb(); })
            .remove();
        }
        else {
            this.baseMap._d3.selectAll(`#cartogram-${element}`).remove();
        }
        this[element] = undefined;
    }

    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;
        this.colorScale2 = this.baseMap._d3.scale.quantize()
        .domain([0, 100])
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);
        this.drawSymbols(true);
        this.drawSymbolLegend();
        this.drawColorLegend(true);
    }


    drawSymbolLegend(){
        let map = this.baseMap;

        if (typeof this.symbolLegend !== 'undefined') return;

        this.symbolLegend = map.svg.append("g")
        .attr("id", "cartogram-symbol-legend")
        .attr("class", "legend")
        .attr("transform", "translate(50, 60)");

        this.symbolLegend.append('circle')
        .attr('class', 'info-bubble')
        .attr('r', 5)
        .attr('cx', 50)
        .attr('cy', -25);

        this.symbolLegend.append('text')
        .attr('class', 'info-text')
        .attr('x', 75)
        .attr('y', -21)
        .text('Orders');

        let tmp = this.symbolLegend;

        this.symbolLegend = this.symbolLegend
        .selectAll("g")
        .data([10, 100, 1000])
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
        let map = this.baseMap;
        let values = [0, 12, 23, 34, 45, 56, 67, 78, 89];
        let labels = ["< 12", 12, 23, 34, 45, 56, 67, 78, "78 <"];
        let width = 40, height = 20;

        if (!forceRedraw && typeof this.colorLegend !== 'undefined') return;
        if (forceRedraw && typeof this.colorLegend !== 'undefined')
            this.removeSvgElement('colorLegend');


        this.colorLegend = map.svg.append("g")
        .attr("id", "cartogram-color-legend");

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
            return this.colorScale2(d);
        });

        legend.append("text")
        .attr("x", width * 3.5)
        .attr("y", (d, i) => { return (i * height) + height - 5; })
        .text((d, i) => { return `${labels[i]} average order quantity`; });
    }


}

