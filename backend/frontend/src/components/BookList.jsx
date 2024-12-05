import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookList = ({ books }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Scraped Book Details</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {books.map(book => (
                            <li key={book._id} style={{ marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '5px', padding: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{book.title}</h3>
                                <p style={{ margin: 0 }}>Author: {book.author}</p>
                                <p style={{ margin: 0 }}>ISBN: {book.ISBN}</p>
                                {/* Add additional details as needed */}
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    );
};

export default BookList;
