const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

/* ----- Helper functions ----- */
//check if body data has required properties
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body
    if (data[propertyName]) {
      res.locals[propertyName] = data[propertyName]
      return next()
    }
    return next({ status: 400, message: `Must include a ${propertyName}` })
  }
}

//checkforstatus of found order and s

function isEmptyString(value) {
  return typeof value === 'string' && value.trim() === '';
}

//check if order id is the same as order in params 
function orderIdInUrlMatchesOrderIdInBody(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body

  if (id && orderId !== id) {
    return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` })
  }
  next()
}


// verify order has status and that it is valid
function statusPropertyIsValid(req, res, next) {
  const {data: {status} = {} } = req.body
  const VALID_STATUS = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered"
  ]
  if (!VALID_STATUS.includes(status)) {
    return next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
  }
  next()
}

//check if order is delivered
function orderIsDelivered(req, res, next) {
  const order = res.locals.foundOrder
  if (order["status"] === "delivered") {
    next({ status: 400, message: `A delivered order cannot be changed` })
  }
  next();
}



//check if order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId)

  if (foundOrder) {
    res.locals.foundOrder = foundOrder;
    return next()
  }
  return next({ status: 404, message: `order with id ${orderId} does not exist` })
}
//validate properties
function deliverToPropertyIsValid(req, res, next) {
  const deliverTo = res.locals.deliverTo
  if (!deliverTo || isEmptyString(deliverTo)) {
    return next({ status: 400, message: 'Order must include a deliverTo' });
  }
  next();
}

function mobileNumberPropertyIsValid(req, res, next) {
  const mobileNumber = res.locals.mobileNumber
  if (!mobileNumber || isEmptyString(mobileNumber)) {
    return next({ status: 400, message: 'Order must include a mobileNumber' });
  }
  next();
}

function dishesPropertyIsValid(req, res, next) {
  const dishes = res.locals.dishes;
  if (dishes.constructor !== Array || !dishes.length) {
    return next({ status: 400, message: `Order must include at least one dish` })
  }
  next()
}

function dishesQuantityIsValid(req, res, next) {
  const dishes = res.locals.dishes
  dishes.forEach((dish, index) => {
    const quantity = dish.quantity
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      next({ status: 400, message: `dish ${index} must have a quantity that is an integer greater than 0` })
    }
  })
  next()
}

//check if order status is pending
function statusIsPending(req, res, next) {
  const foundOrder = res.locals.foundOrder
  if (foundOrder.status === "pending") {
    return next();
  }
  return next({ status: 400, message: `An order cannot be deleted unless it is pending.` });
}
/* ----- end of helper functions ----- */

//list all orders
function list(req, res,) {
  res.status(200).json({ data: orders })
}

//create new order
function create(req, res) {
  const newOrder = {
    id: nextId(),
    deliverTo: res.locals.deliverTo,
    mobileNumber: res.locals.mobileNumber,
    status: res.locals.status,
    dishes: res.locals.dishes
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}

// read specific order by id 
function readOrderById(req, res) {
  res.status(200).json({ data: res.locals.foundOrder })
}

// update order
function updateOrder(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body

  const foundOrder = res.locals.foundOrder;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.status(200).json({ data: foundOrder })
}

//delete order
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  const deletedOrder = orders.splice(index, 1)
  res.sendStatus(204)
}


module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    deliverToPropertyIsValid,
    mobileNumberPropertyIsValid,
    dishesPropertyIsValid,
    dishesQuantityIsValid,
    create
  ],
  readOrderById: [
    orderExists, readOrderById
  ],
  updateOrder: [
    orderExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    orderIdInUrlMatchesOrderIdInBody,
    orderIsDelivered,
    statusPropertyIsValid,
    deliverToPropertyIsValid,
    mobileNumberPropertyIsValid,
    dishesPropertyIsValid,
    dishesQuantityIsValid,
    updateOrder
  ],
  delete: [
    orderExists,
    statusIsPending,
    destroy
  ]
}