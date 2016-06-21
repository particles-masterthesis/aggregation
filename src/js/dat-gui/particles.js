export default function (dataStore, ui, canvas, update) {
    let folder = ui.DatGui.addFolder("Particles");

    folder.add(canvas.particles, "arrivalSync").onChange((value) => {
        canvas.particlesContainer.setParticlesSpeed(canvas.particles.speedPxPerFrame);

        if(value) canvas.particlesContainer.calculateSpeedArrivingSameTime();
    });

    folder.add(canvas.particles, "speedPxPerFrame", 0, 10).onChange((value) => {
        canvas.particlesContainer.setParticlesSpeed(value);
        if(canvas.particles.arrivalSync) canvas.particlesContainer.calculateSpeedArrivingSameTime();
        if(canvas.visualizationOld) canvas.visualizationOld.calculateSpeed(canvas.particlesContainer.getAmountOfFrames());
        canvas.visualization.calculateSpeed(canvas.particlesContainer.getAmountOfFrames());
    });

    folder.add(
        canvas.particles,
        "shape",
        ["rectangle", "circle"]
    ).onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folder.open();
}
