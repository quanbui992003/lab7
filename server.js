const express = require('express')
const app = express()
const port = 3000;
var mongoose = require('mongoose')
const handlebar = require('express-handlebars')
app.set('view engine', '.hbs');
app.set('views', './views');
var mongoose = require('mongoose')
var usersRouter = require('./route/users.js');
var indexRouter = require('./route/index');
app.use(express.json())
var apiRouter = require('./route/api');
var config = require('./config/database');
var passport = require('passport');
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
app.use(express.json())

app.engine('.hbs', handlebar.engine({
  extname:"hbs"
}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static("css"))
app.use('/api', apiRouter);

mongoose.connect(config.database, { 
  useNewUrlParser: true,
   useUnifiedTopology: true 
  });


app.use(passport.initialize());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404 - Khong tim thay trang')
  next();
});

module.exports = app;



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});