require('./mongo')
require('dotenv').config()

const jswtoken = require('jsonwebtoken')
const Order = require('./models/Order')
const MenuItem = require('./models/MenuItem') 
const Table = require('./models/Table')

const express = require('express')
const cors = require('cors')
const { calculateTotalPrice, updateOrderState } = require('./utils/orderUtils')
const { createPaymentOrder } = require('./utils/paymentUtils')



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
    MenuItem.find({})
    .then(item => {
        response.json(item)
    }).catch(error => next(error))
})

app.get('/api/products/categories', (resquest, response, next)=>{
    MenuItem.distinct('category')
    .then(categorie =>{
        response.json(categorie)
    }).catch(error =>
        next(error))
})

app.get('/api/products/:category', (request, response, next) =>{
    const {category} = request.params
    MenuItem.find({category: category})
    .then(products =>{
        response.json(products)
    }).catch(error => next(error))
})

app.get('/api/products/:category/sub', (request, response, next) =>{
    const {category} = request.params
    console.log(request.params)
    console.log(category)
    MenuItem.find({category: category}).distinct('subCategory')
    .then(sub =>{
        response.json(sub)
    }).catch(error =>{
        next(error)})
})
app.get('/api/products/find/:id', (request, response, next) =>{
    const { id } = request.params
    console.log(request.params)
    MenuItem.findOne({_id:id})
    .then(prod =>{
        response.json(prod)
    }).catch(error => {
        next(error)
    })
})


/**************POST METHODS**************** */

/** Gestionamos un token tras validar que la mesa existe 
 * Usaremos el token en futuras solicitures
 ***/
app.post('/api/token', async (req, res, next) => {
    const tableID = req.headers.tableid
    
    if(!tableID){
        return res.status(400).send('Table ID required')
    }

    let table

    try{

        table = await Table.findOne( {tableID: tableID} )
        console.log(table)
        if(!table){
            res.status(400).send('No existe la mesa indicada: '+tableID).end()
        }
        else{
            const token = jswtoken.sign(
                                { tableID },
                                process.env.SECRET_KEY, 
                                { expiresIn: '2h'})
        
            res.status(200).json( { tableID, token })
        }
    }
    catch(error) {
        next(error)
    }
        
})



app.post('/api/orders/save', async (request, response)=>{
    try {
        console.log(request.body)
        //Extraemos el token de la cabecera de la solicitud
        const token = request.headers['authorization'].split(' ')[1]
        //Validamos el token facilitado
        jswtoken.verify(token, process.env.SECRET_KEY)
        
        const order = new Order({...request.body,
                                status: 'received', 
                                totalPrice: await calculateTotalPrice(request.body)
                                })
        console.log(order)
        
        const savedOrder = await order.save()
        response.status(200).send(savedOrder)

        //Simulamos que la cocina procesa el pedido
        setTimeout(() => updateOrderState(order.id, 'preparing'), 50000)
        setTimeout(() => updateOrderState(order.id, 'served'), 500000)
        
    } 
    catch (err) {

        console.error('Error saving order:', err);

        if (err.name === 'ValidationError') {
            response.status(400).json({errcode: 400, message: err.message});
        }
        //el token ha caducado...
        else if(err.name === 'TokenExpiredError'){
            response.status(401).json({errcode: 401, message: 'Expired token'})
        }
        else {
            response.status(500).json({errcode: 500, message: 'An unexpected error occurred'});
        }
    }
})
/********** PENDIENTE DE DESARROLLAR ************************/
/* app.post('/api/orders/pay/:tableID', (request, response) => {
    const { tableID } = request.params
    response.json(createPaymentOrder(tableID))
})
*/

/************* MIDDLEWARES **************/
//Gestion de 404
app.use((request, response) => {
        response.status(404)
        .send('<h1>Error 404</h1>' + `La pagina ${request.originalUrl} no existe`)
        .end()    
})



const PORT = 3002 || process.env.PORT

app.listen(PORT, ()=>{
    console.log(`server is running on port: ${PORT}`)
})


