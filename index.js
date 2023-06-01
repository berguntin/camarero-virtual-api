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
const { checkCoordinatesInRange } = require('./utils/locationUtils')
const path = require('path');


const app = express()
app.use(express.json())
app.use(cors({
    origin: ['https://camarerodigital.vercel.app','https://camarerodigital.onrender.com', 'http://localhost:8080']
}))

app.get('/', (resquest, response, next) => {
    response.send('Bienvenido a mi api NODEJS')
})

/**
 * Recupera todos los pedidos.
 *
 * @route GET /api/orders
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Array} Un array de objetos JSON que representan los pedidos.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los pedidos.
 */
app.get('/api/orders', (request, response, next) =>{
    Order.find({})
    .then(order =>{
        response.json(order)
    }).catch(error => next(error))
})

/**
 * Recupera los pedidos de una mesa específica.
 *
 * @route GET /api/orders/:tableID
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Array} Un array de objetos JSON que representan los pedidos de la mesa especificada.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los pedidos.
 */
app.get('/api/orders/:tableID', (request, response, next) => {
    const tableID = request.params.tableID
    Order.find({ table: tableID,
                status:{ $nin: ['payed', 'canceled', 'error'] } 
            })
            .then(order => response.json(order))
            .catch(error => next(error))
})
/**
 * Recupera los pedidos pendientes.
 *
 * @route GET /api/orders/pending
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Array} Un array de objetos JSON que representan los pedidos pendientes.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los pedidos.
 */
app.get('/api/orders/pending', (request, response, next) =>{
    Order.find({status: 'recieved'})
    .then(order => {
        response.json(order)
    }).catch(error => next(error))
})
/**
 * Recupera los pedidos en proceso.
 *
 * @route GET /api/orders/processing
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Array} Un array de objetos JSON que representan los pedidos en proceso.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los pedidos.
 */
app.get('/api/orders/processing', (request, response, next) =>{
    Order.find({status:'preparing'})
    .then(order =>{
        response.json(order)
    }).catch(error => next(error))
})
/**
 * Recupera los pedidos servidos.
 *
 * @route GET /api/orders/served
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Array} Un array de objetos JSON que representan los pedidos servidos.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los pedidos.
 */
app.get('/api/orders/served', (request, response, next) =>{
    Order.find({status:'served'})
    .then(order => {
        response.json(order)
    }).catch(error => next(error))
})
/**
 * Recupera un pedido por su ID.
 *
 * @route GET /api/orders/:id
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Array} Un array de objetos JSON que representan la pedido encontrado.
 * @throws {Error} Si ocurre algún error durante la búsqueda del pedido.
 */
app.get('/api/orders/:id', (request, response, next)=>{
    const orderID = request.params.id
    Order.findOne({ _id:orderID })
    .then(order=>{
        response.json(order)
    })
    .catch(error =>{
        next(error)
    })
})


/***** MENU ITEMS GET METHODS*************** */
/**
 * Recupera todos los productos.
 *
 * @route GET /api/products
 * @returns {Array} Un array de objetos JSON que representan los productos.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los productos.
 */
app.get('/api/products', (request, response, next) =>{
    MenuItem.find({})
    .then(item => {
        response.json(item)
    }).catch(error => next(error))
})

/**
 * Recupera las categorías de productos disponibles.
 *
 * @route GET /api/products/categories
 * @returns {Array} Un array de strings que representan las categorías de productos.
 * @throws {Error} Si ocurre algún error durante la búsqueda de las categorías.
 */
app.get('/api/products/categories', (resquest, response, next)=>{
    MenuItem.distinct('category')
    .then(categorie =>{
        response.json(categorie)
    }).catch(error =>
        next(error))
})

/**
 * Recupera los productos de una categoría específica.
 *
 * @route GET /api/products/:category
 * @param {string} category - La categoría de productos para filtrar.
 * @returns {Array} Un array de objetos JSON que representan los productos de la categoría especificada.
 * @throws {Error} Si ocurre algún error durante la búsqueda de los productos.
 */
app.get('/api/products/:category', (request, response, next) =>{
    const {category} = request.params
    MenuItem.find({category: category})
    .then(products =>{
        response.json(products)
    }).catch(error => next(error))
})

/**
 * Recupera las subcategorías de una categoría específica.
 *
 * @route GET /api/products/:category/sub
 * @param {string} category - La categoría de productos para filtrar.
 * @returns {Array} Un array de strings que representan las subcategorías de la categoría especificada.
 * @throws {Error} Si ocurre algún error durante la búsqueda de las subcategorías.
 */
app.get('/api/products/:category/sub', (request, response, next) =>{
    const {category} = request.params
    console.log(request.params)
    MenuItem.find({category: category}).distinct('subCategory')
    .then(sub =>{
        response.json(sub)
    }).catch(error =>{
        next(error)})
})
/**
 * Recupera un producto por su ID.
 *
 * @route GET /api/products/find/:id
 * @param {string} id - El ID del producto a buscar.
 * @returns {Object} Un objeto JSON que representa el producto encontrado.
 * @throws {Error} Si ocurre algún error durante la búsqueda del producto.
 */
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


/********POST METHODS**************** */

/**
 * Genera un token de autenticación para una mesa específica.
 *
 * @route POST /api/token
 * @param {Object} req - La solicitud HTTP.
 * @param {Object} res - La respuesta HTTP.
 * @param {Function} next - La siguiente función de middleware.
 * @returns {Object} Un objeto JSON que contiene el ID de la mesa y el token generado.
 * @throws {Error} Si ocurre algún error durante la generación del token.
 */
app.post('/api/token', async (req, res, next) => {
    const tableID = req.headers.tableid
    const location = req.headers.location
    const {lat, long} = JSON.parse(location)
    //Comprobamos que el cliente este dentro del rango permitido de localizaciones
    const verifyLocation = checkCoordinatesInRange(lat, long)

    if(!tableID){
        return res.status(400).send('Es necesario indicar ID de la mesa')
    }
    if(!verifyLocation){
        return res.status(400).send('Localización no permitida')
    }
    let table
    try{
        table = await Table.findOne( {tableID: tableID} )
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


/**
 * 
 * Guarda un pedido
 *
 * @route POST /api/orders/save
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @returns {Object} Un objeto JSON que representa el pedido guardado.
 * @throws {Error} Si ocurre algún error durante el proceso de guardar el pedido.
 */
app.post('/api/orders/save', async (request, response)=>{
    try {
        //Extraemos el token de la cabecera de la solicitud
        const token = request.headers['authorization'].split(' ')[1]
        const decodedToken = jswtoken.decode(token)
        
        //Validamos el token facilitado
        jswtoken.verify(token, process.env.SECRET_KEY)
        
        const order = new Order({...request.body,
                                table: decodedToken.tableID, //Extraemos la id de mesa del token para evitar manipulaciones
                                status: 'received', 
                                totalPrice: await calculateTotalPrice(request.body)
                                })
    
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
/*** PENDIENTE DE DESARROLLAR ************************/
/* app.post('/api/orders/pay/:tableID', (request, response) => {
    const { tableID } = request.params
    response.json(createPaymentOrder(tableID))
})
*/

/****** MIDDLEWARES **************/
/*
 * Middleware para manejar las rutas no encontradas (Error 404).
 *
 * @param {Object} request - La solicitud HTTP.
 * @param {Object} response - La respuesta HTTP.
 * @returns {void}
 */
app.use((request, response) => {
        response.status(404)
        .send('<h1>Error 404</h1>' + `La pagina ${request.originalUrl} no existe`)
        .end()    
})



const PORT = 3002 || process.env.PORT

app.listen(PORT, ()=>{
    console.log(`server is running on port: ${PORT}`)
})


