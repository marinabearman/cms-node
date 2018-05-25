const express = require('express');
//express router (wrapper)
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const { userAuthenticated } = require('../../helpers/authentication');
//need to delete uploaded files
const fs = require('fs');


//middleware to override default layout
//all views after /admin will have admin layout
router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});
//for development don't authenticate 
// router.all('/*', (req, res, next) => {
//         req.app.locals.layout = 'admin';
//         next();
//     });
//Cancel button returns to post
const cancelPost=()=>{return res.redirect('/posts');}

router.get('/', (req, res) => {
    Post.find({})
        .populate('category')
        .then(posts => {
        res.render('admin/posts', { posts: posts });
    }).catch(error => { error });

});

router.get('/my-posts', (req, res)=>{
    Post.find({user: req.user.id})
        .populate('category')
        .then(posts => {
        res.render('admin/posts/my-posts', { posts: posts });
    }).catch(error => { error });
});

router.get('/create', (req, res) => {
    Category.find({}).then(categories=>{
        res.render('admin/posts/create', {categories: categories});
    });
  
});
//CREATE 
router.post('/create', (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({ message: 'Title field is required.'});
    }

    if (!req.body.body) {
        errors.push({ message: 'Description field is required.'});
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {
        //initialize fileName
        // let fileName = '';
        //placeholder
        
        let fileName = 'placeholder-image.jpeg';
        if (!isEmpty(req.files)) {

            
            if (!req.files)
               return res.status(400).send('No files were uploaded.');
              
            // The name of the input field (i.e. "fileUpload") is used to retrieve the uploaded file
            let fileUpload = req.files.fileUpload;
            // let fileName = fileUpload.name;
            // fileName = fileUpload.name;
            //prevent duplicates by appending unique date

            fileName = `${Date.now()}-${fileUpload.name}`;
            // console.log(fileUpload);
            let dirUploads = './public/uploads/'
            //   res.send('/admin/posts');
            // Use the mv() method to place the file somewhere on your server
        
            fileUpload.mv(`${dirUploads}/${fileName}`, (err) => {
                if (err)
                    return res.status(500).send(err);

                // res.send('File uploaded!');
            });
        }

        let allowComments = true;

        req.body.allowComments ? allowComments = true : allowComments = false;

        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category: req.body.category,
            file: fileName
        });

        newPost.save().then(savedPost => {
            req.flash('success_message', `Post "${savedPost.title}" was created successfully.`);
            res.redirect('/admin/posts');
            // console.log(req.body);
        }).catch(error => {
            console.log(`Couldn't save: ${error}`);
        });

    }
});

//UPDATING
router.get('/edit/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
        .then(post => {
        // console.log(post.status);
        //key, value post: post
        Category.find({}).then(categories=>{
            res.render('admin/posts/edit', {post: post, categories: categories});
        });
    });

});

//PUT
router.put('/edit/:id', (req, res) => {

    Post.findOne({ _id: req.params.id }).then(post => {
        let allowComments = true;

        req.body.allowComments ? allowComments = true : allowComments = false;
        post.user=req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category=req.body.category;
  
        //File Upload
        if (!isEmpty(req.files)) {
            if (!req.files)
                return res.status(400).send('No files were uploaded.');

            // The name of the input field (i.e. "fileUpload") is used to retrieve the uploaded file
            let fileUpload = req.files.fileUpload;
            // let fileName = fileUpload.name;
            // fileName = fileUpload.name;
            //prevent duplicates by appending unique date
            fileName = `${Date.now()}-${fileUpload.name}`;
            // console.log(fileUpload);
            post.file = fileName;
            let dirUploads = './public/uploads/'
            //   res.send('/admin/posts');
            // Use the mv() method to place the file somewhere on your server
            fileUpload.mv(`${dirUploads}/${fileName}`, (err) => {
                if (err)
                    return res.status(500).send(err);

                // res.send('File uploaded!');
            });
        }

        post.save().then(updatedPost => {

            req.flash('success_message', 'Post was successfully updated.');
            res.redirect('/admin/posts/my-posts');
        });

    });
});

//DELETE
router.delete('/:id', (req, res) => {
    // Post.remove({_id: req.params.id})
    //     .then(result=>{
    //         res.redirect('/admin/posts');
    //     });
    Post.findOne({ _id: req.params.id })
        .populate('comments')
        .then(post => {

            //delete file from the file system
            //asynchronous function needs callback
            fs.unlink(`${uploadDir}${post.file}`, (err) => {
                if(!post.comments.length < 1){
                    post.comments.forEach(comment => {
                        comment.remove();
                    });
                }
                //delete post
                // post.remove();
                // req.flash('success_message', 'Post was successfully deleted');
                // res.redirect('/admin/posts');
                post.remove().then(postRemoved=>{
                    req.flash('success_message', 'Post was successfully deleted');
                    res.redirect('/admin/posts/my-posts');
                })

            });


        });

});
module.exports = router;