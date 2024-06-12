const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//helper functions

function postDataHas(propertyName) {
//check if property name is present is req
  return function (req, res, next) {
    const {data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    } 
    return next({status: 400, message: `Must include a ${propertyName}`})
  }
}

//if name or description value is valid
function textPropertyIsValid(text) {

}

function pricePropertyIsValid(price) {

}

function imagePropertyIsValid() {

}

//list all dishes
function list(req, res) {
  res.status(200).json({data: dishes})
}

function create(req, res) {
//create a new dish from req and add it to dishes
}



module.exports = {
  list,

}