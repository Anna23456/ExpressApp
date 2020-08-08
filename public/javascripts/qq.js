var canvas;
var ctx;
var choice = 1;
var x = "", y = "";
var mode = "";
var numb0 = "", numb1 = "", numb2 = "";
var CELL_SIZE = 100;
var point0 = [200, 300];
var scale = [1, 0];
var radiusPoint = 3;
var Points;
var Trian;
var message;
var btn1;
var $menu = $('#contextMenu');
var $menu_sel = $('#selectMenu');
var $forma_EP = $('#forma-edit-point');
var $forma_CP = $('#forma-create-point');
var $forma_DP = $('#forma-delete-point');
var $forma_CT = $('#forma-create-triangle');
var $forma_DT = $('#forma-delete-triangle');


//localStorage.countSelect = 5;
//localStorage.setItem('valueSelect', JSON.stringify([1,2,3,4,5]));
//localStorage.setItem('nameSelect', JSON.stringify([1,2,3,4,5]));


var value_select;
var name_select;
window.onload = function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    graph(); 
    $menu.hide();
    $menu_sel.hide();
    $forma_EP.hide();
    $forma_CP.hide();
    $forma_DP.hide();
    $forma_CT.hide();
    $forma_DT.hide();
    value_select = JSON.parse(localStorage.getItem("valueSelect"));
    name_select = JSON.parse(localStorage.getItem("nameSelect"));

    for (let i = localStorage.countSelect - 1; i >= 0; i--) {
        $('#select').prepend($('<option>', {
            value: value_select[i],
            text: name_select[i]
        }));
    }
    select.options[0].selected = true;
}

$forma_EP.hide();
$forma_CP.hide();
$forma_DP.hide();
$forma_CT.hide();
$forma_DT.hide();
$menu.hide();
$menu_sel.hide();

const $select = document.getElementById("select");
const $select_new = document.getElementById("select_new");
$select.addEventListener("change", (el, ev) => {
    if ($select.value === "new") {
        let i = Number(value_select[JSON.parse(localStorage.countSelect) - 1]);
        let name = prompt('Как назвать новую триангуляцию?', i + 1)
        if (!(name === null)) {
            var bool = true;
            for (let j = 0; j < JSON.parse(localStorage.countSelect); j++)
                if (name_select[j] == name) {
                    alert('Такое имя уже существует!'); bool = false; break;
                }
                if(bool) {
                    let elem = document.createElement("option");
                    elem.innerText = name;
                    elem.value = i + 1;
                    $select_new.insertAdjacentElement("beforebegin", elem);
                    $select.value = i;
                    name_select.push(name);
                    value_select.push(i + 1);
                    localStorage.countSelect++;
                    localStorage.setItem('valueSelect', JSON.stringify(value_select));
                    localStorage.setItem('nameSelect', JSON.stringify(name_select));
                }
        }
        $('#select option[value='+choice+']').prop('selected', true);
    }
})

$('#delete-select').on('click', function (e) {
    let choicesel = $('#select').val();
    $menu_sel.hide();
    if (confirm('Вы уверены что хотите удалить эту триангуляцию?')) {
        mode = "DEL";
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choicesel, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка!');
            }
        });
        select.options[0].selected = true;
        $('#select option[value='+choicesel+']').remove();
        //let option = document.querySelector('option[value=choicesel]');
        //option.remove();
        for (let i = 0; i < localStorage.countSelect; i++) {
            if (value_select[i] == choicesel) {
                value_select.splice(i, 1);
                name_select.splice(i, 1);
                localStorage.setItem('valueSelect', JSON.stringify(value_select));
                localStorage.setItem('nameSelect', JSON.stringify(name_select));
                localStorage.countSelect--;
                break;
            }
        }
    }
});


$('#rename-select').on('click', function (e) {
    let choicesel =$('#select').val();
    $menu_sel.hide();
    let name = prompt('Как вы хотите переименовать?', choicesel);
    if (!(name === null)) {
        var bool = true;
        for (let j = 0; j < JSON.parse(localStorage.countSelect); j++)
            if (name_select[j] == name) {
                alert('Такое имя уже существует!'); bool = false; break;
            }
        if (bool) {
            for (let i = 0; i < JSON.parse(localStorage.countSelect); i++)
                if (value_select[i] == choicesel) {
                   $('#select option[value='+choicesel+']').text(name);
                    name_select[i] = name;
                    localStorage.setItem('nameSelect', JSON.stringify(name_select));
                    break;
                }

        }
    }
});

document.addEventListener('mousedown', handleMouseDown, false);
document.addEventListener('contextmenu', handleContextMenu, false);

$('#btn-edit-point').on('click', function (e) {
    $menu.hide();
    $forma_EP.show();
});
$('#btn-create-point').on('click', function (e) {
    $menu.hide();
    $forma_CP.show();
});
$('#btn-delete-point').on('click', function (e) {
    $menu.hide();
    $forma_DP.show();
});
$('#btn-create-triangle').on('click', function (e) {
    $menu.hide();
    $forma_CT.show();
});
$('#btn-delete-triangle').on('click', function (e) {
    $menu.hide();
    $forma_DT.show();
});

$('.close').on('click', function (e) {
    $forma_EP.hide();
    $forma_CP.hide();
    $forma_DP.hide();
    $forma_CT.hide();
    $forma_DT.hide();
    $('.numb-point').val("");
    $('.coordX').val("");
    $('.coordY').val("");
});

function handleMouseDown(e) {
    const path = e.path;
    let isContext = false;
    path.map((el, i) => { if (el.id === 'contextMenu' || el.id === 'selectMenu') isContext = true; });
    if (isContext) return;
    $menu.hide();
    $menu_sel.hide();
}

$('#select').contextmenu( function (e) {
    e.preventDefault();
    e.stopPropagation();

    var x = parseInt(e.pageX);
    var y = parseInt(e.pageY);

    $menu_sel.hide();
    $menu.hide();
    $menu_sel.show();
    $menu_sel.css({ left: x, top: y });
    return false;
});

function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    var x = parseInt(e.pageX);
    var y = parseInt(e.pageY);

    $menu.hide();
    $menu_sel.hide();

    showContextMenu(x, y);
    return (false);
}


 function showContextMenu(x, y) {
    $menu.show();
    $menu.css({ left: x, top: y });
}
function coordinates() {
    var xCoord = [];
    var yCoord = [];

    xCoord[0] = ((0 - point0[0]) * scale[0]) / CELL_SIZE;
    for (var i = 1; i < canvas.width/100; i++) {
        xCoord[i] = -(-xCoord[i - 1] - scale[0]).toFixed(1);    
    }

    yCoord[0] = -(((100 - point0[1]) * scale[0]) / CELL_SIZE)
    for (var i = 1; i < canvas.height/100; i++) {
        yCoord[i] = -(scale[0] - yCoord[i - 1]).toFixed(1);
    }

    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.font = "16px Verdana";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    var j = 0;
    for (var i = 5; i < canvas.width; i += CELL_SIZE) {
        ctx.fillText(xCoord[j], i, 0);
        j++;
    }

    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.font = "16px Verdana";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    j = 0;
    for(var i = 105; i < canvas.height; i += CELL_SIZE) {
        ctx.fillText(yCoord[j], 1100, i);
        j++;
    }
}

function graph() {
    coordinates();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    for (var i = 0; i <= canvas.width; i += CELL_SIZE) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    for (var i = 0; i <= canvas.height; i += CELL_SIZE) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.moveTo(0, point0[1]);
    ctx.lineTo(canvas.width, point0[1]);
    ctx.moveTo(point0[0], 0);
    ctx.lineTo(point0[0], canvas.width);
    ctx.stroke();
    ctx.closePath();
    draw(Points, Trian);
} 

function rightX(x) { //координаты которые исользуются для построения 
    return -(((-x * CELL_SIZE) / scale[0]) - point0[0]);
}

function rightY(y) {
    return -(((y * CELL_SIZE) / scale[0]) - point0[1]);
}

function fixedX(x) { //координаты относительно координатного поля
    return (((x - point0[0])* scale[0]) / CELL_SIZE).toFixed(3);
}

function fixedY(y) {
    return -(((y - point0[1]) * scale[0]) / CELL_SIZE).toFixed(3);
}


function getCoordinates(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    x = fixedX(x);
    y = fixedY(y);
    document.getElementById('xycoordinates').innerHTML = "(" + x + "; " + y + ")";
}

function clearCoordinates() {
    document.getElementById('xycoordinates').innerHTML = "";
}


function changeScale(zoom) {
     if (zoom > 0) {
        if (scale[0] == 0.1) {
            return;
        }
        if (scale[1] == 0) {
            scale[0] /= 2.0;
            point0[0] *= 2;
            point0[1] *= 2;
            scale[1] = 2;
            radiusPoint++;
        } else if (scale[1] == 1) {
            scale[0] /= 2.0;
            point0[0] *= 2;
            point0[1] *= 2;
            scale[1] = 0;
            radiusPoint++;
        } else {
            scale[0] = (0.4 * scale[0]).toFixed(3);
            point0[0] = (2.5 * point0[0]).toFixed(0);
            point0[1] = (2.5 * point0[1]).toFixed(0);
            scale[1] = 1;
            radiusPoint++;
        } 
     } else {
        if (scale[0] == 10) {
            return;
        }
        if (scale[1] == 0) {
            scale[0] *= 2;
            point0[0] = (point0[0] / 2.0).toFixed(0);
            point0[1] = (point0[1] / 2.0).toFixed(0);
            scale[1] = 1;
            radiusPoint--;
            
        } else if (scale[1] == 1) {
            scale[0] *= 2.5;
            point0[0] = (point0[0] * 0.4).toFixed(0);
            point0[1] = (point0[1] * 0.4).toFixed(0);
            scale[1] = 2;
            radiusPoint--;
        } else {
            scale[0] *= 2;
            point0[0] = (point0[0] / 2.0).toFixed(0);
            point0[1] = (point0[1] / 2.0).toFixed(0);
            scale[1] = 0;
            radiusPoint--;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    graph();
}

function changeCenter(code) {
    var changePos = [0, 0];
    switch (code) {
        case 0:
            changePos[1] = -CELL_SIZE;
            break;
        case 1:
            changePos[0] = CELL_SIZE;
            break;
        case 2:
            changePos[1] = CELL_SIZE;
            break;
        case 3:
            changePos[0] = -CELL_SIZE;
            break;
        case -1:
            changePos[0] = 0;
            changePos[1] = 0;
            point0[0] = 200;
            point0[1] = 300;
            scale[0] = 1;
            radiusPoint = 3;
            break;
    }
    point0[0] -= -changePos[0];
    point0[1] -= -changePos[1];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    graph();
}



function draw(points, triangles) {
    Points = points;
    Trian = triangles;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    for (var i = 0; i < triangles.length; i++) {
        var first = triangles[i].first_point;
        var second = triangles[i].second_point;
        var third = triangles[i].third_point;
        ctx.moveTo(rightX(points[first].abscissa), rightY(points[first].ordinate));
        ctx.lineTo(rightX(points[second].abscissa), rightY(points[second].ordinate));
        ctx.lineTo(rightX(points[third].abscissa), rightY(points[third].ordinate));
        ctx.lineTo(rightX(points[first].abscissa), rightY(points[first].ordinate));
    }
    ctx.stroke();

    for (var i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(rightX(points[i].abscissa), rightY(points[i].ordinate), radiusPoint, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.font = "bold 10px Verdana";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillStyle = 'white';
        ctx.fillText(i, rightX(points[i].abscissa) - 7, rightY(points[i].ordinate));
        ctx.closePath();
    }

}

function forma_edit_value(numb) {
    if (numb < 0 || numb > Points.length-1) {
        $('#x-edit-point').val("");
        $('#y-edit-point').val("");
    } else {
        $('#x-edit-point').val(Points[numb].abscissa);
        $('#y-edit-point').val(Points[numb].ordinate);
    }
}

$("#submit").click(function () {
    mode = "";
    choice = $('#select').val();
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choice, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка!');
            }
        });
})
$("#submit-create-point").click(function (e) {
    e.preventDefault();
    x = $('#x-create-point').val();
    y = $('#y-create-point').val();
    mode = "CP";
    if (x != "" && y != "") {
        $forma_CP.hide();
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choice, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                if (message != "") alert(message);
                $('.coordX').val("");
                $('.coordY').val("");
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка!');
            }
        });
    } else
        alert('Вы ввели не все данные!');
})
$('#submit-delete-point').click(function (e) {
    e.preventDefault();
    numb0 = $('#delete-point').val();
    mode = 'DP';
    if (numb0 != "" && numb0 >= 0) {
        $forma_DP.hide();
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choice, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                if (message != "") alert(message);
                $('.numb-point').val("");
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка.');
            }
        });
    } else if (numb0 < 0)
        alert('Номер должен быть положительным!');
    else
        alert('Вы ничего не ввели!');
})
$('#submit-edit-point').click(function (e) {
    e.preventDefault();
    numb0 = $("#numb-edit-point").val();
    x = $("#x-edit-point").val();
    y = $("#y-edit-point").val(); 
    mode = 'EP';
    if (x != "" && y != "" && numb0 != "" && numb0 >= 0) {
        $forma_EP.hide();
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choice, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                if (message != "") alert(message);
                $('.numb-point').val("");
                $('.coordX').val("");
                $('.coordY').val("");
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка');
            }
        });
    } else
        alert('Некорректные данные');
})
$("#submit-create-triangle").click(function (e) {
    e.preventDefault();
    numb0 = $("#numb0-create").val();
    numb1 = $("#numb1-create").val();
    numb2 = $("#numb2-create").val();
    mode = "CT";
    if ((numb0 != "" && numb1 != "" && numb2 != "") && (numb0 != numb1 && numb1 != numb2 && numb0 != numb2) && (numb0 >=0 && numb1 >=0 && numb2 >=0)) {
        $forma_CT.hide();
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choice, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                if (message != "") alert(message);
                $('.numb-point').val("");
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка!');
            }
        });
    } else
        alert('Проверьте правильность введенных данных!');
})
$("#submit-delete-triangle").click(function (e) {
    e.preventDefault();
    numb0 = $("#numb0-delete").val();
    numb1 = $("#numb1-delete").val();
    numb2 = $("#numb2-delete").val();
    mode = "DT";
    if ((numb0 != "" && numb1 != "" && numb2 != "") && (numb0 != numb1 && numb1 != numb2 && numb0 != numb2) && (numb0 >= 0 && numb1 >= 0 && numb2 >= 0)) {
        $forma_DT.hide();
        $.ajax({
            type: "POST",
            url: "/",
            data: { choice: choice, x: x, y: y, mode: mode, numb0: numb0, numb1: numb1, numb2: numb2 },
            success: function (res) {
                Points = res.coord;
                Trian = res.trian;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                point0[0] = 200;
                point0[1] = 300;
                scale[0] = 1;
                radiusPoint = 3;
                graph();
                message = res.message;
                if (message != "") alert(message);
                $('.numb-point').val("");
                message = "";
            },
            error: function (xhr, str) {
                alert('Возникла ошибка!');
            }
        });
    } else
        alert('Проверьте правильность введенных данных!');
})