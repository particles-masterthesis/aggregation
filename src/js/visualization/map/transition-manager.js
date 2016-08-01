function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

function animateParticleToCentroidSymbolAndColor(currentViz, canvas, upcomingViz) {
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
                    if(obj.data.stateId == particle.data.StateId){
                        ++obj.particles;
                        // obj.particles = Math.floor(Math.random() * 2000) + 100;
                        return true;
                    }
                    return false;
                });

                upcomingViz.colorSymbol(
                    canvas.levelOfDetail,
                    particle.data.StateId
                );
            }
        );
    }
}

function animateParticleToOriginAndColor(currentViz, canvas, upcomingViz) {
    for (let particle of currentViz.particles) {
        particle.transitionTo(
            particle.coords[0] - upcomingViz.size/2,
            particle.coords[1] - upcomingViz.size/2,
            upcomingViz.size,
            upcomingViz.size,
            'linear',
            () => {
                currentViz.nodes.filter( (obj) => {
                    if(obj.data.stateId == particle.data.StateId){
                        obj.particles -= 1;
                        return true;
                    }
                    return false;
                });

                currentViz.colorSymbol(
                    canvas.levelOfDetail,
                    particle.data.StateId
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
                        null,
                        this.currentViz.constructor.name === "ProportionalSymbolMap",
                        false,
                        () => {
                        }
                    );
                    upcomingViz.type = 'psm';

                    animateParticleToCentroidSymbolAndColor(
                        this.currentViz,
                        this.canvas,
                        upcomingViz.obj
                    );
                    this.canvas.particlesContainer.startAnimation();
                    this.canvas.render();

                    canvas.animationQueue.push(() => {
                        upcomingViz.obj.scaleSymbol(
                            false,
                            canvas.levelOfDetail,
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
                            dataStore.data,
                            () => {},
                            true
                        );
                    upcomingViz.type = 'dot';

                    this.currentViz.scaleSymbol(
                        20,
                        this.canvas.levelOfDetail,
                        () => {
                            this.setParticleAlpha(1);
                            this.canvas.particlesContainer.startAnimation();
                            this.canvas.render();
                        }
                    );

                    canvas.animationQueue.push(() => {
                        animateParticleToOriginAndColor(
                            this.currentViz,
                            this.canvas,
                            upcomingViz.obj
                        );
                    });

                    canvas.animationQueue.push(() => {
                        this.currentViz.removeAllDomNodes(()=>{
                            this.disableSelection(false);
                        });
                    });

                    resolve(upcomingViz);
                    break;

                case 'dot_choropleth':
                    upcomingViz.obj = this.canvas.drawChoroplethMap(
                        null,
                        this.currentViz.constructor.name === "ChoroplethMap",
                        true,
                        () => {
                        }
                    );
                    upcomingViz.type = 'choropleth';

                    animateParticleToCentroidSymbolAndColor(
                        this.currentViz,
                        this.canvas,
                        upcomingViz.obj
                    );
                    this.canvas.particlesContainer.startAnimation();
                    this.canvas.render();

                    canvas.animationQueue.push(() => {
                        upcomingViz.obj.colorAreaAndRemoveSymbols(
                            canvas.levelOfDetail,
                            true,
                            () => {
                                this.setParticleAlpha(0);
                                this.disableSelection(false);
                                // console.log(upcomingViz.obj);
                            }
                        );
                    });

                    resolve(upcomingViz);
                    break;

                case 'choropleth_dot':
                    this.canvas.stop();
                    upcomingViz.obj = this.canvas.drawDotMap(
                            dataStore.data,
                            () => {},
                            true
                        );
                    upcomingViz.type = 'dot';

                    this.currentViz.colorSymbolsAndRemoveArea(
                        this.canvas.levelOfDetail,
                        () => {
                            this.setParticleAlpha(1);
                            this.canvas.particlesContainer.startAnimation();
                            this.canvas.render();
                        }
                    );

                    canvas.animationQueue.push(() => {
                        animateParticleToOriginAndColor(
                            this.currentViz,
                            this.canvas,
                            upcomingViz.obj
                        );
                    });

                    canvas.animationQueue.push(() => {
                        this.currentViz.removeAllDomNodes(()=>{
                            this.disableSelection(false);
                        });
                    });

                    resolve(upcomingViz);

                    break;

                case 'psm_choropleth':
                    upcomingViz.obj = this.canvas.drawChoroplethMap(
                        null,
                        this.currentViz.constructor.name === "ChoroplethMap",
                        false,
                        () => {
                        }
                    );
                    upcomingViz.type = 'choropleth';

                    this.currentViz.scaleSymbol(
                        20,
                        this.canvas.levelOfDetail,
                        () => {
                            upcomingViz.obj.colorAreaAndRemoveSymbols(
                                canvas.levelOfDetail,
                                false,
                                () => {
                                    this.currentViz.removeAllDomNodes(()=>{
                                        this.disableSelection(false);
                                    });
                                }
                            );
                        }
                    );


                    resolve(upcomingViz);
                    break;

                // case 'choropleth_psm':



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
