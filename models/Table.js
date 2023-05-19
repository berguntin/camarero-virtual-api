const {model, Schema} = require('mongoose')

const tableScheme = new Schema({
    tableID: String,
})

tableScheme.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Table = model('Table' , tableScheme)

module.exports = Table