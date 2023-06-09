require('../mongo')

const Order = require('../models/Order')
const MenuItem = require('../models/MenuItem') 
const Payment = require('../models/PayOrder')
const { calculateTotalPrice, updateOrderState } = require('./orderUtils')

/**
 * Crea una orden de pago para una mesa específica.
 *
 * @param {string} tableID - El ID de la mesa.
 * @returns {Promise<Object>} Una promesa que se resuelve con la orden de pago creada.
 */
async function createPaymentOrder(tableID) {
    //recuperamos los pedidos pendientes de pago
    const pendingOrders = await Order.find({   
        table: tableID,
        status:  { $nin: ['payed', 'canceled', 'error']}
    })
    //calculamos el total de la suma de los pedidos
    const totalAmount = pendingOrders.reduce((accum, current) => accum + current.totalPrice, 0).toFixed(2);
    //creamos un array para guardar los productos mapeados
    let items = []
    //mapeamos los productos, agregando el id de la order de la que salen
    for(let order of pendingOrders) {
        let products = order.items.map(product => ({...product.toObject(), fromOrderId: order._id}));
        items.push(...products);
    }
    
    const payment = new Payment({
        table: tableID,
        date: new Date(),
        status: 'pending',
        items: items,
        totalAmount
    })
    //guardamos la orden de pago
    const savedPayment = await payment.save()

    return savedPayment
}



module.exports = { createPaymentOrder }