var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coordinates = new Schema({
    abscissa: Number,
    ordinate: Number,
    number: Number
});

module.exports = mongoose.model('points', coordinates);