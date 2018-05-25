const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//all views after /admin will have admin layout
router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});
router.get('/', (req, res) => {

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts => {

            Post.count().then(postCount=> {
                Category.find({}).then(categories => {
                    res.render('home/index', { 
                        posts: posts, 
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage)
                    });
                })
            });
        });

});
router.get('/post/:slug', (req, res) => {
    Post.findOne({ slug: req.params.slug })
        .populate({ path: 'comments', match: { approveComment: true }, populate: { path: 'user', model: 'users' } })
        .populate('user')
        .then(post => {
            Category.find({}).then(categories => {
                res.render('home/post', { post: post, categories: categories })
            });

        });
});
router.get('/register', (req, res) => {

    //render looks in views by default
    res.render('home/register');
});

router.post('/register', (req, res) => {
    //validation
    let errors = [];

    if (!req.body.firstName) {
        errors.push({ message: 'First name field is required.' });
    }

    if (!req.body.lastName) {
        errors.push({ message: 'Last name field is required.' });
    }


    if (!req.body.email) {
        errors.push({ message: 'Email field is required.' });
    }


    if (!req.body.password) {
        errors.push({ message: 'Password field is required.' });
    }

    if (!req.body.passwordConfirm) {
        errors.push({ message: 'Confirm Password field is required.' });
    }


    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({ message: 'Passwords don\'t match' });
    }

    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        });
    } else {
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                //instantiate
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {

                        // console.log('hash ', hash);
                        newUser.password = hash;
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You are now registered, please login');
                            res.redirect('/login');
                        });
                    });
                });

            } else {
                req.flash('error_message', 'That email exists please login');
                res.redirect('/login');
            }
        });


    }

});

//LOGIN
router.get('/login', (req, res) => {

    //render looks in views by default
    res.render('home/login');
});

passport.use(new LocalStrategy({
    usernameField: 'email'
}, (email, password, done) => {
    console.log(email);
    User.findOne({
        email: email
    }).then(user => {
        if (!user) return done(null, false, { message: 'No user found' });
        // if(!password){}
        console.log('user', user);
        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password' });
            }
        });

    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
    // res.send('Login post works');
});

//LOGOUT
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});
router.get('/about', (req, res) => {

    //render looks in views by default
    res.render('home/about');
});


module.exports = router;