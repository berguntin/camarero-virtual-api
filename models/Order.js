const {model, Schema} = require('mongoose')

const orderScheme = new Schema({
    table: String,
    date: Date,
    status: ["recieved", "onCourse", "served", "finished"],
    items : [
        {
            productId: String,
            quantity: Number,
            price: Number
        }
    ],
    totalPrice: Number
})

const Order = model('Order', orderScheme)

module.exports = Order 