import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const DeleteBooks = () => {
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const handleDeleteBook = () => {
        setLoading(true);
        axios.delete(`http://localhost:5555/books/${id}`)
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
                <h1 className="text-3xl my-8">Delete Book</h1>
                <BackButton />
            </div>
            <div className="max-w-md mx-auto space-y-6">
                <p>Are you sure you want to delete this book?</p>
                <button
                    className={`block mx-auto py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                    onClick={handleDeleteBook}
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

export default DeleteBooks;
