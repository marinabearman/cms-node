const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next) => {


    req.app.locals.layout = 'admin';
    next();


});
router.get('/', (req, res) => {
    //static user for testing and development
    // Comment.find({ user: '5b0484dcc3319d11784db983' }).populate('user')
    //     .then(comments => {
    //         res.render('admin/comments', { comments: comments });
    //     });
    Comment.find({user: req.user.id}).populate('user')
    .then(comments=>{
        res.render('admin/comments', {comments: comments});
    });



});

router.post('/', (req, res) => {
    Post.findOne({ _id: req.body.id })
        .then(post => {
            // console.log('post', post);
            const newComment = new Comment(
                {
                    //created by session (passport)
                    user: req.user.id,
                    body: req.body.body
                }
            );

            post.comments.push(newComment);

            post.save().then(savedPost => {
                newComment.save().then(savedComment => {
                    req.flash('success_message', 'Your comment will be reviewed and displayed if approved.');
                    res.redirect(`/post/${post.id}`);
                }).catch((err) => {
                    console.log(`newComment.save error: ${err}`);
                });
            }).catch((err) => {
                console.log(`post.save() error: ${err}`);
            });
        }).catch(error => {
            console.log(`Post.findOne error: ${error}`);
        });



});

router.delete('/:id', (req, res) => {

    Comment.remove({ _id: req.params.id }).then(result => {

        Post.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {
            if (err) console.log(err);

            res.redirect('/admin/comments');
        })




    });

});
router.post('/approve-comment', (req, res) => {
    // res.send('Ajax call works');
    // console.log('id ', req.body.id);
    // console.log('id ', req.body.approveComment);
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{
        if(err) return err;
        res.send(result);
    });
});
module.exports = router;