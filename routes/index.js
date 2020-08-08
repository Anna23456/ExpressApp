'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
mongoose.set('useFindAndModify', false);


var points = require('../collections/points');
var triangles = require('../collections/triangles');

var coord;
var choice = 1;
points.findOne({}, null, { sort: { number: 1 } }, function (err, rez) { choice = rez.number; });
var x = "";
var y = "";
var mode = "";
var numb0 = "", numb1 = "", numb2 = "";
var message = "";

router.post('/', function (req, res) {
    (async () => {
    choice = +req.body.choice;
    mode = req.body.mode;
    x = +req.body.x;
    y = +req.body.y;
    numb0 = +req.body.numb0;
    numb1 = +req.body.numb1;
    numb2 = +req.body.numb2;
    message = "";
        var count;

        await points.count({ number: choice }, function (er, rez) {
            count = rez;
        });

        switch (mode) {
            case "CP":
                await points.find({ abscissa: x, ordinate: y, number: choice }, function (err, rez) {
                    if (rez.length == 0) {
                        x = +req.body.x;
                        y = +req.body.y;
                        var Point = mongoose.model('points');
                        var point = new Point({
                            abscissa: x,
                            ordinate: y,
                            number: choice
                        });
                        point.save();
                        console.log('Точка создана!');
                    }
                    else {
                        message = 'Такая точка уже существует';
                    };

                });
                break;
            case "DP":
                numb0 = +req.body.numb0;
                
                if (count > numb0) {
                    
                   await points.findOne({ number: choice }, null, { sort: { _id: 1 }, skip: numb0 }, function (err, rez) {
                        var id = rez._id;
                        
                        points.findByIdAndRemove({ _id: id }, function (errr, rrr) { });
                    });
                    
                            triangles.remove({
                                $and: [{
                                    $or: [
                                        { first_point: { $eq: numb0 } },
                                        { second_point: { $eq: numb0 } },
                                        { third_point: { $eq: numb0 } }
                                    ]},
                                { number: choice }
                                ]
                            }, function (errrr, rs) {});

                            triangles.updateMany({
                                $and: [
                                    { first_point: { $gt: numb0 } },
                                    { number: choice }
                                ]
                            }, { $inc: { first_point: -1 } }, function (errrr, res) {  });

                            triangles.updateMany({
                                $and: [
                                    { second_point: { $gt: numb0 } },
                                    { number: choice }
                                ]
                            }, { $inc: { second_point: -1 } }, function (errrr, res) { });

                            triangles.updateMany({
                                $and: [
                                    { third_point: { $gt: numb0 } },
                                    { number: choice }
                                ]
                            }, { $inc: { third_point: -1 } }, function (errrr, res) { });

                        
                        console.log('Точка удалена!');
                    
                } else
                    message = 'Указанной точки не существует';
             break;
            case "EP":
                    numb0 = +req.body.numb0;
                    x = +req.body.x;
                    y = +req.body.y;
                    if (count > numb0) {
                        var id;
                        console.log(numb0 + " x: " + x + " y: " + y);
                        await points.findOne({ number: choice }, null, { sort: { _id: 1 }, skip: numb0 }, function (err, rez) {
                            id = rez._id;
                         });
                          await points.find({ abscissa: x, ordinate: y, number: choice }, function (err, rez) {
                               if (rez.length == 0) {
                                   numb0 = +req.body.numb0;
                                   x = +req.body.x;
                                   y = +req.body.y;
                                    points.findByIdAndUpdate({ _id: id }, { $set: { abscissa: x, ordinate: y } }, function (errr, res) { });
                                    console.log('Точка изменена!');
                                } else 
                                    message = 'Точка с такими координатами уже существует';
                                
                            });
                        
                    } else 
                        message = 'Указанной точки не существует';
                break;
            case "CT":
                if (count > numb0 && count > numb1 && count > numb2) {

                        triangles.find({
                            $and: [
                                { first_point: { $in: [numb0, numb1, numb2] } },
                                { second_point: { $in: [numb0, numb1, numb2] } },
                                { third_point: { $in: [numb0, numb1, numb2] } },
                                { number: choice }
                            ]
                        }, function (err, rez) {
                                numb0 = +req.body.numb0;
                                numb1 = +req.body.numb1;
                                numb2 = +req.body.numb2;
                                if (rez.length == 0) {
                                    console.log(numb0);
                                var Triangle = mongoose.model('triangles');
                                var triangle = new Triangle({
                                    first_point: numb0,
                                    second_point: numb1,
                                    third_point: numb2,
                                    number: choice
                                });
                                triangle.save();
                                console.log('Треугольник создан!');
                            } else {
                                message = 'Такой треугольник уже существует';
                            }
                        });

                    } else {
                        message = 'Одной или нескольких из указанных точек не существует!';
                    }
                break;
            case "DT":
                    numb0 = +req.body.numb0;
                    numb1 = +req.body.numb1;
                    numb2 = +req.body.numb2;
                    console.log(count);
                    if (count > numb0 && count > numb1 && count > numb2) {
                        triangles.findOne({
                            $and: [
                                { first_point: { $in: [numb0, numb1, numb2] } },
                                { second_point: { $in: [numb0, numb1, numb2] } },
                                { third_point: { $in: [numb0, numb1, numb2] } },
                                { number: choice }
                            ]
                        }, function (err, rez) {
                            if (rez === null) {
                                message = 'Такой треугольник не существует!';
                            } else {
                                var id = rez._id;
                                triangles.findOneAndRemove({ _id: id, number: choice }, function (errr, res) { });
                                console.log('Треугольник удален!');
                            }
                        });
                    } else {
                        message = 'Одной или нескольких из указанных точек не существует!';
                    }
                break;
            case "DEL":
                points.remove({ number: choice }, function (er, rez) { });
                triangles.remove({ number: choice }, function (er, rez) { });
                await points.findOne({}, null, { sort: { number: 1 } }, function (err, rez) { choice = rez.number; });
                break;
        };


        x = "";
        y = "";
        numb0 = "";
        numb1 = "";
        numb2 = "";

        await points.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
            if (!rez) { console.log("Error!", err); }
            else {
                coord = rez;
            };
        });
        triangles.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
            if (!rez) { console.log("Error!", err); }
            else {
                res.send({ 'coord': coord, 'trian': rez, 'message': message });
            };
        });

    })();

})

router.get('/', function (req, res) {

    points.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
        if (!rez) { console.log("Error!", err); }
        else {
            coord = rez;
        };
    });

    triangles.find({ number: choice }, null, { sort: { _id: 1 } }, function (err, rez) {
        if (!rez) { console.log("Error!", err); }
        else {
            res.render('index', {
                coord: coord,
                trian: rez
            });
        };
    });


    /*  var Point = mongoose.model('points');
  
      var instream = fs.createReadStream('points5.pnt');
      var outstream = new stream();
      var rl = readline.createInterface(instream, outstream);
      var str = [];
  
      rl.on('line', function (line) {
          str = line.split(' ');
          var point = new Point({
              abscissa: str[0],
              ordinate: str[1],
              number: 5
          });
          point.save();
          console.log('Done!');
      });
     */

    /* var Triangle = mongoose.model('triangles');
 
     var instream = fs.createReadStream('triangles5.trg');
     var outstream = new stream();
     var rl = readline.createInterface(instream, outstream);
     var str = [];
 
     rl.on('line', function (line) {
        str = line.split(' ');
        var triangle = new Triangle({
            first_point: str[0],
            second_point: str[1],
            third_point: str[2],
            number: 5
         });
         triangle.save();
         console.log('Done!');
     });
     */
});

module.exports = router;
