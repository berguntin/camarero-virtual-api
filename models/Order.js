const {model, Schema} = require('mongoose')

const orderScheme = new Schema({
    table: {
        type: String,
        ref : 'Table',
        required: true
    },
    date: Date,
    status:{
        type: String,
        enum: ['received', 'preparing', 'served', 'canceled', 'payed', 'error']
    },
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

