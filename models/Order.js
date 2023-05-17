const {model, Schema} = require('mongoose')

const orderScheme = new Schema({
    table: String,
    date: Date,
    status: String,
    items: {
        type: [
            {
                productId: String,
                name: String,
                quantity: Number,
            }
        ],
        validate: [arrayLimit, 'El pedido debe contener al menos un artículo.']
    },
    totalPrice: Number
});

function arrayLimit(val) {
    return val.length > 0;
}

orderScheme.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Order = model('Order', orderScheme)

module.exports = Order 

