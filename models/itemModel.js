const {model, Schema} = require('mongoose')

const itemScheme = new Schema({
    _id: String,
    name: String,
    alergens: Date,
    category : String,
    description: String, 
    ingredients: String,
    price: Number
})

const Item = model('Order', orderScheme)

module.exports = Item