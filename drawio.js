window.drawio = {
    shapes: [],
    selectedShape: 'rectangle-filled',
    canvas: document.getElementById('my-canvas'),
    ctx: document.getElementById('my-canvas').getContext('2d'),
    selectedElement: null,
    styles: {
        fill: true
    },
    availableShapes: {
        RECTANGLE_FILLED: 'rectangle-filled',
        RECTANGLE_OUTLINE: 'rectangle-outline',
        CIRCLE_FILLED: 'circle-filled',
        CIRCLE_OUTLINE: 'circle-outline',
        LINE: 'line'
    }
};

$(function() {
    
    function drawCanvas() {
        if (drawio.selectedElement) drawio.selectedElement.render();
        for (var i = 0; i < drawio.shapes.length; i++) {
            drawio.shapes[i].render();
        }
    };

    $('.icon').on('click', function() {
        $('.icon').removeClass('selected');
        $(this).addClass('selected');
        drawio.selectedShape = $(this).data('shape');
        // use another data variable for fill/outline and set the style here to
        // eliminate the need for separate cases for the same shape
    });

    $('#my-canvas').on('mousedown', function(mouseEvent) {
        switch (drawio.selectedShape) {
            case drawio.availableShapes.RECTANGLE_FILLED:
                drawio.styles.fill = true;
                drawio.selectedElement = new Rectangle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.RECTANGLE_OUTLINE:
                drawio.styles.fill = false;
                drawio.selectedElement = new Rectangle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.CIRCLE_FILLED:
                drawio.styles.fill = true;
                drawio.selectedElement = new Circle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.CIRCLE_OUTLINE:
                drawio.styles.fill = false;
                drawio.selectedElement = new Circle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.LINE:
                drawio.selectedElement = new Line({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
        }
    });

    $('#my-canvas').on('mousemove', function(mouseEvent) {
        if (drawio.selectedElement) {
            drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
            drawio.selectedElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
            drawCanvas();
        }
    });

    $('#my-canvas').on('mouseup', function() {
        drawio.shapes.push(drawio.selectedElement);
        drawio.selectedElement = null;
    });
})