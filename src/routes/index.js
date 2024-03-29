const express = require('express');
const buyerRoute = require('./buyer/index');
const accountRoute = require('./account/index');
const downloadHistory = require('./downloadHistory/index');
const userRoute = require('./user/index');
const ratingRoute = require('./rating/index');

const sellerRoute = require('./seller');
const router = express.Router();

// basic structure: app.METHOD(PATH, HANDLER)
router.use('/buyer', buyerRoute);
router.use('/account', accountRoute);
router.use('/downloadHistory', downloadHistory);
router.use('/user', userRoute);
router.use('/rating', ratingRoute);
router.use('/seller', sellerRoute);

module.exports = router;
