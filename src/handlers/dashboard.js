//load

function createOption(title, subtitle, text, img) {
    return {
        title: title,
        subtitle: subtitle,
        text: text,
        img: img,
    }
}

function customerOptions() {
    const options = []

    options.push(createOption('New Order', 'Place a new order', 'Place a new order and add items!', 'imgs/menu.jpg'))
    options.push(createOption('Join an Order', 'Add to an existing order', 'Add foods to an existing order!', 'imgs/order.jpg'))
    options.push(createOption('All Your Orders', 'All your orders', 'Get all your existing orders to date.', 'imgs/orders.jpg'))
    options.push(createOption('Pay for Order', 'Pay for an order', 'Pay for an order (as long as you know the ID).', 'imgs/orders.jpg'))

    return {
        name: 'Customer',
        options: options
    }
}

function chefOptions() {
    const options = []

    options.push(createOption('Process Suborders', 'Update order states', 'Let customers know the state of their orders!', 'imgs/cook.jpg'))

    return {
        name: 'Chef',
        options: options
    }
}

function adminOptions() {
    const options = []

    options.push(createOption('Promote Chef', 'Promote a user to a chef', 'Add a new chef to the team!', 'imgs/promotion.jpg'))
    options.push(createOption('Promote Admin', 'Promote a user to an admin', 'Add a new admin to the team!', 'imgs/promotion.jpg'))

    options.push(createOption('Force Complete', 'Mark an order completed', 'Complete an order forcefully in required situations.', 'imgs/orders.jpg'))

    options.push(createOption('Add New Items', 'Add a new dish or tag!', 'Make your menu more flavourful with new items!', 'imgs/order.jpg'))

    return {
        name: 'Admin',
        options: options
    }
}

export async function dashboardHandler(req, res) {
    const user = req.user
    const auth = user.auth

    const options = []

    if ((auth & 1) === 1)
        options.push(customerOptions())
    if((auth & 2) === 2)
        options.push(chefOptions())
    if((auth & 4) === 4)
        options.push(adminOptions())

    return res.render('dashboard', {
        options: options
    })
}