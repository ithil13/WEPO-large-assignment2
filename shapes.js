
/**** Shape ****/

function Shape(position, styles) {
    this.position = position;
    this.styles = {...styles};
};

Shape.prototype.setStyles = function() {
    drawio.ctx.fillStyle = this.styles.fillStyle;
    drawio.ctx.strokeStyle = this.styles.strokeStyle;
};

Shape.prototype.render = function() {};

Shape.prototype.move = function(position) {
    this.position = position;
};

Shape.prototype.resize = function() {};

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
    if (this.styles.fill) drawio.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    else drawio.ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
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
    drawio.ctx.beginPath();
    drawio.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    if (this.styles.fill) drawio.ctx.fill();
    else drawio.ctx.stroke();
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
    drawio.ctx.beginPath();
    drawio.ctx.moveTo(this.position.x, this.position.y);
    drawio.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    drawio.ctx.stroke();
};

Line.prototype.resize = function(x, y) {
    this.endPoint.x = x;
    this.endPoint.y = y;
};

/**** Drawing ****/

function Drawing(position, styles) {
    Shape.call(this, position, styles);
    this.points = [position];
};

Drawing.prototype = Object.create(Shape.prototype);
Drawing.prototype.constructor = Drawing;

Drawing.prototype.render = function() {
    drawio.ctx.beginPath();
    drawio.ctx.moveTo(this.position.x, this.position.y);
    for (i = 1; i < this.points.length; i++) {
        drawio.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    drawio.ctx.stroke();
    drawio.ctx.closePath();
};

Drawing.prototype.resize = function(x, y) {
    this.points.push({x: x, y: y});
};