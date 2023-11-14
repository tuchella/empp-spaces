const ARROW_SIZE = 10;
let center;
let vPre, vEmb, vTra, vDeg, vSpa, vMed, vCam, vBod; // TODO: don't need these references I guess
let vWorKno, vCulKno;
let dims = [];
let visArrow;
let cursor = 'auto';
let selection = null;
let canvasWithoutKnowledge;

let NO_SELECTION;
const GRAB_DISTANCE = 30;

const GRABBABLE_OBJECTS = [];

class Grabbable {
    constructor(position) {
        this.position = position;
        this.hover = false;
        GRABBABLE_OBJECTS.push(this);
    }

    update() {
        this.hover = false;

        const d = dist(mouseX, mouseY, this.position.x, this.position.y);
        if (d < GRAB_DISTANCE) {
            cursor = 'grab';

            if (selection == null || d < dist(mouseX, mouseY, selection.position.x, selection.position.y)) {
                selection.hover = false;
                selection = this;
                this.hover = true;
            }
        }
    }
    grab() { }
}

class VisualMediaArrow extends Grabbable {
    constructor() {
        super(createVector(0, 0));
        this.angle = state.visualMediaAngle;
    }
    draw() {
        const avv = createVector(height / 2 - 20, 0)
            .rotate(this.angle)
            .add(center);
        stroke(255, 0, 0);
        this.position.x = avv.x;
        this.position.y = avv.y;
        const clr = this.hover ? color('red') : color('darkred');
        arrow(avv.x, avv.y, center.x, center.y, clr);
        const avvText = avv.copy()
            .sub(center)
            .mult(1.01)
            .add(center);

        const offset = createVector(lerp(50, -50, avv.x / width), 0);
        if (this.angle > 0) {
            offset.y = lerp(25, 12, constrain((avv.y - 400) / 380, 0, 1));

        } else {
            offset.y = lerp(0, -15, constrain((avv.y - 20) / 100, 0, 1))

        }
        avvText.add(offset);
        textAlign(CENTER);
        text("visual media", avvText.x, avvText.y);
    }
    grab() {
        const mouse = createVector(mouseX, mouseY);
        this.angle = mouse.sub(center).heading();
        state.visualMediaAngle = round(this.angle, 3);
    }
}

class Dim extends Grabbable {
    constructor(x, y, origin, id) {
        super(createVector(lerp(x, origin.x, 0.5),
            lerp(y, origin.y, 0.5)));
        this.x = x;
        this.y = y;
        this.id = id;
        if (state.values[this.id]) {
            this.val = state.values[this.id];
        } else {
            this.val = random();
            state.values[this.id] = round(this.val, 3);
        }
        this.pos = this.position;
        this.origin = origin;
    }
    draw() {
        this.pos.x = lerp(this.origin.x, this.x, this.val * 0.95);
        this.pos.y = lerp(this.origin.y, this.y, this.val * 0.95);
        arrow(this.x, this.y, this.origin.x, this.origin.y);

        stroke(200);
        strokeWeight(20);
        if (this.hover) {
            stroke(200, 0, 0);
        }
        point(this.pos.x, this.pos.y);
        strokeWeight(1);
        stroke(0);
    }
    drawCurve() {
        curveVertex(this.pos.x, this.pos.y);
    }
    grab() {
        this.val = getClosestPointOnLine(new p5.Vector(mouseX, mouseY),
            this.origin, new p5.Vector(this.x, this.y));
        state.values[this.id] = round(this.val, 3);
    }
}

function getClosestPointOnLine(p, v, w) {
    var l2 = sq(v.x - w.x) + sq(v.y - w.y);
    if (l2 == 0) return 0.5;
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return t;
}

function copyProperties(obj1, obj2) {
    Object.keys(obj2).forEach(function (key) {
        if (key in obj1) {
            if (typeof obj1[key] === 'object') {
                copyProperties(obj1[key], obj2[key]);
            } else {
                obj1[key] = obj2[key];
            }
        }
    });
};

function setup() {
    createCanvas(1000, 800, document.getElementById('sketch-canvas'));
    canvasWithoutKnowledge = createGraphics(800, 800);
    textFont('Gabarito');
    textStyle(BOLD);

    // clear list of registered grabbable objects
    GRABBABLE_OBJECTS.splice(0, GRABBABLE_OBJECTS.length);

    center = createVector(600, height / 2);
    visArrow = new VisualMediaArrow();
    NO_SELECTION = new Grabbable(createVector(-1000, -1000));

    vPre = new Dim(400, 20, center, "presence");
    vEmb = new Dim(680, 120, center, "embodiment");
    vTra = new Dim(780, 400, center, "trasparency");
    vDeg = new Dim(680, 680, center, "freedom");
    vSpa = new Dim(400, 780, center, "space");
    vMed = new Dim(120, 680, center, "mediation");
    vCam = new Dim(20, 400, center, "camouflage");
    vBod = new Dim(120, 120, center, "body");
    dims = [vPre, vEmb, vTra, vDeg, vSpa, vMed, vCam, vBod];

    // TRANSLATE ALL ARROWS 200px to the right
    dims.forEach(d => {
        d.x += 200;
    });

    const originOfKnowledge = createVector(120, height / 2);
    vCulKno = new Dim(originOfKnowledge.x, height - 20, 
        originOfKnowledge, "culturalKnowledge");
    vWorKno = new Dim(originOfKnowledge.x, 20, 
        originOfKnowledge, "workbasedKnowledge");
}

function arrow(a, b, c, d, col) {
    col = col || (state.settings.darkMode ? 255 : 0);
    strokeWeight(4);
    let v = createVector(a - c, b - d)
        .normalize()
        .mult(ARROW_SIZE);
    let n = createVector(a - c, b - d)
        .normalize()
        .rotate(PI * 1.5)
        .mult(ARROW_SIZE * 0.5);
    stroke(col);
    fill(col);
    line(a, b, c, d);
    triangle(a, b, a + n.x - v.x, b + n.y - v.y, a - n.x - v.x, b - n.y - v.y);
    strokeWeight(0);
}

function drawArrow(v) {
    arrow(v.x, v.y, center.x, center.y);
}

function drawKnowledge() {
    textAlign(CENTER);
    fill((state.settings.darkMode ? 255 : 0));
    stroke((state.settings.darkMode ? 100 : 0));
    strokeWeight(0);
    text("work based knowledge required", vCulKno.origin.x + 5, 15);
    text("cultural knowledge required", vCulKno.origin.x, height - 5);

    strokeWeight(1);
    fill(100, 100, 100, 40);
    curveTightness(0.1);
    beginShape();
    const knoShapeWidth = 15;
    curveVertex(vCulKno.origin.x - knoShapeWidth, vWorKno.origin.y);
    vWorKno.drawCurve();
    curveVertex(vWorKno.origin.x + knoShapeWidth, vWorKno.origin.y);
    vCulKno.drawCurve();
    curveVertex(vCulKno.origin.x - knoShapeWidth, vWorKno.origin.y);
    vWorKno.drawCurve();
    curveVertex(vWorKno.origin.x + knoShapeWidth, vWorKno.origin.y);
    endShape();


    vCulKno.draw();
    vWorKno.draw();
    strokeWeight(4);
    stroke((state.settings.darkMode ? 255 : 0));
    line(vCulKno.origin.x - 20, vCulKno.origin.y,
        vCulKno.origin.x + 20, vCulKno.origin.y);
}

function resetState() {
    cursor = 'auto';
    if (!mouseIsPressed) {
        selection = NO_SELECTION;
        GRABBABLE_OBJECTS.forEach(o => o.update());
    }
}

function draw() {
    resetState();
    background(state.settings.darkMode ? 0 : 240);
    if (state.settings.showKnowledge) {
        drawKnowledge();
    }
    if (state.settings.showVisualMedia) {
        visArrow.draw();
    }

    fill(100, 100, 100, 40);
    stroke((state.settings.darkMode ? 100 : 0));
    curveTightness(state.settings.elasticity);
    strokeWeight(1);
    beginShape();
    dims.forEach(d => {
        d.drawCurve();
    });
    dims[0].drawCurve();
    dims[1].drawCurve();
    dims[2].drawCurve();
    endShape();

    dims.forEach(d => {
        d.draw();
    });

    translate(200, 0);
    textSize(18);
    strokeWeight(0);
    stroke((state.settings.darkMode ? 255 : 0));
    fill((state.settings.darkMode ? 255 : 0));
    textAlign(CENTER);
    drawText("space", 400, 795, "(centered/expanded)");
    drawText("Mediatization", 120, 710);
    drawText("Body", 120, 105);
    drawText("Presence", 400, 15);
    drawText("Embodiment", 680, 105);
    textAlign(LEFT);
    drawText("Camouflage", 15, 380);
    textAlign(RIGHT);
    drawText("Transparency", 785, 380);
    drawText("degrees of freedom", 705, 710, "(many/few)");
    translate(-200, 0);

    document.getElementById("sketch-canvas").style.cursor = cursor;
}


function drawText(textContent, x, y, additionalText) {
    const align = textAlign().horizontal;

    strokeWeight(0);
    textStyle(BOLD);
    if (!isFirefox) {
        // so text rendering seems to be a bit different for each browser...
        // non-firefox browser use a pretty tight spacing so we add a single
        // small-ish in between each character to give em some breating room.
        text(addLetterSpacing(textContent.toLowerCase(), 1, '\u2009'), x, y);
    } else {
        text(textContent.toLowerCase(), x, y);
    }

    if (additionalText) {
        let tWidth = textWidth(textContent);
        if (align == CENTER) {
            tWidth /= 2;
        } else if (align == RIGHT) {
            tWidth = 0;
        }
        textAlign(LEFT);
        textStyle(NORMAL);
        text(additionalText, x + tWidth + 4, y);
        textAlign(align);
    }

}

// adds spacing between letters in a string by
// inserting blank characters between each letter
function addLetterSpacing(input, amount, spacer) {
    // 'spacer' character to use
    // (can be passed in as an optional argument, or it
    // will use the unicode 'hair space' one by default)
    spacerCharacter = '\u200A' || spacer;

    // split the string into a list of characters
    let characters = input.split('');

    // create a series of spacers using the
    // repeat() function
    spacerCharacter = spacerCharacter.repeat(amount);

    // use join() to combine characters with the spacer
    // and send back as a string
    return characters.join(spacerCharacter);
}

function mouseDragged() {
    selection.grab();
    return false;
}