const canvasEl = document.querySelector('#ice-canvas');
const resetBtnEl = document.querySelector('#refresh-btn');
const titleEl = document.querySelector('.title');
const ctx = canvasEl.getContext('2d');

let maxNumberOfLines = 6;
let screen, lineIdx, drawingAllowed, baseAngle, mouseAngle, startPoint, coords, mouseDistance;
let cursorPosition = [0, 0];

updateCanvasSize();
window.onresize = updateCanvasSize;
refresh();
loop();


// ------------------------------------------------------------
// Auto draw mode. Tbh, only for the codepen preview not to be empty :)

let autoDrawInterval = setInterval(autoDraw, 200);
let autoDrawIsActive = true;
resetBtnEl.style.opacity = 0;
function autoDraw() {
    if (!drawingAllowed) {
        refresh();
    }
    onMove([Math.random() * window.innerWidth, Math.random() * window.innerHeight]);
    onDown();
}
function stopAutoDraw() {
    if (autoDrawIsActive) {
        clearInterval(autoDrawInterval);
        refresh();
        updateCanvasSize();
        autoDrawIsActive = false;
        resetBtnEl.style.opacity = 1;
        titleEl.style.opacity = 0;
    }
}
// ------------------------------------------------------------


resetBtnEl.addEventListener('click', refresh);
document.addEventListener('mousedown', onDown);
document.addEventListener('mousemove', (e) => {
    cursorPosition = [ e.pageX, e.pageY ];
    stopAutoDraw();
    onMove();
});
window.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        stopDrawing();
    }
});
document.addEventListener("touchstart", (e) => {
    cursorPosition = [ e.touches[0].pageX, e.touches[0].pageY ];
    stopAutoDraw();
    onMove();
});
document.addEventListener("touchend", onDown);
document.addEventListener("touchmove", (e) => {
    cursorPosition = [ e.touches[0].pageX, e.touches[0].pageY ];
    onMove();
});



function updateCanvasSize() {
    screen = {
        w: window.innerWidth,
        h: window.innerHeight,
        c: [ .5 * window.innerWidth, .5 * window.innerHeight ],
        r: Math.max(100, .3 * Math.min(window.innerWidth, window.innerHeight))
    }
    canvasEl.setAttribute('width', screen.w);
    canvasEl.setAttribute('height', screen.h);
}

function refresh() {
    drawingAllowed = true;
    lineIdx = 0;
    startPoint = [0, 0];
    baseAngle = 0;
    mouseAngle = 0;
    coords = [];
    for (let i = 0; i < maxNumberOfLines; i++) {
        coords.push([[], [], []]);
    }
    resetBtnEl.style.visibility = 'hidden';
    onMove();
}

function onDown() {
    if (drawingAllowed) {
        if (lineIdx === 0) {
            baseAngle = mouseAngle;
            screen.r = mouseDistance;
        }

        screen.r *= .85;
        startPoint = randomPointOnBaseAngle();
        lineIdx ++;
        if (lineIdx >= maxNumberOfLines) {
            lineIdx = 0;
            updateCanvasSize();
            stopDrawing()
        }
    }
}

function onMove([x, y] = cursorPosition) {
    if (drawingAllowed) {
        let mousePoint = [x - screen.c[0], y - screen.c[1]];
        mouseDistance = Math.sqrt(Math.pow(mousePoint[0], 2) + Math.pow(mousePoint[1], 2));
        mouseAngle = Math.atan2(mousePoint[1], mousePoint[0]);
        if (mouseDistance > screen.r) {
            mousePoint = [
                screen.r * Math.cos(mouseAngle),
                screen.r * Math.sin(mouseAngle)
            ];
            mouseDistance = screen.r;
        }

        const mirroredPoint = [
            Math.cos(2 * baseAngle - mouseAngle) * mouseDistance,
            Math.sin(2 * baseAngle - mouseAngle) * mouseDistance
        ];

        coords[lineIdx][0] = startPoint;
        coords[lineIdx][1] = mousePoint;
        coords[lineIdx][2] = mirroredPoint;
    }
}

function stopDrawing() {
    drawingAllowed = false;
    resetBtnEl.style.visibility = 'visible';
}

function randomPointOnBaseAngle() {
    const r = Math.random() * screen.r;
    return [
        r * Math.cos(baseAngle),
        r * Math.sin(baseAngle)
    ]
}

function loop() {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .2;

    const color = '255, 255, 255';
    ctx.strokeStyle = 'rgb(' + color + ')';
    ctx.fillStyle = 'rgb(' + color + ')';
    ctx.shadowColor = 'rgb(' + color + ')';

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.lineWidth = 4;
    ctx.shadowBlur = 5;

    coords.forEach((line, lineIdx) => {
        for (let i = 0; i < 6; i++) {
            ctx.translate(screen.c[0], screen.c[1]);
            ctx.rotate(i * Math.PI / 3);

            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            ctx.lineTo(line[1][0], line[1][1]);
            ctx.stroke();

            if (lineIdx) {
                ctx.beginPath();
                ctx.moveTo(line[0][0], line[0][1]);
                ctx.lineTo(line[2][0], line[2][1]);
                ctx.stroke();
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    })
    
    window.requestAnimationFrame(loop);
}
