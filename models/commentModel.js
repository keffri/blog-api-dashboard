const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const CommentSchema = new Schema({
  user: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  comment: { type: String, minLength: 4, maxLength: 140, required: true },
  date: { type: Date, default: Date.now, required: true },
  edited: { type: Boolean, default: false, required: true },
  editedDate: {
    type: String,
    default: DateTime.fromJSDate(this.date).toFormat('DDDD, h:mm:ss, a'),
  },
});

CommentSchema.virtual('commentDate').get(function () {
  return DateTime.fromJSDate(this.date).toFormat('DDDD, h:mm:ss, a');
});

module.exports = mongoose.model('Comment', CommentSchema);
