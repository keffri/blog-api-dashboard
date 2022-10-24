const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const { body, validationResult } = require('express-validator');
const { DateTime } = require('luxon');

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

exports.getCreate = (req, res, next) => {
  return res.render('create');
};

exports.postPost = [
  body('title')
    .trim()
    .isLength({ min: 4 })
    .escape()
    .withMessage('Title is too short. (min: 4')
    .isLength({ max: 30 })
    .escape()
    .withMessage('Title is too long. (max: 30)'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Please enter text content.'),
  (req, res, next) => {
    let post = { title: req.body.title, post: req.body.content };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('create', { post, errors: errors.array() });
    }

    new Post({
      title: req.body.title,
      post: req.body.content,
    }).save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/dashboard');
    });
  },
];

exports.getEdit = (req, res, next) => {
  Post.findById(req.params.post_id)
    .populate('title')
    .populate('post')
    .exec((err, post) => {
      if (err) {
        return next(err);
      } else {
        res.render('edit', {
          post,
          postID: req.params.post_id,
        });
      }
    });
};

exports.putPost = [
  body('title')
    .trim()
    .isLength({ min: 4 })
    .escape()
    .withMessage('Title is too short. (min: 4')
    .isLength({ max: 30 })
    .escape()
    .withMessage('Title is too long. (max: 30)'),
  body('post')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Please enter text content.'),
  async (req, res, next) => {
    const post = await Post.findById(req.params.post_id)
      .populate('title')
      .populate('post')
      .exec();

    let postID = req.params.post_id;

    const errors = validationResult(req);
    console.log(post);
    console.log(errors.array());
    if (!errors.isEmpty()) {
      return res.render('create', {
        post,
        postID,
        errors: errors.array(),
      });
    }

    Post.findById(req.params.post_id, (err, post) => {
      if (err) {
        return next(err);
      }

      post.title = req.body.title;
      post.post = req.body.post;
      post.edited = true;
      post.editedDate = DateTime.fromJSDate(new Date()).toFormat(
        'DDDD, h:mm:ss, a'
      );

      post.save((err) => {
        if (err) {
          return next(err);
        }
      });

      res.redirect(`/dashboard/posts/${req.params.post_id}`);
    });
  },
];

/*** COMMENTS  ***/

exports.getComment = (req, res, next) => {
  Comment.findById(req.params.comment_id)
    .populate('user')
    .populate('post')
    .populate('comment')
    .exec((err, comment) => {
      if (err) {
        return next(err);
      } else {
        res.render('comment', {
          comment,
          postID: req.params.post_id,
        });
      }
    });
};

exports.postComment = [
  body('comment')
    .trim()
    .isLength({ min: 4 })
    .escape()
    .withMessage('Comment is too short. (min: 4)')
    .isLength({ max: 140 })
    .escape()
    .withMessage('Comment is too long. (max: 140)'),

  async (req, res, next) => {
    const post = await Post.findById(req.params.post_id)
      .populate('comments')
      .exec();

    let commentText = req.body.comment;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('post', { post, commentText, errors: errors.array() });
    }

    const comments = post.comments;

    const comment = new Comment({
      user: req.user.username,
      post: req.params.post_id,
      comment: req.body.comment,
    });

    comment.save();

    comments.push(comment);

    Post.findByIdAndUpdate(req.params.post_id, { comments }, (err, post) => {
      if (err) {
        return next(err);
      }
      res.redirect(`/dashboard/posts/${req.params.post_id}`);
    });
  },
];

exports.putComment = [
  body('comment')
    .trim()
    .isLength({ min: 4 })
    .escape()
    .withMessage('Comment is too short. (min: 4)')
    .isLength({ max: 140 })
    .escape()
    .withMessage('Comment is too long. (max: 140)'),
  async (req, res, next) => {
    const comment = await Comment.findById(req.params.comment_id)
      .populate('user')
      .populate('comment')
      .populate('date')
      .exec();

    let commentText = req.body.comment;
    let postID = req.params.post_id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('comment', {
        comment,
        commentText,
        postID,
        errors: errors.array(),
      });
    }

    Comment.findById(req.params.comment_id, (err, comment) => {
      if (err) {
        return next(err);
      }

      comment.comment = req.body.comment;
      comment.edited = true;
      comment.editedDate = DateTime.fromJSDate(new Date()).toFormat(
        'DDDD, h:mm:ss, a'
      );

      comment.save((err) => {
        if (err) {
          return next(err);
        }

        res.redirect(`/dashboard/posts/${req.params.post_id}`);
      });
    });
  },
];

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
