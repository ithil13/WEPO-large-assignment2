
/**** Shape ****/

function Shape(position, styles) {
    this.position = position;
    this.styles = {...styles};
    this.path = null;
};

Shape.prototype.setStyles = function() {
    drawio.ctx.fillStyle = this.styles.fillStyle;
    drawio.ctx.strokeStyle = this.styles.strokeStyle;
    drawio.ctx.lineWidth = this.styles.lineWidth;
    drawio.ctx.font =  this.styles.fontStyle + ' ' + this.styles.fontSize + 'px ' + this.styles.font;
};

Shape.prototype.render = function() {};

Shape.prototype.move = function(xMove, yMove) {
    this.position.x = this.position.x + xMove;
    this.position.y = this.position.y + yMove;
};

Shape.prototype.resize = function() {};

Shape.prototype.restyle = function(key, value) {
    this.styles[key] = value;
};

Shape.prototype.isPointInElement = function(x, y) {
    return drawio.ctx.isPointInStroke(this.path, x, y) || drawio.ctx.isPointInPath(this.path, x, y);
}

/**** Rectangle ****/

function Rectangle(position, styles) {
    Shape.call(this, position, styles);
    this.width = 0;
    this.height = 0;
};

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.render = function() {
    this.setStyles();
    this.path = new Path2D();
    this.path.rect(this.position.x, this.position.y, this.width, this.height);
    if (this.styles.fill) drawio.ctx.fill(this.path);
    else drawio.ctx.stroke(this.path);
};

Rectangle.prototype.resize = function(x, y) {
    this.width = x - this.position.x;
    this.height = y - this.position.y;
};

/**** Circle ****/

function Circle(position, styles) {
    Shape.call(this, position, styles);
    this.radius = 0;
};

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.render = function() {
    this.setStyles();
    this.path = new Path2D();
    this.path.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    if (this.styles.fill) drawio.ctx.fill(this.path);
    else drawio.ctx.stroke(this.path);
};

Circle.prototype.resize = function(x, y) {
    this.radius = Math.sqrt(Math.pow(x - this.position.x, 2) + Math.pow(y - this.position.y, 2));
};

/**** Line ****/

function Line(position, styles) {
    Shape.call(this, position, styles);
    this.endPoint = {...position};
};

Line.prototype = Object.create(Shape.prototype);
Line.prototype.constructor = Line;

Line.prototype.render = function() {
    this.setStyles();
    this.path = new Path2D();
    this.path.moveTo(this.position.x, this.position.y);
    this.path.lineTo(this.endPoint.x, this.endPoint.y);
    drawio.ctx.stroke(this.path);
};

Line.prototype.resize = function(x, y) {
    this.endPoint.x = x;
    this.endPoint.y = y;
};

Line.prototype.move = function(xMove, yMove) {
    this.position.x = this.position.x + xMove;
    this.position.y = this.position.y + yMove;
    this.endPoint.x = this.endPoint.x + xMove;
    this.endPoint.y = this.endPoint.y + yMove;
}

/**** Drawing ****/

function Drawing(position, styles) {
    Shape.call(this, position, styles);
    this.points = [position];
};

Drawing.prototype = Object.create(Shape.prototype);
Drawing.prototype.constructor = Drawing;

Drawing.prototype.render = function() {
    this.setStyles();
    this.path = new Path2D();
    this.path.moveTo(this.position.x, this.position.y);
    for (i = 1; i < this.points.length; i++) {
        this.path.lineTo(this.points[i].x, this.points[i].y);
    }
    drawio.ctx.stroke(this.path);
};

Drawing.prototype.resize = function(x, y) {
    this.points.push({x: x, y: y});
};

Drawing.prototype.move = function(xMove, yMove) {
    this.position.x = this.position.x + xMove;
    this.position.y = this.position.y + yMove;
    this.points = this.points.map(p => { return {x: p.x + xMove, y: p.y + yMove} });
}

/**** Text ****/

function Text(position, styles) {
    Shape.call(this, position, styles);
    this.text = 'Insert text';
};

Text.prototype = Object.create(Shape.prototype);
Text.prototype.constructor = Text;

Text.prototype.render = function() {
    this.setStyles();
    let topEdge = this.position.y - this.styles.fontSize;
    let width = drawio.ctx.measureText(this.text).width + 6
    this.path = new Path2D();
    this.path.rect(this.position.x - 3, topEdge, width, parseInt(this.styles.fontSize) + 6);
    drawio.ctx.fillText(this.text, this.position.x, this.position.y);
};

Text.prototype.resize = function(newText) {
    this.text = newText;
};

Text.prototype.isPointInElement = function(x, y) {
    let rightEdge = this.position.x + drawio.ctx.measureText(this.text).width;
    let topEdge = this.position.y - this.styles.fontSize;
    return this.position.x <= x && x <= rightEdge && topEdge <= y && y <= this.position.y;
}
