const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const faker = require('faker');
const { userAuthenticated } = require('../../helpers/authentication');
//middleware to override default layout

//all views after /admin will have admin layout
// router.all('/*', userAuthenticated , (req, res, next)=>{
//     req.app.locals.layout = 'admin';
//     next();
// });

//development
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});


//Post graph on dashboard
router.get('/', (req, res)=>{
 

    const promises = [

        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()

    ];


    Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{


        res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount});


    });



    //
    // Post.count({}).then(postCount=>{
    //
    //     res.render('admin/index', {postCount: postCount});
    //
    //
    // });
    //



});

router.post('/generate-fake-posts', (req, res)=>{
    // res.send('fake works');
    for(let i=0; i < req.body.amount; i++){
        let post = new Post();
        post.user = '5b0484dcc3319d11784db983',
        post.title = faker.name.title();
        post.slug = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body=faker.lorem.sentences();
        //faker doesn't work with promises
        //do it the old fashion way with a callback
        post.save();
       
    }
    res.redirect('/admin/posts');
});

module.exports = router;