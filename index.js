require('./mongo')
require('dotenv').config()

const jswtoken = require('jsonwebtoken')
const Order = require('./models/Order')
const MenuItem = require('./models/MenuItem') 
const Table = require('./models/Table')

const express = require('express')
const cors = require('cors')
const { calculateTotalPrice, updateOrderstatus } = require('./utils/orderUtils')
const { createPaymentOrder } = require('./utils/paymentUtils')



const app = express()
app.use(express.json())
app.use(cors({
    origin: ['https://camarerodigital.onrender.com/', 'http://localhost:8080']
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
    Order.find({ table: tableID,
                status:{ $nin: ['payed', 'canceled', 'error'] } 
            })
            .then(order => response.json(order))
            .catch(error => next(error))
})

app.get('/api/orders/pending', (request, response, next) =>{
    Order.find({status: 'recieved'})
    .then(order => {
        response.json(order)
    }).catch(error => next(error))
})
app.get('/api/orders/processing', (request, response, next) =>{
    Order.find({status:'preparing'})
    .then(order =>{
        response.json(order)
    }).catch(error => next(error))
})
app.get('/api/orders/served', (request, response, next) =>{
    Order.find({status:'served'})
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
 * Enviamos una cookie en la respuesta al cliente
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
        const decodedToken = jswtoken.decode(token)
        
        //Validamos el token facilitado
        jswtoken.verify(token, process.env.SECRET_KEY)
        
        const order = new Order({...request.body,
                                table: decodedToken.tableID, //Extraemos la id del token para evitar manipulaciones
                                status: 'received', 
                                totalPrice: await calculateTotalPrice(request.body)
                                })
        console.log(order)
        
        const savedOrder = await order.save()
        response.status(200).send(savedOrder)

        //Simulamos que la cocina procesa el pedido
        setTimeout(() => updateOrderstatus(order.id, 'preparing'), 50000) //0,83min
        setTimeout(() => updateOrderstatus(order.id, 'served'), 300000) //5min
        //Simulamos el proceso de pago. En el futuro se implementará
        setTimeout(() => updateOrderstatus(order.id, 'payed'), 500000 )//8,33min
        
    } 
    catch (err) {

        console.error('Error saving order:', err.name);

        if (err.name === 'ValidationError') {
            response.status(400).json({errcode: 400, message: 'El pedido no es valido'});
        }
        //el token ha caducado...
        else if(err.name === 'TokenExpiredError' || err.name === 'InvalidToken'){
            response.status(401).json({errcode: 401, message: 'Tu token ha caducado'})
        }
        else {
            response.status(500).json({errcode: 500, message: 'Error inesperado'});
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


