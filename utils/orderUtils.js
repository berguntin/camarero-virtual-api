require('../mongo')

const Order = require('../models/Order')
const MenuItem = require('../models/MenuItem') 


/**
 * Calcula el precio total de un pedido.
 *
 * @param {Object} order - El objeto del pedido.
 * @returns {Promise<string>} Una promesa que se resuelve con el precio total del pedido.
 */
async function calculateTotalPrice(order) {
    const products = order.items;

    // Mapeamos el array de productos a un array de promesas
    const pricePromises = products.map(({ productId, quantity }) => {
        return MenuItem.findById(productId)
            .then(prod => prod.price * quantity)
    });

    // Esperamos a que todas las promesas se resuelvan
    const prices = await Promise.all(pricePromises)
    // Sumamos los precios
    const result = prices.reduce((accum, curr) => accum + curr, 0)

    //devolvemos un numero de precision 2 decimal
    return result.toFixed(2)
}

/**
 * Simula la interacción con la cocina del local, actualizando el estado de un pedido.
 *
 * @param {string} orderID - El ID del pedido a actualizar.
 * @param {string} newStatus - El nuevo estado del pedido.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se actualiza el estado del pedido.
 */
async function updateOrderstatus(orderID, newStatus){

     const updatedOrder = await Order.findByIdAndUpdate( orderID, 
                                                        {status: newStatus},
                                                        {new: true }
                                                        )
}

module.exports = {
                calculateTotalPrice,
                updateOrderstatus
            }
