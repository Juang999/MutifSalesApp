var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var {middleware} = require('express-http-context');
const fileUpload = require('express-fileupload');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(middleware);
app.use(fileUpload());

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// routes for staff
app.use('/staff/auth', require('./routes/Staff/auth'));
app.use('/staff/partner', require('./routes/Staff/partner'));
app.use('/staff/sales-quotation', require('./routes/Staff/sales-quotation'));

// routes for client
app.use('/client/sales', require('./routes/Client/sales'));
app.use('/client/point', require('./routes/Client/point'));
app.use('/client/partner', require('./routes/Client/partner'));
app.use('/client/product', require('./routes/Client/product'));
app.use('/client/shipment', require('./routes/Client/shipment'));
app.use('/client/wishlist', require('./routes/Client/wishlist'));
app.use('/client/pre-order', require('./routes/Client/preorder'));
app.use('/client/flash-sale-jumbo', require('./routes/Client/cartflashsale'));
app.use('/client/spesific-program', require('./routes/Client/spesificprogram'));

// routes V2 for client
app.use('/V2/client/sales', require('./routes/Client/salesV2'));
// app.use('/V2/client/product', require('./routes/Client/productV2'));

// routes V3 for client
app.use('/V3/client/product', require('./routes/Client/productV3'));

// for system getdesc
app.use('/system/getdesc/stock', require('./routes/System/stock'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
