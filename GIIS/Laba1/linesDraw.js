const canvas = document.getElementById("cnv");

const topCanvas = document.createElement("canvas")
topCanvas.width = canvas.width
topCanvas.height = canvas.height
topCanvas.style.position = 'absolute';
topCanvas.style.left = canvas.offsetLeft + 'px';
topCanvas.style.top = canvas.offsetTop + 'px';
topCanvas.style.width = canvas.width + 'px';
topCanvas.style.height = canvas.height + 'px';
topCanvas.style.fillStyle = "transparent"
const tempCanvas = topCanvas.getContext('2d');
tempCanvas.clearRect(0, 0, canvas.width, canvas.height);
topCanvas.addEventListener("click", (event) => {
    canvas.click(event)
})
document.body.appendChild(topCanvas);

const mCanvas = canvas.getContext("2d");
let drawPoints = {}

const tryInitCtx = (type) => {
    if (drawPoints.type !== type) {
        drawPoints = {type:type}
        return true
    }
    return false
}

const deinitCtx = () => {
    drawPoints = {}
    clearCanvas()
}

const drawDDALine = async (x1, y1, x2, y2, selectedMode) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = x1;
    let y = y1;

    mCanvas.beginPath();
    mCanvas.moveTo(x, y);

    for (let i = 0; i < steps; i++) {
        x += xIncrement;
        y += yIncrement;
        mCanvas.fillRect(Math.round(x), Math.round(y), 1, 1);
        if(selectedMode === true){
           await waitingKeypress();
        }
    }

    
}

const drawBresenhamLine = async (x1, y1, x2, y2, selectedMode) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        mCanvas.fillRect(x1, y1, 1, 1);
        if (x1 === x2 && y1 === y2) {
            break;
        }

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
        if(selectedMode === true){
            await waitingKeypress();
         }
    }
}

const drawWuLine = async (x1, y1, x2, y2, selectedMode) =>
{
    const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    if (steep) {
      [x1, y1] = [y1, x1];
      [x2, y2] = [y2, x2];
    }
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
  
    const dx = x2 - x1;
    const dy = y2 - y1;
    const gradient = dy / dx;
    let y = y1;
  
    for (let x = x1; x <= x2; x++) {
      if (steep) {
        mCanvas.fillStyle = `rgba(0, 0, 0, ${1 - (y - Math.floor(y))})`;
        mCanvas.fillRect(Math.floor(y), x, 1, 1);
        mCanvas.fillStyle = `rgba(0, 0, 0, ${y - Math.floor(y)})`;
        mCanvas.fillRect(Math.floor(y) + 1, x, 1, 1);
      } else {
        mCanvas.fillStyle = `rgba(0, 0, 0, ${1 - (y - Math.floor(y))})`;
        mCanvas.fillRect(x, Math.floor(y), 1, 1);
        mCanvas.fillStyle = `rgba(0, 0, 0, ${y - Math.floor(y)})`;
        mCanvas.fillRect(x, Math.floor(y) + 1, 1, 1);
      }
      y += gradient;
      if(selectedMode === true){
        await waitingKeypress();
     }
    }
}

const drawTemporaryCross = (x, y) => {
    tempCanvas.strokeStyle = 'red';
    tempCanvas.lineWidth = 2;

    tempCanvas.beginPath();
    tempCanvas.moveTo(x - 5, y);
    tempCanvas.lineTo(x + 5, y);
    tempCanvas.stroke();

    tempCanvas.beginPath();
    tempCanvas.moveTo(x, y - 5);
    tempCanvas.lineTo(x, y + 5);
    tempCanvas.stroke();
}

const clearCanvas = () => {
    tempCanvas.clearRect(0, 0, topCanvas.width, topCanvas.height);
}

topCanvas.addEventListener("click", function(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const selectedTool = document.querySelector('input[name="tool"]:checked').value;
    const selectedMode = document.getElementById("tool-debug").checked;
    const isInited = tryInitCtx(selectedTool)
    drawTemporaryCross(x, y)
    const useTool = {
        dda: () => {
            if (isInited) {
                drawPoints.start = [x, y]
            } else {
                drawDDALine(drawPoints.start[0], drawPoints.start[1], x, y, selectedMode)
                deinitCtx()
            }
        },

        bresenham: () => {
            if (isInited) {
                drawPoints.start = [x, y]
            } else {
                drawBresenhamLine(drawPoints.start[0], drawPoints.start[1], x, y, selectedMode)
                deinitCtx()
            }
        },

        wu: () => {
            if (isInited) {
                drawPoints.start = [x, y]
            } else {
                drawWuLine(drawPoints.start[0], drawPoints.start[1], x, y, selectedMode)
                deinitCtx()
            }
        },
    }

    useTool[selectedTool]()
});

function waitingKeypress() {
	return new Promise((resolve) => {
  	document.addEventListener('keydown', onKeyHandler);
    console.log(document.hasOwnProperty('keydown'));
  	function onKeyHandler(e) {
  		if (e.keyCode === 13) {
      	document.removeEventListener('keydown', onKeyHandler);
    		resolve();
    	}
  	}
  });
}