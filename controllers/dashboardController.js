const Post = require('../models/postModel');
const Comment = require('../models/commentModel');

/*** DASHBOARD ***/

exports.getDashboard = (req, res, next) => {
  return res.render('dashboard');
};

/*** POSTS ***/

exports.getPosts = (req, res, next) => {
  Post.find({}, 'title')
    .populate('post')
    .populate('date')
    .populate('comments')
    .sort({ date: -1 })
    .exec((err, posts_list) => {
      if (err) {
        return next(err);
      }

      res.render('posts', {
        posts_list,
      });
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.post_id)
    .populate('title')
    .populate('post')
    .populate('date')
    .populate('comments')
    .exec((err, post) => {
      if (err) {
        return next(err);
      }
      if (post === null) {
        const err = new Error('Post not found.');
        err.status = 404;
        return next(err);
      }
      res.render('post', {
        title: post.title,
        post,
      });
    });
};

/*** COMMENTS  ***/

exports.deleteComment = async (req, res, next) => {
  const post = await Post.findById(req.params.post_id).exec();
  const comments = post.comments;
  const updatedComments = comments.filter((comment) => {
    return comment._id.toString() !== req.params.comment_id;
  });

  Post.findByIdAndUpdate(
    req.params.post_id,
    { comments: updatedComments },
    (err, post) => {
      if (err) {
        return next(err);
      }
    }
  );

  Comment.findByIdAndDelete(req.params.comment_id, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.redirect(`/dashboard/posts/${req.params.post_id}`);
    }
  });
};
