
/**** Shape ****/

function Shape(position) {
    this.position = position;
};

Shape.prototype.render = function() {};

Shape.prototype.move = function(position) {
    this.position = position;
};

Shape.prototype.resize = function() {};

/**** Rectangle ****/

function Rectangle(position, styles) {
    Shape.call(this, position);
    this.width = 0;
    this.height = 0;
    this.styles = {...styles};
};

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.render = function() {
    if (this.styles.fill) drawio.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    else drawio.ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
};

Rectangle.prototype.resize = function(x, y) {
    this.width = x - this.position.x;
    this.height = y - this.position.y;
};

/**** Circle ****/

function Circle(position, styles) {
    Shape.call(this, position);
    this.radius = 0;
    this.styles = {...styles};
};

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.render = function() {
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
    Shape.call(this, position);
    this.endPoint = {...position};
    this.styles = {...styles};
};

Line.prototype = Object.create(Shape.prototype);
Line.prototype.constructor = Line;

Line.prototype.render = function() {
    console.log("start:", this.position, "end:", this.endPoint)
    drawio.ctx.beginPath();
    drawio.ctx.moveTo(this.position.x, this.position.y)
    drawio.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    drawio.ctx.stroke();
    drawio.ctx.closePath();
};

Line.prototype.resize = function(x, y) {
    this.endPoint.x = x;
    this.endPoint.y = y;
};