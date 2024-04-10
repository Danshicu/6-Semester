    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let points = [];
    let isDrawing = false;

    function startPolygon() {
        isDrawing = !isDrawing;
        if (isDrawing) {
            canvas.addEventListener("click", addPoint);
        } else {
            canvas.removeEventListener("click", addPoint);
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
    function clearCanvas(){
        isDrawing = false;
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