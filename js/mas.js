var initialAgents = 20;
var trailSize = 50;
var minimumAge = 60;
var minimumDistance = 20;
var pregnancyTime = 20;
var moveDistance = 10;

var agents = [];
var spawnPoints = [];
var sketch_p5 = new p5(function(sketch) {

    sketch.setup = function() {
        var myCanvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        var canvasContainer = document.getElementById("canvasContainer");
        myCanvas.parent(canvasContainer);
        sketch.colorMode(sketch.RGB);
        sketch.rectMode(sketch.CENTER);
        sketch.ellipseMode(sketch.CENTER);
        sketch.background(0);
        sketch.frameRate(15);
        for (i=0; i<initialAgents; i++) {
            makeNewAgent(sketch.width/2, sketch.height/2, sketch.random(255), sketch.random(255), sketch.random(255));
        }
    }
    
    sketch.renderAgent = function(element) {
        if (element.history.length) {
            var intensity = (1/trailSize)*255;
            sketch.line(element.x, element.y, element.history[0].x, element.history[0].y);
            for (i=0; i<element.history.length-1; i++) {
                intensity += 255/trailSize;
                sketch.stroke(intensity);
                sketch.line(element.history[i].x, element.history[i].y, element.history[i+1].x, element.history[i+1].y);
            }
        }
        sketch.stroke(element.r, element.g, element.b);
        sketch.fill(element.r, element.g, element.b);
        sketch.ellipse(element.x, element.y, element.size, element.size);
    }

    sketch.moveAgent = function(element) {
        // Log the last trailSize positions of the agent.
        element.history.unshift({x: element.x, y: element.y});
        if (element.history.length > trailSize) {
            element.history.pop();
        }
        element.x += sketch.random(-moveDistance, moveDistance);
        element.y += sketch.random(-moveDistance, moveDistance);
    }
    
    sketch.incrementAge = function(element) {
        element.age += 1;
    }
    
    sketch.breedAgents = function() {
        for (i=0; i<agents.length; i++) {
            for (j=0; j<agents.length; j++) {
                if (breedingPossible(agents[i],agents[j])) {
                    agents[i].breeding = true;
                    agents[j].breeding = true;
                }
            }
        }
    }
    
    sketch.operateAgent = function(element) {
        if (element.breeding == true) {
            element.babyCountdown -= 1;
            sketch.stroke("rgb(255,0,0)");
            sketch.ellipse(element.x, element.y, element.size, element.size);
            if (element.babyCountdown == 0) {
                console.log("Let's make some babies");
                element.age = 0;
                element.babyCountdown = pregnancyTime;
                element.breeding = false;
            }
        } else {
            sketch.moveAgent(element);
        }
    }
    
    sketch.killOffscreenAgents = function() {
        var onScreenAgents = [];
        for (i=0; i<agents.length; i++) {
            if ((agents[i].x > 0) && (agents[i].x < sketch.width) && (agents[i].y > 0) && (agents[i].y < sketch.height)) {
                onScreenAgents.push(agents[i]);
            }
        }
        agents = onScreenAgents;
    }
    
    sketch.draw = function() {
        sketch.background(0);
        sketch.strokeWeight(3);
        agents.forEach(sketch.renderAgent);
        agents.forEach(sketch.operateAgent);
        agents.forEach(sketch.incrementAge);
        sketch.breedAgents();
        sketch.killOffscreenAgents();
    }
})

breedingPossible = function(agent1, agent2) {
    if (agent1.id == agent2.id) {
        return false;
    } else if (agent1.age < minimumAge || agent2.age < minimumAge) {
        return false;
    } else if (agent1.breeding || agent2.breeding) {
        return false;
    } else { 
        // trying to save processing power by computing a "sort of" distance
        var lazyDistance = Math.abs(agent1.x - agent2.x) + Math.abs(agent1.y - agent2.y);
        if (lazyDistance > minimumDistance) {
            return false;
        } else {
            return true;
        }
    }
}

makeNewSpawnPoint = function(agent1, agent2) {
    spawnPoints.push({
        timer: pregnancyTime,
        x: (agent1.x + agent2.x)/2,
        y: (agent1.y + agent2.y)/2,
        r1: agent1.r,
        r2: agent2.r,
        g1: agent1.g,
        g2: agent2.g,
        b1: agent1.b,
        b2: agent2.b
    })
}

makeNewAgent = function(xpos, ypos, rcol, gcol, bcol) {
    agents.push({
            id: agents.length,
            breeding: false,
            babyCountdown: pregnancyTime,
            age: 0,
            size: 5,
            r: rcol,
            g: gcol,
            b: bcol,
            x: xpos,
            y: ypos,
            history: []
    })
}
