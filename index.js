require('./mongo')
require('dotenv').config()


const Order = require('./models/Order')
const menuItem = require('./models/MenuItem') 
const express = require('express')
const cors = require('cors')
const { calculateTotalPrice, updateOrderState } = require('./utils/orderUtils')





const app = express()
//app.use(cors())
app.use(express.json())
app.use(cors({
    origin: '*'
}))

app.get('/', (request, response, next) =>{
    response.send("Hola, mundo")
})

app.get('/api/orders', (request, response, next) =>{
    Order.find({})
    .then(order =>{
        response.json(order)
    }).catch(error => next(error))
})

app.get('/api/orders/:tableID', (request, response, next) => {
    const tableID = request.params.tableID
    Order.find({ table: tableID })
            .then(order => response.json(order))
            .catch(error => next(error))
})

app.get('/api/orders/pending', (request, response, next) =>{
    Order.find({state: 'recieved'})
    .then(order => {
        response.json(order)
    }).catch(error => next(error))
})
app.get('/api/orders/processing', (request, response, next) =>{
    Order.find({state:'preparing'})
    .then(order =>{
        response.json(order)
    }).catch(error => next(error))
})
app.get('/api/orders/served', (request, response, next) =>{
    Order.find({state:'served'})
    .then(order => {
        response.json(order)
    }).catch(error => next(error))
})
app.get('/api/orders/:id', (request, response, next)=>{
    const orderID = request.params.id
    Order.find({ _id:orderID })
    .then(order=>{
        response.json(order)
    })
    .catch(error =>{
        next(error)
    })
})

/********** MENU ITEMS GET METHODS*************** */

app.get('/api/products', (request, response, next) =>{
    menuItem.find({})
    .then(item => {
        response.json(item)
    }).catch(error => next(error))
})

app.get('/api/products/categories', (resquest, response, next)=>{
    menuItem.distinct('category')
    .then(categorie =>{
        response.json(categorie)
    }).catch(error =>
        next(error))
})

app.get('/api/products/:category', (request, response, next) =>{
    const {category} = request.params
    menuItem.find({category: category})
    .then(products =>{
        response.json(products)
    }).catch(error => next(error))
})

app.get('/api/products/:category/sub', (request, response, next) =>{
    const {category} = request.params
    console.log(request.params)
    console.log(category)
    menuItem.find({category: category}).distinct('subCategory')
    .then(sub =>{
        response.json(sub)
    }).catch(error =>{
        next(error)})
})
app.get('/api/products/find/:id', (request, response, next) =>{
    const { id } = request.params
    console.log(request.params)
    menuItem.findOne({_id:id})
    .then(prod =>{
        response.json(prod)
    }).catch(error => {
        next(error)
    })
})


/**************POST METHODS**************** */

app.post('/api/orders/save', async (request, response)=>{
    try {
        console.log(request.body)
        const order = new Order({...request.body,
                                status: 'recieved', 
                                totalPrice: await calculateTotalPrice(request.body)
                                })
        console.log(order)
        
        const savedOrder = await order.save()
        response.status(200).send(savedOrder)
        console.log('guardada')

        //Simulamos que la cocina procesa el pedido
        setTimeout(() => updateOrderState(order.id, 'preparing'), 50000)
        setTimeout(() => updateOrderState(order.id, 'served'), 500000)
    } 
    catch (err) {
        console.error('Error saving order:', err);
        if (err.name === 'ValidationError') {
            response.status(400).json({message: err.message});
        } else {
            response.status(500).json({message: 'An unexpected error occurred'});
        }
    }
})

/************* MIDDLEWARES **************/
//Gestion de 404
app.use((error, request, response) => {
        response.status(404)
        .send('<h1>Error 404</h1>' + `La pagina ${request.originalUrl} no existe`)
        .end()    
})

const PORT = 3002

app.listen(PORT, ()=>{
    console.log(`server is running on port: ${PORT}`)
})


