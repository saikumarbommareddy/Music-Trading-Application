const express = require('express');
const tradeRoute = require('./routes/tradeRoute');
const mainRoute = require('./routes/mainRoute');
const userRoute = require('./routes/userRoute');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose= require('mongoose')
const flash = require('connect-flash');

const app = express();
let host = 'localhost';
let port = 3000;
app.set('view engine','ejs');
mongoose.connect('mongodb://localhost:27017/Trades',{useUnifiedTopology: true,useNewUrlParser: true, useCreateIndex:true})
.then(() =>{
app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
})
})
.catch(err =>console.log(err.message));
app.use(
    session({
        secret: "I am Iron Man",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/Trades'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {

    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});
app.use(express.static('public'));

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use('/',mainRoute);
app.use('/trades',tradeRoute);
app.use('/users', userRoute);

app.use((req,res,next)=>{
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    next(err);
});

app.use((err,req,res,next)=>{
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error',{error:err});

});