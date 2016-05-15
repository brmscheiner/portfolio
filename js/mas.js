var agents = [];
var sketch_p5 = new p5(function(sketch) {

    sketch.setup = function() {
        var myCanvas = sketch.createCanvas(700, 500);
        var canvasContainer = document.getElementById("canvasContainer");
        myCanvas.parent(canvasContainer);
        sketch.colorMode(sketch.RGB);
        sketch.rectMode(sketch.CENTER);
        sketch.ellipseMode(sketch.CENTER);
        sketch.background(235);
        agents.push({
            id: 1,
            x: sketch.width/2,
            y: sketch.height/2
        })
    }
    
    sketch.renderAgent = function(element) {
        sketch.ellipse(element.x, element.y, 5, 5);
    }

    sketch.moveAgent = function(element) {
        element.x += sketch.random(-1,1);
        element.y += sketch.random(-1,1);
    }
    
    sketch.draw = function() {
        sketch.background(235);
        sketch.fill("#000000");
        agents.forEach(sketch.renderAgent);
        agents.forEach(sketch.moveAgent);
    }
    
    
})


