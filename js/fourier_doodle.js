const canvas = document.getElementById('fourierDoodle');
const ctx = canvas.getContext('2d');

// Center point of the canvas
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Array to store point objects
const points = [
    { radius: 0, angle: 0, curAngle: 0, baseSpeed: 0.0025, direction: 1, size: 5, show: false, color: '#029400ff', trail: [] },
    { radius: 60, angle: Math.PI / 2, curAngle: 0, baseSpeed: 0.005, direction: 1, size: 5, show: true, color: '#ad00cfff', trail: [] },
    { radius: 40, angle: 0, curAngle: 0, baseSpeed: 0.01, direction: -1, size: 5, show: true, color: '#f5ff33ff', trail: [] },
    { radius: 0, angle: 0, curAngle: 0, baseSpeed: 0.02, direction: 1, size: 5, show: false, color: '#ff3366', trail: [] },
    { radius: 40, angle: Math.PI, curAngle: 0, baseSpeed: 0.04, direction: 1, size: 5, show: true, color: '#33ccff', trail: [] },
    { radius: 10, angle: 0, curAngle: 0, baseSpeed: 0.08, direction: -1, size: 5, show: true, color: '#08fd00ff', trail: [] },
    { radius: 0, angle: 0, curAngle: 0, baseSpeed: 0.16, direction: 1, size: 5, show: false, color: '#ff8800ff', trail: [] },
    { radius: 0, angle: 0, curAngle: 0, baseSpeed: 0.32, direction: 1, size: 5, show: false, color: '#0010eaff', trail: [] },
];

const showTrails = true; // Toggle trails on/off

function animate() {
    // 1. Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw center reference point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();

    // Store all positions for math anchoring, and visible positions for drawing lines
    const currentPositions = [{ x: centerX, y: centerY }];
    const visiblePositions = [{ x: centerX, y: centerY }];

    // 3. Update & Draw each point
    points.forEach((p, index) => {
        // Calculate new X, Y using trigonometry
        p.curAngle += p.baseSpeed * p.direction;
        const x = currentPositions[index].x + Math.cos(p.curAngle) * p.radius;
        const y = currentPositions[index].y + Math.sin(p.curAngle) * p.radius;

        // Always push to math anchor array so hidden points don't break downstream math
        currentPositions.push({ x, y });

        // If visible, track for lines and draw trails/circles
        if (p.show !== false) {
            visiblePositions.push({ x, y });
            
            // Trail logic
            p.trail.push({ x, y });
            if (p.trail.length > 2500) p.trail.shift();
            
            if (p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                for (let i = 1; i < p.trail.length; i++) {
                    ctx.lineTo(p.trail[i].x, p.trail[i].y);
                }
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Draw the circle point
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    });

    // 4. Draw connecting lines ONLY between visible points
    if (visiblePositions.length > 1) {
        ctx.beginPath();
        ctx.moveTo(visiblePositions[0].x, visiblePositions[0].y);
        for (let i = 1; i < visiblePositions.length; i++) {
            ctx.lineTo(visiblePositions[i].x, visiblePositions[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // 5. Loop animation
    requestAnimationFrame(animate);
}

// Start the animation
animate();

// Reset Button Logic
document.getElementById('resetBtn').addEventListener('click', () => {
    points.forEach((p) => {
        p.curAngle = p.angle;
        p.trail = [];
    });
    renderControlsTable(); // Updates the Phase sliders in the table to show 0
});

const tableBody = document.getElementById('fourierTableBody');

function renderControlsTable() {
    tableBody.innerHTML = '';

    points.forEach((p, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="color" value="${p.color}" data-index="${index}" data-prop="color"></td>
            <td><input type="range" min="0" max="200" value="${p.radius}" data-index="${index}" data-prop="radius"></td>
            <td><input type="checkbox" ${p.direction === 1 ? 'checked' : ''} data-index="${index}" data-prop="direction" title="Checked = +, Unchecked = -"></td>
            <td><input type="range" min="0" max="${Math.PI * 2}" step="0.1" value="${p.angle}" data-index="${index}" data-prop="angle"></td>
            <td><input type="checkbox" ${p.show === true ? 'checked' : ''} data-index="${index}" data-prop="show"></td>
        `;

        tableBody.appendChild(row);
    });
}

renderControlsTable();

// Explicit Event Listener for all controls
tableBody.addEventListener('change', (e) => {
    const input = e.target;
    const index = input.dataset.index;
    const prop = input.dataset.prop;

    if (index !== undefined && prop) {
        if (prop === 'direction') {
            points[index][prop] = input.checked ? 1 : -1;
        } else if (prop === 'show') {
            points[index][prop] = input.checked; // Explicitly updates show boolean
        } else if (input.type === 'range') {
            const val = parseFloat(input.value);
            points[index][prop] = val;
        } else {
            points[index][prop] = input.value; // Color picker
        }
    }
});