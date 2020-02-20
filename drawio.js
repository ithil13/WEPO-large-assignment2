/*
Large assignment II group 5
  - Arnþór Daði Jónasson
  - Guðrún Helga Finnsdóttir
  - Hafþór Hákonarson

Extra features:
  - Select/Move multiple elements
  - Change styles of selected elements
  - Delete selected elements
  - Advanced undo/redo, works with moving, deleting and changing styles of elements
*/

window.drawio = {
    allShapes: [],
    visibleShapes: [],
    undoStack: [],
    redoStack: [],
    selectedElements: [],
    selectedShape: 'drawing',
    canvas: document.getElementById('my-canvas'),
    ctx: document.getElementById('my-canvas').getContext('2d'),
    newElement: null,
    moveSelected: false,
    editingText: false,
    mouseStart: {},
    mouseMove: {},
    styles: {
        fill: true,
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 5,
        font: 'Comic Sans MS',
        fontSize: 20,
        fontStyle: ''
    },
    availableShapes: {
        RECTANGLE: 'rectangle',
        CIRCLE: 'circle',
        LINE: 'line',
        DRAWING: 'drawing',
        TEXT: 'text',
        SELECT: 'select'
    },
    actions: {
        ADD: 'add',
        DELETE: 'delete',
        MOVE: 'move',
        STYLE: 'style',
        TEXT: 'text'
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

    /* Drawing and selecting */
    
    function drawCanvas() {
        drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
        for (var i = 0; i < drawio.visibleShapes.length; i++) {
            drawio.allShapes[drawio.visibleShapes[i]].render();
        }
        if (drawio.newElement) drawio.newElement.render();
    };

    function drawSelectedIndicator() {
        drawio.ctx.save();
        drawio.ctx.strokeStyle = 'grey';
        drawio.ctx.lineWidth = 3;
        drawio.ctx.setLineDash([4, 4]);
        for (i = 0; i < drawio.selectedElements.length; i++) {
            drawio.ctx.stroke(drawio.allShapes[(drawio.selectedElements[i])].path);
        }
        drawio.ctx.restore();
    };

    function selectShape(x, y) {
        drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
        var selected = null;
        for (var i = 0; i < drawio.allShapes.length; i++) {
            if (drawio.visibleShapes.includes(i)) {
                if (drawio.allShapes[i].isPointInElement(x, y)) {
                    selected = i;
                }
                drawio.allShapes[i].render();
            }
        }
        if (selected != null) {
            var selectedIndex = drawio.selectedElements.indexOf(selected);
            if (selectedIndex != -1) drawio.selectedElements.splice(selectedIndex,1);
            else drawio.selectedElements.push(selected);
        }
        if (drawio.selectedElements.length > 0) {
            var selectedShapes = drawio.selectedElements.map(i => drawio.allShapes[i]);
            if (selectedShapes.some(e => Object.getPrototypeOf(e).constructor.name == 'Text')) {
                $('.text-settings').removeClass('hidden');
            } else $('.text-settings').addClass('hidden');
            drawSelectedIndicator();
        }
    };

    function elementIsSelected(x, y) {
        for (var i = 0; i < drawio.selectedElements.length; i++) {
            if (drawio.allShapes[(drawio.selectedElements[i])].isPointInElement(x, y)) {
                return true;
            }
        }
        return false;
    };

    /* Creating and deleting shapes */

    $('.shape').on('click', function() {
        $('.shape').removeClass('selected');
        $(this).addClass('selected');
        drawio.selectedElements = [];
        drawCanvas();
        drawio.selectedShape = $(this).data('shape');
        var fillSetting = $(this).data('fill');
        if (fillSetting != undefined) {
            drawio.styles.fill = fillSetting;
        }
        if (drawio.selectedShape != drawio.availableShapes.TEXT) {
            $('.text-settings').addClass('hidden');
        }
        if (drawio.editingText) {
            drawio.allShapes.push(drawio.newElement);
            let index = drawio.allShapes.indexOf(drawio.newElement);
            drawio.visibleShapes.push(index);
            drawio.undoStack.push([drawio.actions.ADD, [index]]);
            drawio.redoStack = [];
            disableUndoRedo('redo');
            drawio.newElement = null;
            drawio.editingText = false;
            $('#text-input').val('Write your text here');
        }
        if (drawio.selectedShape == drawio.availableShapes.SELECT) {
            $('.select-options').removeClass('hidden');
        } else $('.select-options').addClass('hidden');
    });

    $('#my-canvas').on('mousedown', function(mouseEvent) {
        switch (drawio.selectedShape) {
            case drawio.availableShapes.RECTANGLE:
                drawio.newElement = new Rectangle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.CIRCLE:
                drawio.newElement = new Circle({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.LINE:
                drawio.newElement = new Line({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.DRAWING:
                drawio.newElement = new Drawing({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                break;
            case drawio.availableShapes.SELECT:
                if (drawio.selectedElements.length != 0 && !mouseEvent.ctrlKey) {
                    var x = mouseEvent.offsetX;
                    var y = mouseEvent.offsetY;
                    if (elementIsSelected(x, y)) {
                        drawio.moveSelected = true;
                        drawio.mouseStart = {x: x, y: y};
                        drawio.mouseMove = {x: x, y: y};
                        console.log('mousedown startpoint:', drawio.mouseStart)
                    } else {
                        drawio.selectedElements = [];
                        $('.text-settings').addClass('hidden');
                    } 
                }
                break;
        }
    });

    $('#my-canvas').on('mousemove', function(mouseEvent) {
        if (drawio.newElement && drawio.selectedShape != drawio.availableShapes.SELECT && !drawio.editingText) {
            drawio.newElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
            drawCanvas();
        } else if (drawio.selectedElements.length > 0 && drawio.moveSelected) {
            var xMove = mouseEvent.offsetX - drawio.mouseMove.x;
            var yMove = mouseEvent.offsetY - drawio.mouseMove.y;
            
            for (var i = 0; i < drawio.selectedElements.length; i++) {
                drawio.allShapes[drawio.selectedElements[i]].move(xMove, yMove);
            }
            drawio.mouseMove = {x: mouseEvent.offsetX, y: mouseEvent.offsetY};
            drawCanvas();
            drawSelectedIndicator();
        }
    });

    $('#my-canvas').on('mouseup', function(mouseEvent) {
        switch (drawio.selectedShape) {
            case drawio.availableShapes.SELECT:
                if (drawio.selectedElements.length == 0 || (drawio.selectedElements.length > 0 && mouseEvent.ctrlKey)) {
                    selectShape(mouseEvent.offsetX, mouseEvent.offsetY);
                } else if (drawio.selectedElements.length > 0 && drawio.moveSelected) {
                    drawio.moveSelected = false;
                    var xMove = mouseEvent.offsetX - drawio.mouseStart.x;
                    var yMove = mouseEvent.offsetY - drawio.mouseStart.y;
                    drawio.undoStack.push([drawio.actions.MOVE, drawio.selectedElements.slice(), xMove, yMove]);
                    drawio.redoStack = [];
                    console.log('mouseup undostack:', drawio.undoStack)
                    disableUndoRedo('redo');
                }
                break;
            case drawio.availableShapes.TEXT:
                if (drawio.newElement) {
                    drawio.allShapes.push(drawio.newElement);
                    var index = drawio.allShapes.indexOf(drawio.newElement);
                    drawio.visibleShapes.push(index);
                    drawio.undoStack.push([drawio.actions.ADD, [index]]);
                    drawio.redoStack = [];
                    disableUndoRedo('redo');
                    drawio.newElement = null;
                    drawio.editingText = false;
                    $('.text-settings').addClass('hidden');
                    $('#text-input').val('Write your text here');
                } else {
                    $('.text-settings').removeClass('hidden');
                    drawio.newElement = new Text({x: mouseEvent.offsetX, y: mouseEvent.offsetY}, drawio.styles);
                    drawio.newElement.render(); 
                    drawio.editingText = true;
                }
                break;
            default:
                if (drawio.newElement) {
                    drawio.allShapes.push(drawio.newElement);
                    var index = drawio.allShapes.indexOf(drawio.newElement);
                    drawio.visibleShapes.push(index);
                    drawio.undoStack.push([drawio.actions.ADD, [index]]);
                    drawio.redoStack = [];
                    disableUndoRedo('redo');
                    drawio.newElement = null;
                }
        }
        if (drawio.selectedShape != drawio.availableShapes.SELECT) {
            enableUndoRedo('undo');
        }
    });

    $('#delete-selected').on('click', function() {
        if (drawio.selectedElements.length > 0) {
            var undoObject = [drawio.actions.DELETE, []];
            for (e = 0; e < drawio.selectedElements.length; e++) {
                for (var i = 0; i < drawio.visibleShapes.length; i++) {
                    if (drawio.selectedElements[e] == drawio.visibleShapes[i]) {
                        drawio.visibleShapes.splice(i, 1);
                        undoObject[1].push(drawio.selectedElements[e]);
                    }
                }
            }
            drawio.selectedElements = [];
            drawio.undoStack.push(undoObject);
            drawio.redoStack = [];
            disableUndoRedo('redo');
            $('.text-settings').addClass('hidden');
            drawCanvas();
        }
    });

    /* Undo and redo */

    $('.action').on('click', function() {
        if (this.classList.contains('load')) {
            loadImage();
        } else if (this.classList.contains('save')) {
            saveImage();
        } else if ($(this).data('action') == "undo") {
            undoShape();
        } else if ($(this).data('action') == "redo") {
            redoShape();
        }
    });

    function undoShape() {
        if (drawio.allShapes.length == 0) return;
        var undoObject = drawio.undoStack.pop();
        if (undoObject[0] == drawio.actions.ADD) {
            drawio.visibleShapes = drawio.visibleShapes.filter(s => !undoObject[1].includes(s));
        } else if (undoObject[0] == drawio.actions.DELETE) {
            drawio.visibleShapes = drawio.visibleShapes.concat(undoObject[1]);
            drawio.visibleShapes.sort();
        } else if (undoObject[0] == drawio.actions.MOVE) {
            for (var i = 0; i < undoObject[1].length; i++) {
                drawio.allShapes[undoObject[1][i]].move(-undoObject[2], -undoObject[3]);
            }
        } else if (undoObject[0] == drawio.actions.STYLE) {
            for (var i = 0; i < undoObject[1].length; i++) {
                drawio.allShapes[undoObject[1][i].element].restyle(undoObject[2], undoObject[1][i].oldValue);
            }
        } else if (undoObject[0] == drawio.actions.TEXT) {
            for (var i = 0; i < undoObject[1].length; i++) {
                drawio.allShapes[undoObject[1][i].element].resize(undoObject[1][i].oldText);
            }
        }

        drawio.redoStack.push(undoObject);
        if (drawio.undoStack.length > 100) {
            drawio.undoStack.splice(0, 1);
        }
        drawCanvas();
        enableUndoRedo('redo');
        if (drawio.undoStack.length == 0) {
            disableUndoRedo('undo');
        }
    };

    function redoShape() {
        if (drawio.redoStack.length == 0) return;
        var redoObject = drawio.redoStack.pop();
        drawio.undoStack.push(redoObject);

        if (redoObject[0] == drawio.actions.ADD) {
            drawio.visibleShapes = drawio.visibleShapes.concat(redoObject[1]);
        } else if (redoObject[0] == drawio.actions.DELETE) {
            drawio.visibleShapes = drawio.visibleShapes.filter(s => !redoObject[1].includes(s));
        } else if (redoObject[0] == drawio.actions.MOVE) {
            for (var i = 0; i < redoObject[1].length; i++) {
                drawio.allShapes[redoObject[1][i]].move(redoObject[2], redoObject[3]);
            }
        } else if (redoObject[0] == drawio.actions.STYLE) {
            for (var i = 0; i < redoObject[1].length; i++) {
                drawio.allShapes[redoObject[1][i].element].restyle(redoObject[2], redoObject[1][i].newValue);
            }
        } else if (redoObject[0] == drawio.actions.TEXT) {
            for (var i = 0; i < redoObject[1].length; i++) {
                drawio.allShapes[redoObject[1][i].element].resize(redoObject[1][i].newText);
            }
        }

        drawCanvas();
        enableUndoRedo('undo');
        if (drawio.redoStack.length == 0) {
            disableUndoRedo('redo');
        }
    };

    function disableUndoRedo(text) {
        if (!document.getElementById(text).classList.contains('disabled')) {
            $('#'+text).addClass('disabled');
        }
    };

    function enableUndoRedo(text) {
        if (document.getElementById(text).classList.contains('disabled')) {
            $('#'+text).removeClass('disabled');
        }
    };

    /* Save and load image */

    function loadImage() {
        var names = "";
        for (const [key, value] of Object.entries(localStorage)) {
            names += key + ",\n  ";
        }
        var loadImg = prompt("Which image would you like to load? \nCurrent images in storage are:\n  " + names);
        var x = window.localStorage.getItem(loadImg);
        drawImageFromString(x);
        $('.shape').removeClass('selected');
        $('#default-shape').addClass('selected');
        $('.select-options').addClass('hidden');
    };

    function drawImageFromString(x){
        drawio.allShapes = [];
        drawio.selectedElements = [];
        drawio.visibleShapes = [];
        drawio.undoStack = [[drawio.actions.ADD, []]];
        drawio.redoStack = [];
        var arr = x.split(";");
        for (var i = 0; i < arr.length - 1; i++) {
            var items = arr[i].split(',');
            if (items[0] == 'Rectangle') {
                var add = new Rectangle({x: parseInt(items[1]), y: parseInt(items[2])},{fill: items[3] == 'true', fillStyle: items[4],
                strokeStyle: items[5], lineWidth: items[6]});
                add.width = items[7];
                add.height = items[8];
            } else if (items[0] == 'Circle') {
                var add = new Circle({x: parseInt(items[1]), y: parseInt(items[2])},{fill: items[3] == 'true', fillStyle: items[4],
                    strokeStyle: items[5], lineWidth: items[6]});
                add.radius = items[7];  
            } else if(items[0] == 'Line') {
                var add = new Line({x: parseInt(items[1]), y: parseInt(items[2])},{fill: items[3] == 'true', fillStyle: items[4],
                    strokeStyle: items[5], lineWidth: items[6]})
                add.endPoint.x = items[7];
                add.endPoint.y = items[8];
            } else if(items[0] == 'Drawing') {
                var add = new Drawing({x: parseInt(items[1]), y: parseInt(items[2])},{fill: items[3] == 'true', fillStyle: items[4],
                    strokeStyle: items[5], lineWidth: items[6]});
                for (j = 7; j < items.length; j = j + 2) {
                    add.points.push({x:items[j],y:items[j+1]});
                }
            } else if (items[0] == 'Text') {
                var add = new Text({x: parseInt(items[1]), y: parseInt(items[2])}, {fill: items[3] == 'true', fillStyle: items[4],
                    strokeStyle: items[5], lineWidth: items[6], font: items[7], fontSize: parseInt(items[8]), fontStyle: items[9]})
                add.resize(items[10]);
            }
            drawio.allShapes.push(add);
            drawio.visibleShapes.push(i);
            drawio.undoStack[0][1].push(i);
        }
        enableUndoRedo('undo');
        disableUndoRedo('redo');
        drawCanvas();
    };

    function saveImage() {
        var x = drawio.allShapes;
        var toStore = stringifyDrawioObject(x);
        myStorage = window.localStorage;
        var img = prompt("Image name: ");
        localStorage.setItem(img, toStore);
    };

    function stringifyDrawioObject(x){
        result = "";
        for (i in x) {
            if (drawio.visibleShapes.includes(i)) {
                result += Object.getPrototypeOf(x[i]).constructor.name + "," +
                    x[i].position.x.toString() + "," + x[i].position.y.toString() + ","
                    + x[i].styles.fill + "," + x[i].styles.fillStyle + "," + x[i].styles.strokeStyle
                    + "," + x[i].styles.lineWidth;
                if (Object.getPrototypeOf(x[i]).constructor.name == "Rectangle") {
                    result +=  "," + x[i].width + "," + x[i].height;
                } else if (Object.getPrototypeOf(x[i]).constructor.name == "Circle") {
                    result += "," + x[i].radius;
                } else if (Object.getPrototypeOf(x[i]).constructor.name == "Line") {
                    result += "," + x[i].endPoint.x + "," + x[i].endPoint.y;
                } else if (Object.getPrototypeOf(x[i]).constructor.name == "Drawing") {
                    for (u in x[i].points) {
                        result += "," + x[i].points[u].x + "," + x[i].points[u].y;
                    }
                } else if (Object.getPrototypeOf(x[i]).constructor.name == "Text") {
                    result += "," + x[i].styles.font + "," + x[i].styles.fontSize + "," 
                    + x[i].styles.fontStyle + "," + x[i].text;
                }
                result += ";";
            }
        }
        return result;
    };

    /* Styling */

    function restyleSelected(prop, value) {
        var undoObject = [drawio.actions.STYLE, [], prop];
        for (i = 0; i < drawio.selectedElements.length; i++) {
            let element = drawio.allShapes[drawio.selectedElements[i]];
            let oldValue = element.styles[prop];
            element.restyle(prop, value);
            undoObject[1].push({element: drawio.selectedElements[i], oldValue: oldValue, newValue: value});
        }
        if (undoObject[1].some(o => o.oldValue != o.newValue)) {
            drawio.undoStack.push(undoObject);
            drawio.redoStack = [];
            disableUndoRedo('redo');
        }
        drawCanvas();
        drawSelectedIndicator();
    }

    $('#fill-color').on('change', function() {
        var color = $('#fill-color').spectrum('get').toHexString();
        drawio.styles.fillStyle = color;
        if (drawio.selectedElements.length > 0) restyleSelected('fillStyle', color);
    });

    $('#line-color').on('change', function() {
        var color = $('#line-color').spectrum('get').toHexString();
        drawio.styles.strokeStyle = color;
        if (drawio.selectedElements.length > 0) restyleSelected('strokeStyle', color);
    });

    $('#text-input').on('focus', function() {
        if (drawio.selectedElements.length > 0) {
            for (i = 0; i < drawio.selectedElements.length; i++) {
                let element = drawio.allShapes[drawio.selectedElements[i]];
                if (Object.getPrototypeOf(element).constructor.name == "Text") {
                    element.setOldText();
                }
            }
        }
    });

    $('#text-input').on('change', function() {
        if (drawio.selectedElements.length > 0) {
            var newText = $(this).val();
            var undoObject = [drawio.actions.TEXT, []]
            for (i = 0; i < drawio.selectedElements.length; i++) {
                var index = drawio.selectedElements[i]
                var element = drawio.allShapes[index];
                if (Object.getPrototypeOf(element).constructor.name == "Text") {
                    var oldText = element.oldText;
                    if (oldText != newText) {
                        undoObject[1].push({element: index, oldText: oldText, newText: newText});
                    }
                }
            } 
            if (undoObject[1].length > 0) {
                drawio.undoStack.push(undoObject);
                drawio.redoStack = [];
                disableUndoRedo('redo');
            }
        }
    });

    $('#text-input').on('keyup', function() {
        var text = $(this).val();
        if (drawio.editingText) {
            drawio.newElement.resize(text);
            drawCanvas();
            drawio.newElement.render();
        }
        if (drawio.selectedElements.length > 0) {
            for (i = 0; i < drawio.selectedElements.length; i++) {
                drawio.allShapes[drawio.selectedElements[i]].resize(text);
            }
            drawCanvas();
            drawSelectedIndicator();
        }
    });

    $('#font-size').on('change', function() {
        var fontSize = $(this).val();
        if (drawio.editingText) {
            drawio.newElement.restyle('fontSize', fontSize);
            drawCanvas();
            drawio.newElement.render();
        }
        if (drawio.selectedElements.length > 0) restyleSelected('fontSize', fontSize);
    });

    $('#font-settings').on('change', function() {
        var font = $(this).val();
        if (drawio.editingText) {
            drawio.newElement.restyle('font', font);
            drawCanvas();
            drawio.newElement.render();
        }
        if (drawio.selectedElements.length > 0) restyleSelected('font', font);
    });

    $('#font-style').on('change', function() {
        var style = $(this).val();
        if (drawio.editingText) {
            drawio.newElement.restyle('fontStyle', style);
            drawCanvas();
            drawio.newElement.render();
        }
        if (drawio.selectedElements.length > 0) restyleSelected('fontStyle', style);
    });

    $('#line-width').on('change', function() {
        var px = $(this).val();
        drawio.styles.lineWidth = px;
        if (drawio.selectedElements.length > 0) restyleSelected('lineWidth', px);
    });

    $(".color-input").spectrum({
        replacerClassName: 'color-picker-outer',
        containerClassName: 'color-picker-inner',
        color: "#000000",
        showInput: true,
        showInitial: true,
        showPalette: true,
        palette: drawio.colorPalette
    });
})
