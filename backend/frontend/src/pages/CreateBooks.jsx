import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const CreateBooks = () => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishYear, setPublishYear] = useState('');
    const [ISBN, setISBN] = useState('');
    const navigate = useNavigate();

    const handleSaveBook = () => {
        const data = {
            title,
            author,
            PublishYear: publishYear,
            ISBN // Add ISBN to the data object
        };

        setLoading(true);
        axios.post('http://localhost:5555/books', data)
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
                <h1 className="text-3xl my-8">Create Book</h1>
                <BackButton />
            </div>
            <div className="max-w-md mx-auto space-y-6">
                <div>
                    <label htmlFor="title" className="block text-lg text-gray-600">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label htmlFor="author" className="block text-lg text-gray-600">Author</label>
                    <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label htmlFor="publishYear" className="block text-lg text-gray-600">Publish Year</label>
                    <input
                        type="text"
                        id="publishYear"
                        value={publishYear}
                        onChange={(e) => setPublishYear(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label htmlFor="ISBN" className="block text-lg text-gray-600">ISBN</label>
                    <input
                        type="text"
                        id="ISBN"
                        value={ISBN}
                        onChange={(e) => setISBN(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                </div>
                <button
                    className={`block mx-auto py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    onClick={handleSaveBook}
                    disabled={loading || !title || !author || !publishYear || !ISBN}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default CreateBooks;
