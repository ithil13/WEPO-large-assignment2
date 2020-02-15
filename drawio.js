window.drawio = {
    shapes: [],
    selectedShape: 'rectangle',
    canvas: document.getElementById('my-canvas'),
    ctx: document.getElementById('my-canvas').getContext('2d'),
    selectedElement: null,
    styles: {
        fill: true,
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 5
    },
    availableShapes: {
        RECTANGLE: 'rectangle',
        CIRCLE: 'circle',
        LINE: 'line',
        DRAWING: 'drawing',
        SELECT: 'select'
    },
    colorPalette: [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
    ]
};

$(function() {
    
    function drawCanvas() {
        for (var i = 0; i < drawio.shapes.length; i++) {
            drawio.shapes[i].render();
        }
        if (drawio.selectedElement) drawio.selectedElement.render();
    };

    function selectShape(x,y) {
        drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
        for (var i = 0; i < drawio.shapes.length; i++) {
            if (drawio.ctx.isPointInStroke(drawio.shapes[i].path, x, y) || drawio.ctx.isPointInPath(drawio.shapes[i].path, x, y)) {
                drawio.selectedElement = drawio.shapes[i];
            }
            drawio.shapes[i].render();
        }
        if (drawio.selectedElement) {
            drawio.ctx.strokeStyle = 'white';
            drawio.ctx.lineWidth = 3;
            drawio.ctx.setLineDash([4, 4]);
            drawio.ctx.stroke(drawio.selectedElement.path);
            drawio.ctx.setLineDash([]);
        }
    };

    $('.icon').on('click', function() {
        $('.icon').removeClass('selected');
        $(this).addClass('selected');
        drawio.selectedShape = $(this).data('shape');
        var fillSetting = $(this).data('fill');
        if (fillSetting != undefined) {
            drawio.styles.fill = fillSetting;
        }
    });

    $("#fill-color").on('change', function() {
        var color = $("#fill-color").spectrum('get').toHexString();
        drawio.styles.fillStyle = color;
    });

    $("#line-color").on('change', function() {
        var color = $("#line-color").spectrum('get').toHexString();
        drawio.styles.strokeStyle = color;
    });

    $('#my-canvas').on('mousedown', function(mouseEvent) {
        drawio.selectedElement = null;
        switch (drawio.selectedShape) {
            case drawio.availableShapes.RECTANGLE:
                drawio.selectedElement = new Rectangle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.CIRCLE:
                drawio.selectedElement = new Circle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.LINE:
                drawio.selectedElement = new Line({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.DRAWING:
                drawio.selectedElement = new Drawing({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
        }
    });

    $('#my-canvas').on('mousemove', function(mouseEvent) {
        if (drawio.selectedElement && drawio.selectedShape != drawio.availableShapes.SELECT) {
            drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
            drawio.selectedElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
            drawCanvas();
        }
    });

    $('#my-canvas').on('mouseup', function(mouseEvent) {
        if (drawio.selectedElement) {
            drawio.shapes.push(drawio.selectedElement);
            drawio.selectedElement = null;
        } else if (drawio.selectedShape == drawio.availableShapes.SELECT) {
            selectShape(mouseEvent.offsetX, mouseEvent.offsetY);
        }
    });

    $("#fill-color").spectrum({
        color: "#000000",
        showInput: true,
        showInitial: true,
        showPalette: true,
        palette: drawio.colorPalette
    });

    $("#line-color").spectrum({
        color: "#000000",
        showInput: true,
        showInitial: true,
        showPalette: true,
        palette: drawio.colorPalette
    });
})
