function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

function animateParticleToCentroidSymbolAndColor(
    currentViz,
    canvas,
    upcomingViz
) {
    let id = currentViz.id === 'counties'? 'CountyId' : 'StateId';
    for (let particle of currentViz.particles) {
        let coords = currentViz.getCentroidOfParticle(
            particle,
            canvas.levelOfDetail
        );

        particle.transitionTo(
            coords[0] - currentViz.size/2,
            coords[1] - currentViz.size/2,
            currentViz.size,
            currentViz.size,
            'linear',
            () => {

                upcomingViz.nodes.filter( (obj) => {
                    if(obj.id == particle.data[id]){
                        ++obj.particles;
                        // obj.particles = Math.floor(Math.random() * 2000) + 100;
                        return true;
                    }
                    return false;
                });

                upcomingViz.colorSymbol(
                    particle.data[id]
                );
            }
        );
    }
}

function animateParticleToOriginAndColor(
    currentViz,
    canvas,
    upcomingViz
) {
    let id = currentViz.id === 'counties'? 'CountyId' : 'StateId';
    for (let particle of currentViz.particles) {
        particle.transitionTo(
            particle.coords[0] - upcomingViz.size/2,
            particle.coords[1] - upcomingViz.size/2,
            upcomingViz.size,
            upcomingViz.size,
            'linear',
            () => {
                currentViz.nodes.filter( (obj) => {
                    if(obj.id == particle.data[id]){
                        --obj.particles;
                        return true;
                    }
                    return false;
                });

                currentViz.colorSymbol(
                    particle.data[id]
                );
            }
        );
    }
}

export default class TransitionManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset = 0;
    }

    isCurrentVisualization(constructorName){
        if(constructorName === 'ProportionalSymbolMap') return true;
        if(constructorName === 'ChoroplethMap') return true;
        if(constructorName === 'Cartogram') return true;
        return false;
    }

    drawDot() {
        return {
            obj: this.canvas.drawDotMap(
                dataStore.data,
                () => {}
            ),
            type: 'dot'
        };
    }

    fadeParticles(type) {
        for (let particle of this.currentViz.particles) {
            particle.fade(type);
        }
        this.canvas.particlesContainer.startAnimation();
    }

    setParticleAlpha(value) {
        for (let particle of this.currentViz.particles) {
            particle.setAlpha(value);
        }
    }

    disableSelection(val){
        $("select").each(function(){
            $(this).attr("disabled", val);
        });
    }

    animate(current, upcoming) {
        return new Promise((resolve, reject) => {
            this.canvas.stop();
            this.currentViz = current.obj;
            this.upcomingVizType = upcoming;

            this.disableSelection(true);
            let upcomingViz = {};
            let information;
            const transitionKey = `${current.type}_${upcoming}`;
            console.log(transitionKey);
            switch (transitionKey) {
                case 'dot_psm':
                    upcomingViz.obj = this.canvas.drawProportionalSymbolMap(
                            this.isCurrentVisualization()
                        );
                    upcomingViz.type = 'psm';

                    upcomingViz.obj.initSymbols();
                    upcomingViz.obj.drawDefaultSymbols();
                    upcomingViz.obj.drawSymbolLegend();
                    upcomingViz.obj.drawColorLegend();

                    animateParticleToCentroidSymbolAndColor(
                        this.currentViz,
                        this.canvas,
                        upcomingViz.obj
                    );
                    this.canvas.particlesContainer.startAnimation();
                    this.canvas.render();

                    canvas.animationQueue.push(() => {
                        upcomingViz.obj.scaleSymbols(
                            false,
                            () => {
                                this.setParticleAlpha(0);
                                this.disableSelection(false);
                            }
                        );
                    });

                    resolve(upcomingViz);
                    break;

                case 'psm_dot':
                    this.canvas.stop();
                    upcomingViz.obj = this.canvas.drawDotMap(
                        dataStore.data
                    );
                    upcomingViz.type = 'dot';

                    this.currentViz.scaleSymbols(
                        20,
                        () => {
                            this.setParticleAlpha(1);
                        }
                    );

                    animateParticleToOriginAndColor(
                        this.currentViz,
                        this.canvas,
                        upcomingViz.obj
                    );

                    this.canvas.particlesContainer.startAnimation();
                    this.canvas.render();

                    canvas.animationQueue.push(() => {
                        this.currentViz.removeAllDomNodes(()=>{
                            this.disableSelection(false);
                        });
                    });

                    resolve(upcomingViz);
                    break;

                case 'dot_choropleth':
                    upcomingViz.obj = this.canvas.drawChoroplethMap(
                        this.isCurrentVisualization()
                    );
                    upcomingViz.type = 'choropleth';
                    upcomingViz.obj.initUnits();
                    upcomingViz.obj.initSymbols();
                    upcomingViz.obj.drawDefaultSymbols();
                    upcomingViz.obj.drawLegend();

                    animateParticleToCentroidSymbolAndColor(
                        this.currentViz,
                        this.canvas,
                        upcomingViz.obj
                    );
                    this.canvas.particlesContainer.startAnimation();
                    this.canvas.render();

                    canvas.animationQueue.push(() => {
                        upcomingViz.obj.colorUnits();
                        upcomingViz.obj.scaleSymbols(() => {
                            this.setParticleAlpha(0);
                            this.disableSelection(false);
                            upcomingViz.obj.removeSvgElement(
                                `symbols-${upcomingViz.obj.id}`
                            );
                        });
                    });

                    resolve(upcomingViz);
                    break;

                case 'choropleth_dot':
                    this.canvas.stop();
                    upcomingViz.obj = this.canvas.drawDotMap(
                        dataStore.data
                    );
                    upcomingViz.type = 'dot';

                    this.currentViz.initSymbols();
                    this.currentViz.drawDefaultSymbols();
                    this.currentViz.colorSymbols();


                    this.currentViz.removeSvgElement(
                        `units-${this.currentViz.id}`,
                        'unit',
                        () => {
                            this.setParticleAlpha(1);
                            animateParticleToOriginAndColor(
                                this.currentViz,
                                this.canvas,
                                upcomingViz.obj
                            );
                            this.canvas
                            .particlesContainer.startAnimation();
                            this.canvas.render();
                        }
                    );

                    canvas.animationQueue.push(() => {
                        this.currentViz.removeAllDomNodes(()=>{
                            this.disableSelection(false);
                        });
                    });

                    resolve(upcomingViz);

                    break;

                case 'psm_choropleth':
                    upcomingViz.obj = this.canvas.drawChoroplethMap(
                        this.isCurrentVisualization()
                    );
                    upcomingViz.type = 'choropleth';


                    this.currentViz.scaleSymbols(
                        20,
                        () => {
                            upcomingViz.obj.initUnits(undefined, true);
                            upcomingViz.obj.colorUnits();
                            this.currentViz.removeAllDomNodes(() => {
                                upcomingViz.obj.drawLegend();
                                this.disableSelection(false);
                            });
                        }
                    );

                    resolve(upcomingViz);
                    break;

                case 'choropleth_psm':
                    upcomingViz.obj = this.canvas.drawProportionalSymbolMap(
                            this.isCurrentVisualization()
                        );
                    upcomingViz.type = 'psm';

                    upcomingViz.obj.initSymbols();
                    upcomingViz.obj.drawDefaultSymbols();
                    upcomingViz.obj.colorSymbols();

                    this.currentViz.removeSvgElement('colorLegend');
                    let units = `units-${this.currentViz.id}`;
                    this.currentViz.removeSvgElement(
                        units,
                        'unit',
                        () => {
                            upcomingViz.obj.drawSymbolLegend();
                            upcomingViz.obj.drawColorLegend();

                            this.currentViz.removeSvgElement(units);
                            upcomingViz.obj.scaleSymbols(
                                false,
                                () => {
                                    this.disableSelection(false);
                                }
                            );
                        }
                    );

                    resolve(upcomingViz);
                    break;

                case 'dot_cartogram':
                    animateParticleToCentroid(this.currentViz, this.canvas.levelOfDetail);
                    this.canvas.render();

                    upcomingViz.obj = this.canvas.drawCartogram(
                        null,
                        this.currentViz.constructor.name === "Cartogram",
                        false,
                        () => {
                            this.currentViz.hide(false, true);
                            this.fadeParticles('out');
                        }
                    );
                    upcomingViz.type = 'cartogram';
                    resolve(upcomingViz);
                    break;


                case 'cartogram_dot':
                    this.currentViz.removeAllDomNodes((cb) => {
                        if (this.currentViz.isFunction(cb)) cb();
                        this.canvas.stop();
                        upcomingViz = this.drawDot();
                        this.canvas.render();
                        this.canvas.particlesContainer.startAnimation();
                        resolve(upcomingViz);
                    });
                    break;

                case 'psm_cartogram':
                    let psm = this.currentViz;
                    information = {
                        data: psm.nodes,
                        symbols: psm.symbols
                    };

                    console.log(information);
                    upcomingViz.obj = this.canvas.drawCartogram(
                        null,
                        this.currentViz.constructor.name === "Cartogram",
                        information,
                        () => {
                            this.currentViz.hide(false, true);
                            this.fadeParticles('out');
                        }
                    );
                    upcomingViz.type = 'cartogram';
                    resolve(upcomingViz);
                    break;

                case 'cartogram_psm':
                    this.currentViz.force.stop();
                    let cartogram = this.currentViz;
                    console.log(cartogram);
                    information = {
                        data: cartogram.nodes,
                        symbols: cartogram.symbols || cartogram.node
                    };
                    console.log(information);

                    upcomingViz.obj = this.canvas.drawProportionalSymbolMap(
                        null,
                        this.currentViz.constructor.name === "ProportionalSymbolMap",
                        information,
                        () => {
                            this.fadeParticles('out');
                        }
                    );
                    upcomingViz.type = 'psm';
                    resolve(upcomingViz);
                    break;

                case 'choropleth_cartogram':
                case 'cartogram_choropleth':
                    let endResult = upcoming;
                    let dotMapPromise = this.animate(current, 'dot');
                    dotMapPromise.then((dotMap) => {
                        sleep(1500).then(() => {
                            this.animate(dotMap, endResult)
                                .then((result) => {
                                    resolve(result);
                                });
                        });
                    });
                    break;


                default:
                    throw new Error(`Visualization transition not working with ${upcoming}`);
            }
        });
    }
}
