import BaseMap from "./base-map";

export default class Cartogram extends BaseMap {
    constructor(width, height, particlesContainer, levelOfDetail, animationCb){
        super(width, height, particlesContainer, levelOfDetail, false);
        this.levelOfDetail = levelOfDetail;

        super.show(true, false);

        this.symbolPadding = 5;
        this.drawSymbols(animationCb);

    }

    drawSymbols(animationCb){
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

        const force = map._d3.layout.force()
        .charge(0)
        .gravity(0)
        .size([this.width - this.symbolPadding, this.height - this.symbolPadding]);

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
                y: centroid[1],
                x0: centroid[0],
                y0: centroid[1],
                r: r,
                value: orders
            };

        });

        this.node = map.svg.append("g")
        .attr("id", `cartogram-${id}`)
        .selectAll("rect")
        .data(this.nodes)
        .enter()
        .append("rect")
        .attr("class", "rect");

        if(this.isFunction(animationCb)){
            this.node
            .attr('width', 0)
            .attr('height', 0)
            .transition()
            .delay(300)
            .attr("x", d => { return d.x - d.r; })
            .attr("y", d => { return d.y - d.r; })
            .attr("width", d => { return d.r * 2; })
            .attr("height", d => { return d.r * 2; })
            .each("end", () => {
                animationCb();

                force
                .nodes(this.nodes)
                .on("tick", this.tick.bind(this, 0.00599))
                .start();

            });
            this[id] = this.node;
        } else {
            this.node
            .attr("width", d => { return d.r * 2; })
            .attr("height", d => { return d.r * 2; });

            this[id] = this.node;
            force
            .nodes(this.nodes)
            .on("tick", this.tick.bind(this, 0.0099))
            .start();
        }
    }

    tick(gravity) {
        this.node
        .each(this.gravity(gravity))
        .each(this.collide(0.25))
        .attr("x", d => { return d.x - d.r; })
        .attr("y", d => { return d.y - d.r; });
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
                    let lx = Math.abs(x);
                    let ly = Math.abs(y);
                    let r = nr + quad.point.r;

                    if (lx < r && ly < r) {
                        if (lx > ly) {
                            lx = (lx - r) * (x < 0 ? -k : k);
                            node.x -= lx;
                            quad.point.x += lx;
                        } else {
                            ly = (ly - r) * (y < 0 ? -k : k);
                            node.y -= ly;
                            quad.point.y += ly;
                        }
                    }
                }

                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }


    removeAllDomNodes(animationCb){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties', animationCb);
        if (typeof this.states !== 'undefined') this.removeSvgElement('states', animationCb);
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){

            this[element]
            .transition()
            .attr("width", 0)
            .attr("height", 0)
            .call(endall, function(){ animationCb(); })
            .remove();
        }
        else {
            this.baseMap._d3.selectAll(`#cartogram-${element}`).remove();
        }
        this[element] = undefined;
    }

    update(levelOfDetail){
        this.levelOfDetail = levelOfDetail;
        this.drawSymbols();
    }

}

