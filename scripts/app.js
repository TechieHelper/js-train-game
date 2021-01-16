document.addEventListener("DOMContentLoaded", () => {

    var lines = []
    var trainTimers = []
    var currentSelectedStation = null
    var flag = false;
    var paper = Raphael(0, 0, window.innerWidth, window.innerHeight);
    var spawnTimer = 40; // In 1/100s
    var gameSpeed = 0.25;

    function* driveTrain(train) {
        if (parseInt(lines[train][1].textContent) > 0) {
            console.log(`Train ${train} now starting.`)
            let line = lines[train][0];
            lines[train][1].textContent = parseInt(lines[train][1].textContent) - 1;

            var circle = paper.circle(line[0][1], line[0][0], 10);
            var text = paper.text(line[0][1], line[0][0], "1")
            var pointTransmitter = paper.set();
            //var rect = paper.rect(line[0][1], line[0][0], 30, 30).attr({'fill': 'red', 'stroke-width': 0});

            circle.attr('fill', '#f00');
            circle.attr('stroke', '#fff');
            // var train = new fabric.Circle({
            //     radius: 15,
            //     fill: 'red',
            //     stroke: 'red',
            //     strokeWidth: 3,
            //     left: line[0][1]-11,
            //     top: line[0][0]-11
            // });
            // fabricCanvas.add(train)
            pointTransmitter.push(text, circle)
            for (let i=0;i<line.length;i+=gameSpeed) {
                // train.left = line[i][1];
                // train.top = line[i][0];
                // fabricCanvas.renderAll();
                //rect.animate({x:line[i][1], y:line[i][0], 'transform': 'r' + i}, 0);
                pointTransmitter.animate({x:line[Math.floor(i)][1]+11, y:line[Math.floor(i)][0]+11, cx:line[Math.floor(i)][1]+11, cy:line[Math.floor(i)][0]+11}, 0);
                yield;
            }
            //rect.remove();
            pointTransmitter.remove();
            //fabricCanvas.remove(train);
            lines[train][2].textContent = parseInt(lines[train][2].textContent) + 1;
            return train;
        }
        return train;
    }

    var trainIterators = [];

    function draw() {
        for (let i=0;i<trainTimers.length;i++) {
            if (trainTimers[i] === 0) {
                trainIterators.push(driveTrain(i));
                trainTimers[i]--;
            } else if  (trainTimers[i] > 0) {
                trainTimers[i]--;
            }
        }
        for (let i=0;i<trainIterators.length;i++) {
            let currentVal = trainIterators[i].next().value;
            if (currentVal !== undefined) {
                trainTimers[currentVal] = spawnTimer;
            }
        }
    }

    function gameLoop() {
        draw();
        requestAnimationFrame(gameLoop);
    }

    function drawBetweenButtons(b1, b2) {
        b1x = parseInt(b1.style.top, 10)+5;
        b1y = parseInt(b1.style.left, 10)+5;
        b2x = parseInt(b2.style.top, 10)+5;
        b2y = parseInt(b2.style.left, 10)+5;
        let path = [[b1x, b1y]];
        while (path[path.length-1][0]!==b2x || path[path.length-1][1]!==b2y) {
            currentPosX = path[path.length-1][0];
            currentPosY = path[path.length-1][1];
            if (currentPosX<b2x) {
                path.push([currentPosX+1, currentPosY]);
            } else if (currentPosX>b2x) {
                path.push([currentPosX-1, currentPosY]);
            } else if (currentPosY<b2y) {
                path.push([currentPosX, currentPosY+1]);
            } else if (currentPosY>b2y) {
                path.push([currentPosX, currentPosY-1]);
            }
        }
        lines.push([path, b1, b2]);
        trainTimers.push(1);
        var linePath = ["M", b1y, b1x];
        for (let i=1;i<path.length;i++) {
            linePath.push("L", path[i-1][1]+11, path[i-1][0]+11);
        }
        paper.path(linePath).attr({"stroke": "#f00"});
        flag = true;
    }

    function drawBetweenStartAndButton(start, button) {
        b1y = parseInt(start.style.left, 10)+5;
        b2x = parseInt(button.style.top, 10)+5;
        b2y = parseInt(button.style.left, 10)+5;
        let path = [[b2x, b1y]];
        while (path[path.length-1][1]!==b2y) {
            currentPosY = path[path.length-1][1];
            if (currentPosY<b2y) {
                path.push([b2x, currentPosY+1]);
            } else if (currentPosY>b2y) {
                path.push([b2x, currentPosY-1]);
            }
        }
        lines.push([path, start, button]);
        trainTimers.push(1);
        var linePath = ["M", b1y, b2x];
        for (let i=1;i<path.length;i++) {
            linePath.push("L", path[i-1][1]+11, path[i-1][0]+11);
        }
        paper.path(linePath).attr({"stroke": "#f00"});
        flag = true;
    }

    function drawBetweenButtonAndEnd(button, end) {
        b1y = parseInt(button.style.left, 10)+5;
        b2x = parseInt(button.style.top, 10)+5;
        b2y = parseInt(end.style.left, 10)+5;
        let path = [[b2x, b1y]];
        while (path[path.length-1][1]!==b2y) {
            currentPosY = path[path.length-1][1];
            if (currentPosY<b2y) {
                path.push([b2x, currentPosY+1]);
            } else if (currentPosY>b2y) {
                path.push([b2x, currentPosY-1]);
            }
        }
        lines.push([path, button, end]);
        trainTimers.push(1);
        var linePath = ["M", b1y, b2x];
        for (let i=1;i<path.length;i++) {
            linePath.push("L", path[i-1][1]+11, path[i-1][0]+11);
        }
        paper.path(linePath).attr({"stroke": "#f00"});
        flag = true;
    }

    function stationButtonClicked() {
        if (currentSelectedStation === null) {
            this.disabled = true;
            currentSelectedStation = this;
        } else {
            currentSelectedStation.disabled = false;
            if (stripPx(currentSelectedStation.style.height) == window.innerHeight) {  // Check if click is between start and button or two buttons
                drawBetweenStartAndButton(currentSelectedStation, this);
            } else if (stripPx(this.style.height) == window.innerHeight) {
                drawBetweenButtonAndEnd(currentSelectedStation, this);
            } else {
                drawBetweenButtons(currentSelectedStation, this);
            }
            currentSelectedStation = null;
        }
    }

    function findGetParameter(parameterName) {
        var result = null, tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        
        return result;
    }

    function stripPx(value) {
        return value.substr(0, value.length-2);
    }

    function setupDividers() {
        paper.path(["M", 1/10 * window.innerWidth, 0, "L", 1/10 * window.innerWidth, window.innerHeight]).attr({"stroke-width": 5, "stroke": "grey"})
        paper.path(["M", 9/10 * window.innerWidth, 0, "L", 9/10 * window.innerWidth, window.innerHeight]).attr({"stroke-width": 5, "stroke": "grey"})
    }

    function setup() {
        setupDividers();
        foundGameSpeed = parseFloat(findGetParameter("gameSpeed"));
        if (foundGameSpeed < 0.5 || Number.isInteger(foundGameSpeed)) {
            gameSpeed = parseFloat(foundGameSpeed);
        } else {
            console.log(`Invalid game speed '${foundGameSpeed}'.`);  
        }

        // Starting divider
        let button = document.createElement("button");
        button.textContent = "10";
        button.className = "startEndBarrier";
        button.style.color = "white";
        button.style.background = "red";
        button.style.height = window.innerHeight + "px";
        button.style.width = 20 + "px";
        button.style.top = 0 + "px";
        button.style.left = 0 + "px";
        button.addEventListener('click', function(event) { stationButtonClicked.call(this); })
        document.body.appendChild(button);

        // Ending divider
        button = document.createElement("button");
        button.textContent = "0";
        button.className = "startEndBarrier";
        button.style.color = "white";
        button.style.background = "red";
        button.style.height = window.innerHeight + "px";
        button.style.width = 20 + "px";
        button.style.top = 0 + "px";
        button.style.left = window.innerWidth-20 + "px";
        button.addEventListener('click', function(event) { stationButtonClicked.call(this); })
        document.body.appendChild(button);

        for (let i=1;i<=10;i++) {  // Intermediary Buttons
            button = document.createElement("button");
            button.textContent = "5";
            button.className = "circleButton";
            button.style.color = "white";
            button.style.background = "red";
            button.style.top = Math.floor(Math.random() * (window.innerHeight - 25))  + "px";
            button.style.left = Math.floor(Math.random() * (window.innerWidth * 8/10)) + window.innerHeight * 1/10 + "px";
            button.addEventListener('click', function(event) { stationButtonClicked.call(this); })
            document.body.appendChild(button);
        }
        gameLoop();
    }

    setup();

    // LOG: Just found out the program was running at 600fps - fun.
})
