var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var triangle = new Schema({
    first_point: Number,
    second_point: Number,
    third_point: Number,
    number: Number
});

module.exports = mongoose.model('triangles', triangle);