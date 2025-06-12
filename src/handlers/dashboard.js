function customerOptions() {
    return {
        name: 'Customer',
        options: [
            {
                title: 'New Order',
                subtitle: 'Places a new order',
                text: 'Places a new order, or gets your most recent order not marked as completed',
                img: 'imgs/order.jpg',
                onclick: '/order'
            },
            {
                title: 'Your Orders',
                subtitle: 'Shows all your orders',
                text: 'View and open all your orders to date',
                img: 'imgs/orders.jpg',
                onclick: '/orders/my'
            }
        ]
    }
}

function chefOptions() {
    return {
        name: 'Chef',
        options: [
            {
                title: 'Incomplete Suborders',
                subtitle: 'Update suborder status\'',
                text: 'Let customers know the status of their suborders',
                img: 'imgs/cook.jpg',
                onclick: '/suborders'
            }
        ]
    }
}

function adminOptions() {
    return {
        name: 'Admin',
        options: [
            {
                title: 'All Orders',
                subtitle: 'View all orders to date',
                text: 'View all orders ever placed to date by an customer',
                img: 'imgs/complete.jpg',
                onclick: '/orders/all'
            },
            {
                title: 'Grant Permissions',
                subtitle: 'Update user permissions',
                text: 'View and update user permissions',
                img: 'imgs/promotion.jpg',
                onclick: '/admin/userinfo'
            },
            {
                title: 'Add New Items and Tags',
                subtitle: 'Add new food items and tags',
                text: 'View and create food tags, add new food items, and update tags on existing food items',
                img: 'imgs/admin.jpg',
                onclick: '/admin/add'
            }
        ]
    }
}

export async function dashboardHandler(req, res) {
    const auth = req.user.auth

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