//This is our server
const express = require('express');
//create app from express function
const app = express();
const exphbs = require('express-handlebars');
//node module
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');

//mongoose use e6 Promise native library 
mongoose.Promise = global.Promise;
mongoose.connect(mongoDbUrl).then(db=>{
    console.log('Mongo connected');
}).catch(error => console.log(`Could not connect because:  ${error}`));


// MIDDLEWARE // app.use works like dependency injection in Angular 5
//static files to be served
app.use(express.static(path.join(__dirname, 'public')));

// HANDLEBAR
const{select, generateDate, paginate} = require('./helpers/handlebars-helpers');
//Set view engine and register handlebar helpers functions
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers:{select:select, generateDate: generateDate, paginate: paginate}}));
app.set('view engine', 'handlebars');

// Add files property to request
// IMPORTANT: fileUpload has to be above body parser or won't work because uploaded files are not JSON data and body parser only parses JSON!

app.use(fileUpload());

// BODY PARSER // gets and parses body property of JSON response
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Method Override
app.use(methodOverride('_method'));

//Sessions
/* Flash requires session */
app.use(session({
    secret: 'chicha123',
    resave: true,
    saveUninitialized: true,    
}));
app.use(flash()); 

//Passport
app.use(passport.initialize());
app.use(passport.session());


// Local Variables using middleware
app.use((req, res, next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');

    next();
});
/** END */

//Load Routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

// USE routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);





app.listen(4500, ()=>{
    console.log(`listening on port 4500`);
});
