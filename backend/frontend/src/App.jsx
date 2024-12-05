// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Correct import statement
import CreateBooks from './pages/CreateBooks';
import ShowBooks from './pages/ShowBooks';
import DeleteBooks from './pages/DeleteBooks';
import EditBooks from './pages/EditBooks';
import Home from './pages/Home';

const App = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/books/create' element={<CreateBooks />} />
            <Route path='/books/delete/:id' element={<DeleteBooks />} />
            <Route path='/books/edit/:id' element={<EditBooks />} />
            <Route path='/books/details/:id' element={<ShowBooks />} />
        </Routes>
    );
};

export default App;
