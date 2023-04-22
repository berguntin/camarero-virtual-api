const {model, Schema} = require('mongoose')

const itemScheme = new Schema({
    name: String,
    alergens: Array,
    vegan:Boolean,
    vegetarian:Boolean,
    category : String,
    subCategory: String,
    description: String, 
    ingredients: [],
    price: String,
    available: Boolean
})

const menuItem = model('MenuItem', itemScheme)

module.exports = menuItem