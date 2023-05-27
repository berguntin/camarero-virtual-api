const {model, Schema} = require('mongoose')


const allergensList = [
    "Gluten",
    "Crustáceos",
    "Huevo",
    "Cacahuetes",
    "Soja",
    "Pescado",
    "Lactosa",
    "Nueces",
    "Apio",
    "Mostaza",
    "Sésamo",
    "Moluscos"
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

const MenuItem = model('MenuItem', itemScheme)

module.exports = MenuItem