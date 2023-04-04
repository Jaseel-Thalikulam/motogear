
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/motogear")

const accountSid = "ACde7da89081f9ba029c3437b855edda55";
const authToken = "6bcc716eebbb637a70464853c245c4e8";
const client = require('twilio')(accountSid, authToken);
const express = require('express')
const session=require('express-session')

const app = express()
app.use(session({
    secret: "Key",
    cookie: {maxAge:6000000
}}))
const path=require("path")
app.use(express.static(path.join(__dirname,'public')))
//for user router
const user_route = require('./routes/userRoute')
app.use('/', user_route);


    const admin_route = require('./routes/adminRoute')
app.use('/admin', admin_route);

app.use((req, res, next) => {
    res.status(404).render('404.ejs');
  });
    




// server
app.listen(3000, function () {
    console.log('listening on port 2000')
})
