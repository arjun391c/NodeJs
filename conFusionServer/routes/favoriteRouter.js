const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .get(authenticate.verifyUser, (req, res, next)=> {
    var userId = req.decoded._id;

    Favorites
      .findOne({
        postedBy: userId
      })
      .populate('postedBy dishes')
      .exec(function (err, favorite) {
        if (err) throw err;

        res.json(favorite);
      });
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    var userId = req.decoded._id;

    Favorites
      .findOneAndUpdate({
        postedBy: userId
      }, {
        $addToSet: {
          dishes: req.body
        }
      }, {
        upsert: true,
        new: true
      }, function (err, favorite) {
        if (err) throw err;

        res.json(favorite);
      });
  })
  .delete(authenticate.verifyUser,(req, res, next) =>{
    var userId = req.decoded._id;

    Favorites
      .findOneAndRemove({
        postedBy: userId
      }, function (err, resp) {
        if (err) throw err;
        res.json(resp);
      });
  });

favoriteRouter.route('/:dishId')
  .delete(authenticate.verifyUser, (req, res, next) =>{
    var userId = req.decoded._id;

    Favorites.findOneAndUpdate({
      postedBy: userId
    }, {
      $pull: {
        dishes: req.params.dishId
      }
    }, {
      new: true
    }, function (err, favorite) {
      if (err) throw err;

      res.json(favorite);
    });
  });

module.exports = favoriteRouter;