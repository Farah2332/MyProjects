import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/books/create">Create Book</Link>
            <Link to="/books/details/:id">Book Details</Link>
            {/* Add additional links as needed */}
        </nav>
    );
};

export default Navigation;


### NotFound Component(NotFound.jsx)

This component displays when a user navigates to a route that does not exist.

    jsx
import React from 'react';

const NotFound = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
};

export default NotFound;