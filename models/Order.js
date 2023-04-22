const {model, Schema} = require('mongoose')

const orderScheme = new Schema({
    table: String,
    date: Date,
    state: ["recieved", "onCourse", "served", "finished"],
    items : [],
    totaPrice: Number
})

const Order = model('Order', orderScheme)

module.exports = Order 