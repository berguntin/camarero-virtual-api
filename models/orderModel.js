const {model, Schema} = require('mongoose')

const orderScheme = new Schema({
    _id: String,
    table: String,
    date: Date,
    State: ["recieved", "onCourse", "served", "finished"],
    items : []
})

const Order = model('Order', orderScheme)

module.exports = Order