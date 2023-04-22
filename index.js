require('./mongo')
require('dotenv').config()

const Order = require('./models/Order')
const menuItem = require('./models/menuItem') 
const mongoose = require('mongoose')
const express = require('express')
//const cors = require('cors')

const app = express()
//app.use(cors())
app.use(express.json())

app.get('/', (request, response) =>{
    response.send("Hola, mundo")
})

app.get('/api/orders', (request, response, next) =>{
    Order.find({})
    .then(order =>{
        response.json(order)
    })
})

app.get('/api/orders/pending', (request, response) =>{
    Order.find({state: 'recieved'})
    .then(order => {
        response.json(order)
    })
})
app.get('/api/orders/processing', (request, response) =>{
    Order.find({state:'onCourse'})
    .then(order =>{
        response.json(order)
    })
})
app.get('/api/orders/served', (request, response) =>{
    Order.find({state:'finished'})
    .then(order => {
        response.json(order)
    })
})
app.get('/api/orders/:id', (request, response)=>{
    const id = request.params
    Order.find({_id:id})
    .then(order=>{
        response.json(order)
    })
})

/********** MENU ITEMS GET METHODS*************** */

app.get('/api/products', (request, response) =>{
    menuItem.find({})
    .then(item => {
        response.json(item)
    })
})


const item = new menuItem ({
    name: "Hamburguesa Vegana",
    alergens: ["Soja", 'leche', 'trigo'],
    vegan: true,
    vegetarian:true,
    category : 'comida',
    subCategory: 'bocadillos',
    description: "Hamburgesa 100% vegana casera", 
    ingredients: ['Pan brioche', 'lechuga', 'tomate', 'cebolla'],
    price: '7.5',
    available: true
})

item.save().then(response =>
    console.log(response)
).catch(error=>{
    console.error(error)
})
/**************POST METHODS**************** */

app.post('/api/orders/save', (resquest, response)=>{
    const order = new Order(request.body)
    order.save()
    .then(order =>{
        response.status(200)
        .send(order)
        .end()
    }).catch( error =>{
        response.status(304)
        .send(error)
        .end()
    })
})

app.use((error,request, response, next) => {
        console.log(error)
        response.status(404)
        .send('<h1>Error 404</h1>' + `La pagina ${request.originalUrl} no existe`)
        .end()    
})

const PORT = 3001
app.listen(PORT, ()=>{
    console.log(`server is running on port: ${PORT}`)
})


