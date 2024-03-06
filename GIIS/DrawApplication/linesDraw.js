const cnv = document.getElementById("cnv");
const canvas = cnv.getContext('2d') 
let centerX, centerY;

/*
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

const mCanvas = canvas.getContext("2d");*/
let currentType = {};
let drawPoints = [];
let toolGroup = fLinesToolGroup;
let isDrawing = false;
let clickX, clickY;

const tryInitCtx = (type) => {
    if (currentType.type !== type) {
        currentType = {type:type}
        return true
    }
    return false
}

const drawDDALine = async (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = x1;
    let y = y1;

    canvas.beginPath();
    canvas.moveTo(x, y);

    for (let i = 0; i < steps; i++) {
        x += xIncrement;
        y += yIncrement;
        canvas.fillRect(Math.round(x), Math.round(y), 1, 1);
        if(checkMode() === true){
           await waitingKeypress();
        }
    }
}

const drawBresenhamLine = async (x1, y1, x2, y2) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        canvas.fillRect(x1, y1, 1, 1);
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
        if(checkMode() === true){
            await waitingKeypress();
         }
    }
}

const drawWuLine = async (x1, y1, x2, y2) =>
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
        canvas.fillStyle = `rgba(0, 0, 0, ${1 - (y - Math.floor(y))})`;
        canvas.fillRect(Math.floor(y), x, 1, 1);
        canvas.fillStyle = `rgba(0, 0, 0, ${y - Math.floor(y)})`;
        canvas.fillRect(Math.floor(y) + 1, x, 1, 1);
      } else {
        canvas.fillStyle = `rgba(0, 0, 0, ${1 - (y - Math.floor(y))})`;
        canvas.fillRect(x, Math.floor(y), 1, 1);
        canvas.fillStyle = `rgba(0, 0, 0, ${y - Math.floor(y)})`;
        canvas.fillRect(x, Math.floor(y) + 1, 1, 1);
      }
      y += gradient;
      if(checkMode() === true){
        await waitingKeypress();
     }
    }
}

function checkMode(){
    return document.getElementById("tool-debug").checked;
}

function drawCirclePoints(xc, yc, x, y)
{
    canvas.fillRect(xc+x, yc+y, 1, 1); 
    canvas.fillRect(xc-x, yc+y, 1, 1); 
    canvas.fillRect(xc+x, yc-y, 1, 1); 
    canvas.fillRect(xc-x, yc-y, 1, 1); 
    canvas.fillRect(xc+y, yc+x, 1, 1); 
    canvas.fillRect(xc-y, yc+x, 1, 1); 
    canvas.fillRect(xc+y, yc-x, 1, 1); 
    canvas.fillRect(xc-y, yc-x, 1, 1); 
}

const drawCircleBresenham = async (xc, yc, x1, y1) =>{
    let r = Math.sqrt(Math.pow((x1-xc),2)+Math.pow((y1-yc),2));
    let x = r;
    let y = 0;
    let err = 0;
    while (x >= y) {
        drawCirclePoints(xc, yc, x, y)

        if (err <= 0) {
            y += 1;
            err += 2 * y + 1;
        }
        
        if (err > 0) {
            x -= 1;
            err -= 2 * x + 1;
        }
        if(checkMode() === true){
            await waitingKeypress();
         }
    }
}

const drawEllipse = async (rx, ry, xc, yc) =>
{
    var dx, dy, d1, d2, x, y;
    x = 0;
    y = ry;
 
    // Initial decision parameter of region 1
    d1 = (ry * ry) - (rx * rx * ry) +
                   (0.25 * rx * rx);
    dx = 2 * ry * ry * x;
    dy = 2 * rx * rx * y;
 
    // For region 1
    while (dx < dy)
    {
         
        // Print points based on 4-way symmetry
        canvas.fillRect(x + xc, y + yc, 1,1)
        canvas.fillRect(-x + xc, y + yc, 1,1)
        canvas.fillRect(x + xc, -y + yc, 1,1)
        canvas.fillRect(-x + xc, -y + yc, 1,1)
 
        // Checking and updating value of
        // decision parameter based on algorithm
        if (d1 < 0)
        {
            x++;
            dx = dx + (2 * ry * ry);
            d1 = d1 + dx + (ry * ry);
        }
        else
        {
            x++;
            y--;
            dx = dx + (2 * ry * ry);
            dy = dy - (2 * rx * rx);
            d1 = d1 + dx - dy + (ry * ry);
        }
        if(checkMode() === true){
            await waitingKeypress();
         }
    }
 
    // Decision parameter of region 2
    d2 = ((ry * ry) * ((x + 0.5) * (x + 0.5))) +
         ((rx * rx) * ((y - 1) * (y - 1))) -
          (rx * rx * ry * ry);
 
    // Plotting points of region 2
    while (y >= 0)
    {
        // Print points based on 4-way symmetry
        canvas.fillRect(x + xc, y + yc, 1,1)
        canvas.fillRect(-x + xc, y + yc, 1,1)
        canvas.fillRect(x + xc, -y + yc, 1,1)
        canvas.fillRect(-x + xc, -y + yc, 1,1)
        
        // Checking and updating parameter
        // value based on algorithm
        if (d2 > 0)
        {
            y--;
            dy = dy - (2 * rx * rx);
            d2 = d2 + (rx * rx) - dy;
        }
        else
        {
            y--;
            x++;
            dx = dx + (2 * ry * ry);
            dy = dy - (2 * rx * rx);
            d2 = d2 + dx - dy + (rx * rx);
        }
        if(checkMode() === true){
            await waitingKeypress();
         }
    }
}

const drawMathF = async (xc, yc) =>{
    const curveType = document.querySelector('input[name="tool"]:checked').value;
    const a = Math.abs(clickX - xc);
    const b = clickY - yc;
    const step = 1 / Math.max(a, b); // шаг изменения угла

    for (let angle = 0; angle < 2 * Math.PI; angle += step/2) {
        let x, y;

        // Вычисляем координаты в зависимости от типа кривой
        switch (curveType) {
            case 'hyperbola':
                x = xc + a / Math.cos(angle);
                y = yc + b * Math.tan(angle);
                canvas.fillRect(x, y, 1, 1);
                break;
            case 'parabola':
                dx = a*angle;
                dy = b * Math.pow(angle, 2);
                canvas.fillRect(xc+dx, yc+dy, 1, 1)
                canvas.fillRect(xc-dx, yc+dy, 1, 1)
                break;
        }
        if(checkMode() === true){
            await waitingKeypress();
         }
    }
}

const drawErmitLine = async () => {
    canvas.fillStyle = 'red';
    for (let i = 0; i < drawPoints.length; i++) {
        canvas.beginPath();
        canvas.arc(drawPoints[i].x, drawPoints[i].y, 3, 0, 2 * Math.PI);
        canvas.fill();
        canvas.closePath();
    }
    canvas.strokeStyle = 'blue';
    canvas.beginPath();
    for (let i = 0; i < drawPoints.length - 1; i++) {
        const p0 = drawPoints[i];
        const p1 = drawPoints[i + 1];
        const t0 = i > 0 ? (p1.x - drawPoints[i - 1].x) / 2 : 0;
        const t1 = i < drawPoints.length - 2 ? (drawPoints[i + 2].x - p0.x) / 2 : 0;

        for (let t = 0; t <= 1; t += 0.01) {
            const h1 = 2 * Math.pow(t, 3) - 3 * Math.pow(t, 2) + 1;
            const h2 = -2 * Math.pow(t, 3) + 3 * Math.pow(t, 2);
            const h3 = Math.pow(t, 3) - 2 * Math.pow(t, 2) + t;
            const h4 = Math.pow(t, 3) - Math.pow(t, 2);

            const x = h1 * p0.x + h2 * p1.x + h3 * t0 + h4 * t1;
            const y = h1 * p0.y + h2 * p1.y + h3 * t0 + h4 * t1;

            if (t === 0) {
                canvas.moveTo(x, y);
            } else {
                canvas.lineTo(x, y);
            }
        }
    }
    canvas.stroke();
    canvas.closePath();
}

const drawBesieLine = async () => {
    canvas.fillStyle = 'red';
    for (let i = 0; i < drawPoints.length; i++) {
        canvas.beginPath();
        canvas.arc(drawPoints[i].x, drawPoints[i].y, 3, 0, 2 * Math.PI);
        canvas.fill();
        canvas.closePath();
    }
    canvas.strokeStyle = 'blue';
    canvas.beginPath();
    if (drawPoints.length >= 4 && (drawPoints.length - 1) % 3 === 0) {
        for (let i = 0; i < drawPoints.length - 1; i += 3) {
            const p0 = drawPoints[i];
            const p1 = drawPoints[i + 1];
            const p2 = drawPoints[i + 2];
            const p3 = drawPoints[i + 3];

            const iterations = 10000; // Количество итераций дискретизации

            for (let j = 0; j <= iterations; j++) {
                const t = j / iterations;

                const x =
                    Math.pow(1 - t, 3) * p0.x +
                    3 * Math.pow(1 - t, 2) * t * p1.x +
                    3 * (1 - t) * Math.pow(t, 2) * p2.x +
                    Math.pow(t, 3) * p3.x;
                const y =
                    Math.pow(1 - t, 3) * p0.y +
                    3 * Math.pow(1 - t, 2) * t * p1.y +
                    3 * (1 - t) * Math.pow(t, 2) * p2.y +
                    Math.pow(t, 3) * p3.y;

                if (j === 0) {
                    canvas.moveTo(x, y);
                } else {
                    canvas.lineTo(x, y);
                }
            }
        }
    }
    canvas.stroke();
    canvas.closePath();
}

const drawSplineLine = async () => {
    canvas.fillStyle = 'red';
    for (let i = 0; i < drawPoints.length; i++) {
        canvas.beginPath();
        canvas.arc(drawPoints[i].x, drawPoints[i].y, 3, 0, 2 * Math.PI);
        canvas.fill();
        canvas.closePath();
    }
    canvas.strokeStyle = 'blue';
    canvas.beginPath();
    var xScale = d3.scaleLinear()
    .domain([0, d3.max(drawPoints, d => d.x)])
    .range([0, d3.max(drawPoints, d => d.x)]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(drawPoints, d => d.y)])
        .range([0, d3.max(drawPoints, d => d.y)]);

    // Создаем генератор сплайна
    var lineGenerator = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveNatural);

    lineGenerator.context(canvas)(drawPoints);

    canvas.stroke();
    canvas.closePath();
}

const useTool = {
    dda: () => {
        {
            drawDDALine(drawPoints.start[0], drawPoints.start[1], clickX, clickY);
        }
    },

    bresenham: () => {
        {
            drawBresenhamLine(drawPoints.start[0], drawPoints.start[1], clickX, clickY);
        }
    },

    wu: () => {
        {
            drawWuLine(drawPoints.start[0], drawPoints.start[1], clickX, clickY);
        }
    },

    circle: () => {
       {
            drawCircleBresenham(drawPoints.start[0], drawPoints.start[1], clickX, clickY);
        }
    },

    ellipse: () =>{
        {
            drawEllipse(Math.abs(clickX-drawPoints.start[0]), Math.abs(clickY-drawPoints.start[1]), drawPoints.start[0], drawPoints.start[1]);
        }
    },
    
    hyperbola: () =>{
        {
            drawMathF(drawPoints.start[0], drawPoints.start[1]);
        }
    },
    
    parabola: () =>{
        {
            drawMathF(drawPoints.start[0], drawPoints.start[1]);
        }
    },
    
    ermit: () =>{
        {
            drawErmitLine();
        }
    },

    besie: () =>{
        {
            drawBesieLine();
        }
    },

    spline: () =>{
        {
            drawSplineLine();
        }
    }
}

function setGroup(group){
    toolGroup = group;
}

function addPoint(x, y) {
    drawPoints.push({ x, y });
}

cnv.addEventListener("click", function(event) {
    clickX = event.offsetX;
    clickY = event.offsetY;
    const selectedTool = document.querySelector('input[name="tool"]:checked').value;
    const isInited = tryInitCtx(selectedTool);
    addPoint(clickX, clickY);
    if(toolGroup!="tLinesToolGroup")
    {
        if(isInited){
            drawPoints.start = [clickX, clickY];
        }
        else
        {
            useTool[selectedTool]();
            deletePoints();
            currentType = {};
        } 
    }
    else
    {
        clearCanvas();
        useTool[selectedTool]();
    }
});



function waitingKeypress() {
	return new Promise((resolve) => {
  	document.addEventListener('keydown', onKeyHandler);
  	function onKeyHandler(e) {
  		if (e.keyCode === 13) {
      	document.removeEventListener('keydown', onKeyHandler);
    		resolve();
    	}
  	}
  });
}

function clearCanvas() {
    canvas.clearRect(0, 0, cnv.width, cnv.height);
}

function deletePoints(){
    drawPoints = [];
}

function clearAll(){
    clearCanvas();
    deletePoints();
}