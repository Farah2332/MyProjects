import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishYear: { type: Number },
});

const Book = mongoose.model('Book2', bookSchema);

export default Book2;
