const {model, Schema} = require('mongoose')

const itemScheme = new Schema({
    id:String,
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

itemScheme.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const menuItem = model('MenuItem', itemScheme)

module.exports = menuItem