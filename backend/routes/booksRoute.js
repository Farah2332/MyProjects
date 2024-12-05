import express from 'express';
import { Book } from '../models/bookModel.js';
const router = express.Router();
//add a book
router.post('/', async (request, response) => {
    try {
        if (
            !request.body.title || !request.body.author || !request.body.PublishYear || !request.body.ISBN

        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }
        const newBook = {
            title: request.body.title,
            author: request.body.author,
            PublishYear: request.body.PublishYear,
            ISBN: request.body.ISBN,
        };
        const book = await Book.create(newBook);
        return response.status(201).send(book);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });

    }

});
// get all books
router.get('/', async (request, response) => {
    try {
        const books = await Book.find({});
        return response.status(200).json({
            count: books.length,
            data: books
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

router.put('/:id', async (request, response) => {
    try {
        if (
            !request.body.title || !request.body.author || !request.body.PublishYear || !request.body.ISBN

        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }
        const { id } = request.params;
        const result = await Book.findByIdAndUpdate(id, request.body);
        if (!result) {
            return response.status(404).json({ message: 'Book not found' });
        }
        return response.status(200).send({ message: 'Updated successfully' });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});
// Get a book by ID
router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const book = await Book.findById(id);
        if (!book) {
            return response.status(404).json({ message: 'Book not found' });
        }
        return response.status(200).json(book);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

//delete a book
router.delete('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Book.findByIdAndDelete(id);
        if (!result) {
            return response.status(404).json({ message: 'Book not found' });
        }
        return response.status(200).send({ message: 'Deleted successfully' });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});
export default router;