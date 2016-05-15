var agents = [];
var trailSize = 100;
var sketch_p5 = new p5(function(sketch) {

    sketch.setup = function() {
        var myCanvas = sketch.createCanvas(700, 500);
        var canvasContainer = document.getElementById("canvasContainer");
        myCanvas.parent(canvasContainer);
        sketch.colorMode(sketch.RGB);
        sketch.rectMode(sketch.CENTER);
        sketch.ellipseMode(sketch.CENTER);
        sketch.background(235);
        sketch.frameRate(10);
        makeNewAgent(sketch.width/2,sketch.height/2);
    }
    
    sketch.renderAgent = function(element) {
        sketch.stroke("rgb(0,0,0)")
        sketch.ellipse(element.x, element.y, 5, 5);
        if (element.history.length) {
            sketch.line(element.x, element.y, element.history[0].x, element.history[0].y);
            for (i=0; i<element.history.length-1; i++) {
                var intensity = (i/trailSize)*255
                sketch.stroke("rgb("+intensity+","+intensity+","+intensity+")");
                sketch.line(element.history[i].x, element.history[i].y, element.history[i+1].x, element.history[i+1].y);
            }
        }
    }

    sketch.moveAgent = function(element) {
        // Log the last 10 positions of the agent.
        element.history.unshift({x: element.x, y: element.y});
        if (element.history.length > trailSize) {
            element.history.pop();
        }
        element.x += sketch.random(-10,10);
        element.y += sketch.random(-10,10);
    }
    
    sketch.draw = function() {
        sketch.background(235);
        sketch.fill("#000000");
        sketch.strokeWeight(3);
        agents.forEach(sketch.renderAgent);
        agents.forEach(sketch.moveAgent);
    }
    
    
})

makeNewAgent = function(xpos,ypos) {
    agents.push({
            id: agents.length,
            x: xpos,
            y: ypos,
            history: []
    })
}
