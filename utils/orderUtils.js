require('../mongo')

const Order = require('../models/Order')
const MenuItem = require('../models/MenuItem') 



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

//Funcion que simula la interaccion con la cocina del local, actualizando el estado del pedido
async function updateOrderState(orderID, newStatus){

     const updatedOrder = await Order.findByIdAndUpdate( orderID, 
                                                        {status: newStatus},
                                                        {new: true }
                                                        )

     /* console.log(updatedOrder) */

}

module.exports = {
                calculateTotalPrice,
                updateOrderState
            }
