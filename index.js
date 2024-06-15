
const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.MONGO).then(() => {
  console.log("DB Connected")
}).catch((err) => {
  console.log(err,"from mongoose")
})
const express = require('express')
const bodyParser = require('body-parser');
const session = require('express-session')
const nocache = require('nocache');

const app = express()
app.use(session({
  secret: "Key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 6000000
  }
}));

const path=require("path")
app.use(express.static(path.join(__dirname,'public')))
//for user router
const user_route = require('./routes/userRoute')
app.use('/', user_route);

app.use(nocache());

    const admin_route = require('./routes/adminRoute')
app.use('/admin', admin_route);

app.use((req, res, next) => {
    res.status(404).render('404.ejs');
  });
    
;


// view engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views')); 
// server
app.listen(3000, function () {
    console.log('Listening  to port 3000')
})
