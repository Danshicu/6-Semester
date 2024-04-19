    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let points = [];
    let checkPoints = [];
    let isDrawing = false;
    let isChecking = false;
    let isCheckingPoint = false;
    let seeding = false;

    function startPolygon() {
        isDrawing = !isDrawing;
        isChecking=false;
        isCheckingPoint = false;
        canvas.removeEventListener("click", checkPointBelongsPolygon);
        canvas.removeEventListener("click", addCheckPoint);
        canvas.removeEventListener("click", fillPolydonBySeed);
        if (isDrawing) {
            canvas.addEventListener("click", addPoint);
        } else {
            canvas.removeEventListener("click", addPoint);
        }
    }

    function checkPoint(){
        isChecking = false;
        isDrawing=false;
        isCheckingPoint = !isCheckingPoint;
        canvas.removeEventListener("click", addPoint);
        canvas.removeEventListener("click", addCheckPoint);
        canvas.removeEventListener("click", fillPolydonBySeed);
        if (isCheckingPoint) {
            canvas.addEventListener("click", checkPointBelongsPolygon);
        } else {
            canvas.removeEventListener("click", checkPointBelongsPolygon);
            checkPoints = [];
            drawPolygon();
        }
    }

    function startCheck(){
        isChecking = !isChecking;
        isDrawing=false;
        isCheckingPoint = false;
        canvas.removeEventListener("click", addPoint);
        canvas.removeEventListener("click", checkPointBelongsPolygon);
        canvas.removeEventListener("click", fillPolydonBySeed);
        if (isChecking) {
            canvas.addEventListener("click", addCheckPoint);
        } else {
            canvas.removeEventListener("click", addCheckPoint);
            checkPoints = [];
            drawPolygon();
        }
    }

    function fillSeed(){
        seeding = !seeding
        if(seeding){
            canvas.addEventListener("click", fillPolydonBySeed);
        }else{
            canvas.removeEventListener("click", fillPolydonBySeed);
        }
    }

    function checkPointBelongsPolygon(event){
        let interPoints = [];
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const y1 = canvas.getBoundingClientRect().height-1;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (i > 0) {
                const prevPoint = points[i - 1];
                var interPoint = {x:0, y:0}
                if(get_line_intersection(x,y,x,y1,point.x,point.y,prevPoint.x,prevPoint.y, interPoint)){    
                    interPoints.push({interPoint});
                }
            }
        }
        if (points.length > 2) {
            const firstPoint = points[0];
            const lastPoint = points[points.length - 1];
            var interPoint = {x:0, y:0}
                if(get_line_intersection(x,y,x,y1,firstPoint.x,firstPoint.y,lastPoint.x,lastPoint.y, interPoint)){    
                    interPoints.push({interPoint});
                }
        }
        
        if(interPoints.length % 2 === 0){
            alert("Точка не принадлежит полигону")
            drawPoint(x,y, 'red');
        }
        else{
            alert("Точка принадлежит полигону")
            drawPoint(x,y, 'green');
        }
    }

    function addCheckPoint(event){
        let interPoints = [];
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        checkPoints.push({x,y});
        drawPoint(x,y);
        if(checkPoints.length===2){
            let x1 = checkPoints[0].x;
            let y1 = checkPoints[0].y;
            drawLine(x1, y1, x, y, 'red');
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                if (i > 0) {
                    const prevPoint = points[i - 1];
                    var interPoint = {x:0, y:0}
                    if(get_line_intersection(x,y,x1,y1,point.x,point.y,prevPoint.x,prevPoint.y, interPoint)){    
                        interPoints.push({interPoint});
                    }
                }
            }
            if (points.length > 2) {
                const firstPoint = points[0];
                const lastPoint = points[points.length - 1];
                var interPoint = {x:0, y:0}
                    if(get_line_intersection(x,y,x1,y1,firstPoint.x,firstPoint.y,lastPoint.x,lastPoint.y, interPoint)){    
                        interPoints.push({interPoint});
                    }
            }
        }
        for(let i=0; i<interPoints.length; i++){
            let point = interPoints[i].interPoint;
            const X = point.x;
            const Y = point.y;
            drawPoint(X, Y, 'green')
        };
        if(checkPoints.length===3){
            checkPoints = [];
            drawPolygon();
        }

    }

    function addPoint(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        points.push({ x, y });
        drawPoint(x, y);
        drawPolygon()
    }

    function drawPoint(x, y, color = "black") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawLine(x1, y1, x2, y2, color = "black") {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function drawPoints(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            drawPoint(point.x, point.y);}
    }

    function drawPolygon() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            drawPoint(point.x, point.y);
            if (i > 0) {
                const prevPoint = points[i - 1];
                drawLine(prevPoint.x, prevPoint.y, point.x, point.y);
            }
        }
        if (points.length > 2) {
            const firstPoint = points[0];
            const lastPoint = points[points.length - 1];
            drawLine(lastPoint.x, lastPoint.y, firstPoint.x, firstPoint.y);
        }
    }

    function checkMode(){
        return document.getElementById("tool-debug").checked;
    }

    function checkConvexity() {
        if (points.length < 3) {
            alert("Минимальное количество точек для проверки выпуклости: 3");
            return;
        }

        const orientation = getOrientation(points[0], points[1], points[2]);
        const isClockwise = orientation < 0;

        for (let i = 1; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];

            const currentOrientation = getOrientation(p1, p2, p3);
            if ((currentOrientation < 0 && !isClockwise) || (currentOrientation > 0 && isClockwise)) {
                alert("Полигон не является выпуклым");
                return;
            }
        }

        alert("Полигон является выпуклым");
    }

    const getOrientation = (p1, p2, p3) => {
        const val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
        if (val === 0) {
            return 0;
        } else if (val > 0) {
            return 1;
        } else {
            return -1;
        }
    };

    const calculateNormals = async () => {
        if (points.length < 3) {
            alert("Минимальное количество точек для расчета нормалей: 3");
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPolygon();

        for (let i = 0; i < points.length; i++) {
            const currPoint = points[i];
            const prevPoint = points[i === 0 ? points.length - 1 : i - 1];
            const nextPoint = points[(i + 1) % points.length];

            const normalX = nextPoint.y - currPoint.y;
            const normalY = currPoint.x - nextPoint.x;

            const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
            const normalizedNormalX = normalX / normalLength;
            const normalizedNormalY = normalY / normalLength;

            const normalStartX = currPoint.x + normalizedNormalX * 100;
            const normalStartY = currPoint.y + normalizedNormalY * 100;

            const normalEndX = currPoint.x - normalizedNormalX * 100;
            const normalEndY = currPoint.y - normalizedNormalY * 100;

            drawLine(normalStartX, normalStartY, normalEndX, normalEndY, "red");
            if(checkMode() === true){
                await waitingKeypress();
             }
        }
    }

    function preparePivotPoint() {
        let pivot = points[0];
        let pivotIndex = 0;
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            if (point.y < pivot.y || point.y === pivot.y && point.x < pivot.x) {
                pivot = point;
                pivotIndex = i;
            }
        }
        return pivot;
    }

    function getAngle(a, b) {
        return Math.atan2(b.y - a.y, b.x - a.x);
    }

    function euclideanDistanceSquared(p1, p2) {
        const a = p2.x - p1.x;
        const b = p2.y - p1.y;
        return a * a + b * b;
    }

    const computeConvexHullGraham = async () => {
        const pivot = preparePivotPoint();

        let indexes = Array.from(points, (point, i) => i);
        const angles = Array.from(points, (point) => getAngle(pivot, point));
        const distances = Array.from(points, (point) => euclideanDistanceSquared(pivot, point));

        // sort by angle and distance
        indexes.sort((i, j) => {
            const angleA = angles[i];
            const angleB = angles[j];
            if (angleA === angleB) {
                const distanceA = distances[i];
                const distanceB = distances[j];
                return distanceA - distanceB;
            }
            return angleA - angleB;
        });

        // remove points with repeated angle (but never the pivot, so start from i=1)
        for (let i = 1; i < indexes.length - 1; i++) {
            if (angles[indexes[i]] === angles[indexes[i + 1]]) {  // next one has same angle and is farther
                indexes[i] = -1;  // remove it logically to avoid O(n) operation to physically remove it
            }
        }

        const hull = [];
        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const point = points[index];

            if (index !== -1) {
                if (hull.length < 3) {
                    hull.push(point);
                } else {
                    while (getOrientation(hull[hull.length - 2], hull[hull.length - 1], point) > 0) {
                        hull.pop();
                    }
                    hull.push(point);
                }
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPolygon();

        for (let i = 0; i < hull.length; i++) {
            const startPoint = hull[i];
            const endPoint = hull[(i + 1) % hull.length];
            drawLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, "blue");
            if(checkMode() === true){
                await waitingKeypress();
             }
        }
    }

    const computeConvexHullJarvis = async () => {
        if (points.length < 3) {
            alert("Минимальное количество точек для вычисления выпуклой оболочки: 3");
            return;
        }

        const getOrientation = (p, q, r) => {
            const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            if (val === 0) {
                return 0;
            } else if (val > 0) {
                return 1;
            } else {
                return -1;
            }
        };

        const leftmostPoint = points.reduce((leftmost, point) => (point.x < leftmost.x ? point : leftmost));

        const hullPoints = [];
        let p = leftmostPoint;
        let q;

        do {
            hullPoints.push(p);
            q = points[0];
            for (let i = 1; i < points.length; i++) {
                if (q === p || getOrientation(p, q, points[i]) === -1) {
                    q = points[i];
                }
            }
            p = q;
        } while (p !== leftmostPoint);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPolygon();

        for (let i = 0; i < hullPoints.length; i++) {
            const startPoint = hullPoints[i];
            const endPoint = hullPoints[(i + 1) % hullPoints.length];
            drawLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, "blue");
            if(checkMode() === true){
                await waitingKeypress();
             }
        }
    }

    function get_line_intersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y, interPoint)
    {
        let s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;
    
        let s, t;
        s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
    
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
        {
            if(interPoint != undefined)
            {
            // Collision detected
            interPoint.x = p0_x + (t * s1_x);
            interPoint.y = p0_y + (t * s1_y);
            }
            return true;
        }
        return false; // No collision
    }

    function clearCanvas(){
        isDrawing = false;
        isChecking = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points = [];
    }

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

    const fillPolygonByLine = async(fillColor = "black") => 
    {
        // Находим границы многоугольника
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
    
        // Проходимся по каждой строке и заполняем многоугольник
        for (let y = minY; y <= maxY; y++) {
            let intersections = [];
    
            // Находим пересечения со сторонами многоугольника
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];
    
                // Проверяем, пересекает ли горизонтальная линия сторону многоугольника
                if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
                    // Вычисляем x координату пересечения
                    const intersectionX = (y - p1.y) / (p2.y - p1.y) * (p2.x - p1.x) + p1.x;
                    intersections.push(intersectionX);
                }
            }
    
            // Сортируем пересечения, чтобы получить отрезки для закраски
            intersections = intersections.sort((a, b) => a - b);
    
            // Закрашиваем каждый отрезок
            for (let i = 0; i < intersections.length; i += 2) {
                const x1 = Math.ceil(intersections[i]);
                const x2 = Math.floor(intersections[i + 1]);
                for (let x = x1; x < x2; x++) {
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(x, y, 1, 1);
                }
                if(checkMode() === true){
                    await waitingKeypress();
                 }
            }
        }
    }

    const fillPolydonBySeed = async(event) => {
        const rect = canvas.getBoundingClientRect();
        const startX = event.clientX - rect.left;
        const startY = event.clientY - rect.top;
        fill(startX, startY);
    }
      
    globalColor = { r: 0, g: 0, b: 0, a: 1 };
      
    function plot(x, y, c) {
    if (isFinite(x) && isFinite(y)) {
        const color = {
        r: globalColor.r,
        g: globalColor.g,
        b: globalColor.b,
        a: globalColor.a * c,
        };

        setPixel(x, y, color);
        }
    }
      
    function setPixel(x, y, c) {
        c = c || 1;
        const p = ctx.createImageData(1, 1);
        p.data[0] = c.r;
        p.data[1] = c.g;
        p.data[2] = c.b;
        p.data[3] = c.a * 255; // Умножаем на 255, чтобы получить значение в диапазоне от 0 до 255
        const data = ctx.getImageData(x, y, 1, 1).data;
        if (data[3] <= p.data[3]) {
        ctx.putImageData(p, x, y);
        }
    }
    
    function fill(x, y) {
        const startColor = ctx.getImageData(x, y, 1, 1).data;
        const q = [[x, y]];
        for (let i = 0; i !== q.length; i++) {
        const x = q[i][0],
            y = q[i][1];
        const data = ctx.getImageData(x, y, 1, 1).data;
        if (
            x >= 0 &&
            y >= 0 &&
            x < canvas.width &&
            y < canvas.height &&
            data[0] === startColor[0] &&
            data[1] === startColor[1] &&
            data[2] === startColor[2] &&
            data[3] === startColor[3]
        ) {
            plot(x, y, 1);
            const s = q.length;
            q[s] = [x + 1, y];
            q[s + 1] = [x - 1, y];
            q[s + 2] = [x, y + 1];
            q[s + 3] = [x, y - 1];
        }
        }
    }

    listOfYLists = {};
        
    function rastrHorizontalEdges(edge) {
        let y = Math.ceil(edge[0].y);
        let dy = edge[1].y - edge[0].y > 0 ? 1 : -1;
        let dx = (edge[1].x - edge[0].x) / (edge[1].y - edge[0].y);
        let x = edge[0].x;
        while (y <= edge[1].y) {
        console.log(listOfYLists[{y}]);
        if (!listOfYLists[{y}]) {
            listOfYLists[{y}] = [x];
        } else {
            listOfYLists[{y}].push(x);
        }
    
        y++;
        x += dx;
        }
    }
    
    function sortListRow() {
        for (let key in listOfYLists) {
        listOfYLists[key].sort((a, b) => a - b);
        }
    }
    
    function getIntervals() {
        const intervals = [];
        for (let i = 0; i < points.length - 1; i++) {
        rastrHorizontalEdges(
            [points[i], points[i + 1]].sort((a, b) => a.y - b.y)
        );
        }
        sortListRow();
    
        for (let key in listOfYLists) {
        for (let i = 0; i < listOfYLists[key].length; i += 2) 
        {
            intervals.push(
            {
                start: {
                    x: listOfYLists[key][i],
                    y: Number(key),
                },
                end: {
                    x: listOfYLists[key][i + 1],
                    y: Number(key),
                },
                });
            }
        }
    
        fillPolygonByLine()
    }