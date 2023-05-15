const {model, Schema} = require('mongoose')


const allergensList = [
    "Lácteos",
    "Huevos",
    "Pescado",
    "Mariscos",
    "Frutos secos",
    "Trigo",
    "Soja",
    "Apio",
    "Mostaza",
    "Sulfitos"
  ];

const itemScheme = new Schema({
    id:String,
    name: String,
    allergens: {
        type : [{type: String,
             enum: allergensList,
            default: []
        }]
    },
    vegan:Boolean,
    vegetarian:Boolean,
    category : {
        type: String,
        required: true,
        enum : ['Bebidas', 'Entrantes', 'Platos principales', 'Postres', 'Cafés e infusiones']
    },
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