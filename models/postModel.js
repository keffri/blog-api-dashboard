const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const PostSchema = new Schema({
  title: { type: String, minLength: 4, maxLength: 30, required: true },
  post: { type: String, minLength: 1, required: true },
  date: { type: Date, default: Date.now, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

PostSchema.virtual('postDate').get(function () {
  return DateTime.fromJSDate(this.date).toFormat('DDDD, h:mm:ss, a');
});

PostSchema.virtual('url').get(function () {
  return `/blog/posts/${this.id}`;
});

module.exports = mongoose.model('Post', PostSchema);
