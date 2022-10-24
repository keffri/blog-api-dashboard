const express = require('express');
const router = express.Router();

const dashboard_controller = require('../controllers/dashboardController');

// DASHBOARD
router.get('/', dashboard_controller.getDashboard);

// POSTS
router.get('/posts', dashboard_controller.getPosts);

router.get('/posts/create', dashboard_controller.getCreate);

router.get('/posts/:post_id', dashboard_controller.getPost);

router.get('/posts/:post_id/edit', dashboard_controller.getEdit);

router.post('/posts/', dashboard_controller.postPost);

router.put('/posts/:post_id/edit', dashboard_controller.putPost);

router.delete('/posts/:post_id', dashboard_controller.deletePost);

// COMMENTS

router.get(
  '/posts/:post_id/comments/:comment_id/',
  dashboard_controller.getComment
);

router.post('/posts/:post_id/comments', dashboard_controller.postComment);

router.put(
  '/posts/:post_id/comments/:comment_id',
  dashboard_controller.putComment
);

router.delete(
  '/posts/:post_id/comments/:comment_id/',
  dashboard_controller.deleteComment
);

module.exports = router;
