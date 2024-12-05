import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';

const EditBooks = () => {
    const [loading, setLoading] = useState(false);
    const [book, setBook] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5555/books/${id}`)
            .then((response) => {
                setBook(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.error(error);
            });
    }, [id]);

    const handleUpdateBook = () => {
        setLoading(true);
        axios.put(`http://localhost:5555/books/${id}`, book)
            .then(() => {
                setLoading(false);
                navigate('/');
            })
            .catch((error) => {
                setLoading(false);
                alert('An error occurred. Please check the console for details.');
                console.error(error);
            });
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl my-8">Edit Book</h1>
                <BackButton />
            </div>
            {loading ? (
                <Spinner />
            ) : (
                    <div className="max-w-md mx-auto space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-lg text-gray-600">Title</label>
                            <input
                                type="text"
                                id="title"
                                value={book ?.title || ''}
                                onChange={(e) => setBook({ ...book, title: e.target.value })}
                                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="author" className="block text-lg text-gray-600">Author</label>
                            <input
                                type="text"
                                id="author"
                                value={book ?.author || ''}
                                onChange={(e) => setBook({ ...book, author: e.target.value })}
                                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="publishYear" className="block text-lg text-gray-600">Publish Year</label>
                            <input
                                type="text"
                                id="publishYear"
                                value={book ?.PublishYear || ''}
                                onChange={(e) => setBook({ ...book, PublishYear: e.target.value })}
                                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="ISBN" className="block text-lg text-gray-600">Publish Year</label>
                            <input
                                type="text"
                                id="ISBN"
                                value={book ?.PublishYear || ''}
                                onChange={(e) => setBook({ ...book, ISBN: e.target.value })}
                                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                            />
                        </div>
                        <button
                            className={`block mx-auto py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                            onClick={handleUpdateBook}
                            disabled={loading || !book ?.title || !book ?.author || !book ?.PublishYear}
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                )}
        </div>
    );
};

export default EditBooks;
