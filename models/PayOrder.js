const { model, Schema } = require('mongoose')

const payOrderScheme = new Schema({
    table: String,
    date: Date,
    status: {
        type: String,
        enum: ['pending', 'payed', 'cancelled', 'error']
    },
    items: {
        type: [
            {
                productId: String,
                name: String,
                quantity: Number,
                total: Number
            }
        ]
    },
    totalAmount: Number
})

payOrderScheme.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Payment = model('Payment', payOrderScheme)

module.exports = Payment