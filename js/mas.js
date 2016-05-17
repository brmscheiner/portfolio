var initialAgents = 30;
var trailSize = 10;
var headSize = 10;
var minimumTime = 100;
var tailMode = "curvy";
var minimumDistance = 20;
var pregnancyTime = 50;
var moveDistance = 15;
var startingLifeExpectancy = 225;
var startingAverageChildren = 6;

var agents = [];
var spawnPoints = [];
var averageChildren = startingAverageChildren;
var lifeExpectancy = startingLifeExpectancy;
var clock = 0;
var sketch_p5 = new p5(function(sketch) {

    sketch.setup = function() {
        var myCanvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        var canvasContainer = document.getElementById("canvasContainer");
        myCanvas.parent(canvasContainer);
        sketch.colorMode(sketch.RGB);
        sketch.rectMode(sketch.CENTER);
        sketch.ellipseMode(sketch.CENTER);
        sketch.background(0);
        sketch.frameRate(10);
        var x, y;
        for (i=0; i<initialAgents; i++) {
            x = sketch.random(sketch.width/4, 3*sketch.width/4);
            y = sketch.random(sketch.height/4, 3*sketch.height/4);
            makeNewAgent(x, y, sketch.random(255), sketch.random(255), sketch.random(255));
        }
    }
    
    sketch.renderAgent = function(element) {
        if (tailMode == "straight") {
            sketch.renderStraightTail(element);
        } else {
            sketch.renderCurvyTail(element);
        }
        sketch.stroke(element.r, element.g, element.b);
        sketch.fill(element.r, element.g, element.b);
        sketch.ellipse(element.x, element.y, element.size, element.size);
    }
    
    sketch.renderCurvyTail = function(element) {
        var tailLength = element.history.length;
        if (tailLength < 4) {
            sketch.renderStraightTail(element);
        } else {
            sketch.stroke(element.r, element.g, element.b);
            console.log(sketch.floor(3*tailLength/4));
            var control1_x = element.history[sketch.floor(tailLength/4)].x;
            var control1_y = element.history[sketch.floor(tailLength/4)].y;
            var control2_x = element.history[sketch.floor(3*tailLength/4)].x;
            var control2_y = element.history[sketch.floor(3*tailLength/4)].y;
            var end_x = element.history[tailLength-1].x;
            var end_y = element.history[tailLength-1].y;
            //sketch.curve(element.x, element.y, control1_x, control1_y, control2_x, control2_y, end_x, end_y);
            //sketch.curve(control1_x, control1_y, element.x, element.y, control2_x, control2_y, end_x, end_y);
            sketch.curve(element.x, element.y, element.x, element.y, control2_x, control2_y, end_x, end_y);
        }
    }
    
    sketch.renderStraightTail = function(element) {
        if (element.history.length) {
            var intensity = 255 - (1/trailSize)*255;
            sketch.stroke(intensity);
            sketch.line(element.x, element.y, element.history[0].x, element.history[0].y);
            for (i=0; i<element.history.length-1; i++) {
                intensity -= 255/trailSize;
                sketch.stroke(intensity);
                sketch.line(element.history[i].x, element.history[i].y, element.history[i+1].x, element.history[i+1].y);
            }  
        }
    }

    sketch.moveAgent = function(element) {
        // log the last trailSize positions of the agent.
        element.history.unshift({x: element.x, y: element.y});
        if (element.history.length > trailSize) {
            element.history.pop();
        }
        if ((clock%5 == 0) || (!element.x_direction)) {
            if (element.x > sketch.mouseX) {
                element.x_direction = sketch.random(-1, 0.85);
            } else {
                element.x_direction = sketch.random(-0.85, 1);
            }
            if (element.y > sketch.mouseY) {
                element.y_direction = sketch.random(-1, 0.85);
            } else {
                element.y_direction = sketch.random(-0.85, 1);
            }
                    }
        element.x += moveDistance*element.x_direction;
        element.y += moveDistance*element.y_direction;
    }
    
    sketch.incrementAge = function(element) {
        element.age += 1;
        element.timeSincePregnancy += 1;
    }
    
    sketch.breedAgents = function() {
        for (i=0; i<agents.length; i++) {
            for (j=0; j<agents.length; j++) {
                if (breedingPossible(agents[i],agents[j])) {
                    agents[i].breeding = true;
                    agents[j].breeding = true;
                    makeNewSpawnPoint(agents[i], agents[j]);
                }
            }
        }
    }
    
    sketch.operateAgent = function(element) {
        if (element.breeding == true) {
            element.freezeCountdown -= 1;
            element.size += 0.5;
            sketch.stroke(element.r, element.g, element.b);
            sketch.fill(element.r, element.g, element.b);
            sketch.ellipse(element.x, element.y, element.size, element.size);
            if (element.freezeCountdown == 0) {
                element.timeSincePregnancy = 0;
                element.size = headSize;
                element.freezeCountdown = pregnancyTime;
                element.breeding = false;
            }
        } else {
            sketch.moveAgent(element);
        }
    }
    
    sketch.killAgents = function() {
        var keepers = [];
        for (i=0; i<agents.length; i++) {
            if ((agents[i].x > 0) && (agents[i].x < sketch.width) && (agents[i].y > 0) && (agents[i].y < sketch.height)) {
                var distortion = lifeExpectancy/10;
                if (agents[i].age < lifeExpectancy+sketch.random(-distortion, distortion)) {
                    keepers.push(agents[i]);
                }
            }
        }
        agents = keepers;
    }
    
    sketch.operateSpawnPoint = function(element) {
        if (element.timer>0) {
            element.timer -= 1;
        } else {
            var nChildren = sketch.random(averageChildren/2, 3*averageChildren/2);
            for (i=0; i<nChildren; i++) {
                var r = sketch.getChildColor(element.r1, element.r2);
                var g = sketch.getChildColor(element.g1, element.g2);
                var b = sketch.getChildColor(element.b1, element.b2);
                makeNewAgent(element.x, element.y, r, g, b);
            }
            deleteIndex = spawnPoints.indexOf(element);
            if (deleteIndex > -1) {
                spawnPoints.splice(deleteIndex, 1);
            }
        }
    }
    
    sketch.getChildColor = function(c1, c2) {
        var val;
        var distortion = sketch.random(-50,50);
        if (Math.abs(distortion) < 10) {
            val = sketch.random(0,255) // mutation
        }
        if (clock%2 == 1) {
            val = c1 + distortion;
        } else {
            val = c2 + distortion;
        }
        return sketch.constrain(val, 0, 255);
    }
    
    sketch.populationControl = function () {
        if ((agents.length > 85) && (clock%20 == 0)) {
            var excessAgents = agents.length - 95;
            lifeExpectancy = sketch.max(lifeExpectancy - excessAgents/40, 0);
            averageChildren = sketch.max(averageChildren - excessAgents/100, 0);
        } else if ((agents.length < 20) && (clock%20 == 0)) {
            var missingAgents = 60 - agents.length;
            lifeExpectancy = sketch.min(lifeExpectancy + missingAgents/30, 500);
            averageChildren = sketch.min(averageChildren + missingAgents/100, 0);
        } else {
            lifeExpectancy = startingLifeExpectancy;
            averageChildren = startingAverageChildren;
        }
        if (agents.length > 150) {
            agents.pop(); // executions
        }
    }
    
    sketch.draw = function() {
        sketch.background(0);
        sketch.strokeWeight(3);
        agents.forEach(sketch.renderAgent);
        agents.forEach(sketch.operateAgent);
        agents.forEach(sketch.incrementAge);
        spawnPoints.forEach(sketch.operateSpawnPoint)
        sketch.breedAgents();
        sketch.killAgents();
        sketch.populationControl();
        clock += 1;
    }
    
    sketch.windowResized = function() {
      sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    }
})

breedingPossible = function(agent1, agent2) {
    if (agent1.id == agent2.id) {
        return false;
    } else if (agent1.timeSincePregnancy < minimumTime || agent2.timeSincePregnancy < minimumTime) {
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
            freezeCountdown: pregnancyTime,
            age: 0,
            timeSincePregnancy: 0,
            size: headSize,
            r: rcol,
            g: gcol,
            b: bcol,
            x: xpos,
            y: ypos,
            history: []
    })
}

