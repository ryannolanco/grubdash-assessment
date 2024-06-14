const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const { json } = require("express");

// TODO: Implement the /dishes handlers needed to make the tests pass

/* ----- helper functions ----- */

function isEmptyString(value) {
  return typeof value === 'string' && value.trim() === '';
}

function bodyDataHas(propertyName) {
  //check if property name is present is req
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      res.locals[propertyName] = data[propertyName]
      return next();
    }
    return next({ status: 400, message: `Must include a ${propertyName}` })
  }
}

function namePropertyIsValid(req, res, next) {
  const name = res.locals.name
  
  if (!name || isEmptyString(name)) {
    return next({ status: 400, message: 'Name property must not be an empty string' });
  }
  next();
}

function descriptionPropertyIsValid(req, res, next) {
  const description = res.locals.description;
 
  if (!description || isEmptyString(description)) {
    return next({ status: 400, message: 'Description property must not be an empty string' });
  }
  next();
}

function imageUrlPropertyIsValid(req, res, next) {
  const image_url = res.locals.image_url

  if (!image_url || isEmptyString(image_url)) {
    return next({ status: 400, message: 'Image URL property must not be an empty string' });
  }
  next();
}

function pricePropertyIsValid(req, res, next) {
  const price= res.locals.price;

  if (typeof price !== 'number' || !Number.isInteger(price)) {
    return next({ status: 400, message: `price must be a valid integer` });
  }
  if (price <= 0) {
    return next({ status: 400, message: `price ${price} must be greater than 0` });
  }

  next()
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.foundDish = foundDish
    return next()
  }
  return next({ status: 404, message: `Dish does not exist: ${dishId}` })
}

function dishIdInUrlMatchesDishIdInBody(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body

  if (id && dishId !== id) {
    return next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` })
  }
  next()
}

/* ----- end of helper functions ----- */





//list all dishes
function list(req, res) {
  res.status(200).json({ data: dishes })
}


function create(req, res) {
  //create a new dish from req and add it to dishes
  const newDish = {
    id: nextId(),
    name: res.locals.name,
    description: res.locals.description,
    price: res.locals.price,
    image_url: res.locals.image_url
  }
  dishes.push(newDish)
  res.status(201).json({ data: newDish })
}


//read a specific dish
function readDishById(req, res, next) {
  res.status(200).json({ data: res.locals.foundDish })
}

//update dish by id
function updateDish(req, res) {
  const { data: { name, description, image_url, price } = {} } = req.body
  const foundDish = res.locals.foundDish;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.image_url = image_url;
  foundDish.price = price;

  res.status(200).json({ data: foundDish })
}



module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    namePropertyIsValid,
    descriptionPropertyIsValid,
    imageUrlPropertyIsValid,
    pricePropertyIsValid,
    create
  ],
  readDishById: [
    dishExists,
    readDishById
  ],
  updateDish: [
    dishExists,
    dishIdInUrlMatchesDishIdInBody,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    namePropertyIsValid,
    descriptionPropertyIsValid,
    imageUrlPropertyIsValid,
    pricePropertyIsValid,
    updateDish
  ]
}