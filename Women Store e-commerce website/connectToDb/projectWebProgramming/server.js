'use strict';
var express = require('express');
var app = express();
const session = require('express-session');
var port = process.env.PORT || 1337;
var path = require('path');
var HTMLpath = path.join(__dirname, "HTML Files");
app.use(express.static(HTMLpath));
app.use(express.urlencoded({ extended: true }));
var mysql = require('mysql');
var connect = require('./connectjs');
const bodyParser = require('body-parser');
// Assuming your server is serving static files from the 'public' folder
var sess;
app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Adjust this based on your environment (true for HTTPS)
}));
app.get("", (req, res) => {

    res.sendFile(`${HTMLpath}/loginsignup.html`);

});
app.use(bodyParser.json());
app.use(express.static('Public'));
app.get('/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        console.log('Session destroyed successfully');

        res.redirect('/loginsignup.html');

    });
});
app.post('', (req, res) => {
   
    const { email, password } = req.body;

    // Perform a database query to check if the email and password match
    const query = 'SELECT * FROM customers WHERE BINARY customer_email = ? AND customer_pass = ?';

    connect.con.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        if (results.length > 0) {
            // User found, set the customer_id in the session
            req.session.customer_id = results[0].customer_id;

            const user = results[0];
            const responseData = {
                success: true,
                message: 'Logged in successfully',
                user: {
                    name: user.customer_name,
                    email: user.customer_email,
                    country: user.customer_country,
                    profile_image: user.customer_profile_image,
                    preferences: {
                        styles: [] // Add user preferences if available
                    }
                }
            };

            // Log the session data
            console.log('Session Data:', req.session);

            res.status(200).json(responseData);
  
        } else {
            // No matching user found
            res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
    });
});


app.post('/validate-credit-card', (req, res) => {
    const { name, cardNumber, expirationDate, securityCode } = req.body;

    const customerIdQuery = 'SELECT customer_id FROM customers WHERE customer_name = ?';

    connect.con.query(customerIdQuery, [name], (customerIdErr, customerIdResults) => {
        if (customerIdErr) {
            console.error(customerIdErr);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        if (customerIdResults.length === 0) {
            // Customer not found
            return res.status(400).json({ success: false, error: 'Customer not found' });
        }

        const customerId = customerIdResults[0].customer_id;

        // Use explicit JOIN and placeholders in the query
        const query = `
    SELECT *
    FROM credit_cards
    WHERE 
        customer_id = ?
        AND card_number = ? 
        AND expiration = ? 
        AND security_code = ?;
`;

        console.log('Executing query with values:', customerId, cardNumber, expirationDate, securityCode);

        connect.con.query(query, [customerId, cardNumber, expirationDate, securityCode], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'Internal Server Error' });
            }

            if (results.length > 0) {
                // Valid credit card; retrieve the customer_credit
                const customerCredit = results[0].customer_credit;
                res.status(200).json({ success: true, message: 'Credit card is valid', customerCredit });
            } else {
                // Invalid credit card
                console.error('No matching record found');
                res.status(400).json({ success: false, message: 'Invalid credit card information' });
            }

        });


    });
});
// In your server.js or index.js file
app.post('/purchase-product', async (req, res) => {
    const customerId = req.session.customer_id;
    try {
        const { productPrice } = req.body;

        console.log('Customer ID:', customerId);
        console.log('Product Price from Request Body:', productPrice);

        // Fetch customer's current credit from the database
        const currentCreditQuery = 'SELECT customer_credit FROM credit_cards WHERE customer_id = ?';

        // Wrap the query in a Promise to make it awaitable
        const customerData = await new Promise((resolve, reject) => {
            connect.con.query(currentCreditQuery, [customerId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // Check if there is data returned
        if (customerData.length > 0) {
            const currentCredit = customerData[0].customer_credit;

            console.log('Current Credit from Database:', currentCredit);

            // Check if the customer has enough credit
            if (currentCredit >= productPrice) {
                // Deduct the product price from the customer's credit
                const newCredit = currentCredit - productPrice;

                // Update the customer's credit in the database
                const updateCreditQuery = 'UPDATE credit_cards SET customer_credit = ? WHERE customer_id = ?';
                await connect.con.query(updateCreditQuery, [parseFloat(newCredit), customerId]);

                console.log('New Credit:', newCredit);

                // Respond with a success message
                res.status(200).json({ success: true, message: 'Thank you for shopping from our store!' });
            } else {
                // Respond with an insufficient credit message
                res.status(400).json({ success: false, message: "You don't have enough credit." });
            }
        } else {
            // Handle the case where no customer data was found
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



const isAuthenticated = (req, res, next) => {
    if (req.session.customer_id) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated
        res.status(401).json({ success: false, error: 'Unauthorized' });
    }
};

app.post('/update-preferences', isAuthenticated, (req, res) => {
    const customerId = req.session.customer_id;
    const { preferences } = req.body;

    // Update the preferences in the database
    const updateQuery = 'UPDATE customers SET preferences = ? WHERE customer_id = ?';

    connect.con.query(updateQuery, [JSON.stringify(preferences), customerId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        res.status(200).json({ success: true, message: 'Preferences updated successfully' });
    });
});

app.post('/update-rating', isAuthenticated, (req, res) => {
    const customerId = req.session.customer_id;
    const { feedbackText } = req.body;

    // Log the received feedbackText
    console.log('Received feedbackText:', feedbackText);

    // Update the preferences in the database
    const updateQuery = 'Insert into rating  (customer_feedback) VALUES (?)';

    connect.con.query(updateQuery, [feedbackText, customerId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        res.status(200).json({ success: true, message: 'Rating updated successfully' });
    });
});




// ...

app.post('/signup', (req, res) => {
    const { name, email, password, country } = req.body;

    // Validate the presence of required fields
    if (!name || !email || !password || !country) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Perform a database query to insert the new user
    const query = 'INSERT INTO customers (customer_name, customer_email, customer_pass, customer_country) VALUES (?, ?, ?, ?)';
    connect.con.query(query, [name, email, password, country], (err, results) => {
        if (err) {
            console.error('Error inserting new user:', err);

            // Check if the error is due to a duplicate entry (assuming email should be unique)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Email address already registered' });
            }

            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        console.log('New user inserted:', results);

        // Set the session with the customer_id of the newly signed up user
        req.session.customer_id = results.insertId;

        // Respond with success and include the customer_id in the response
        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            customer_id: results.insertId,
        });

     
        
    });
});

app.get('/wishlist', (req, res) => {
    // Get the currently logged-in user's ID from the session or token
    const userId = req.session.customer_id;

    // Validate the user ID
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Fetch the wishlist items for the user
    const wishlistQuery = 'SELECT * FROM wishlist WHERE customer_id = ?';
    connect.con.query(wishlistQuery, [userId], (wishlistErr, wishlistResults) => {
        if (wishlistErr) {
            console.error('Error fetching wishlist:', wishlistErr);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        // Send the wishlist items to the client
        res.json({ success: true, wishlist: wishlistResults });
    });
});



// Add this route to handle product deletion
// Add this route to handle product deletion
app.post('/deleteFromWishlist', (req, res) => {
    const productdesc = req.body.productdesc; // Assuming you are sending productdesc from the client

    // Get the currently logged-in user's ID from the session or token
    const userId = parseInt(req.session.customer_id, 10) || 0; // Use 0 as a fallback value

    console.log('Deleting product from wishlist. User ID:', userId, 'Product Desc:', productdesc);

    // Delete the product from the wishlist table
    const deleteQuery = 'DELETE FROM wishlist WHERE customer_id = ? AND product_desc = ?';

    connect.con.query(deleteQuery, [userId, productdesc], (err, results) => {
        if (err) {
            console.error('Error deleting product from wishlist:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        console.log('Delete query results:', results);

        if (results.affectedRows === 0) {
            console.log('Product not found in wishlist');
            return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
        }

        console.log('Product deleted from wishlist');
        return res.status(200).json({ success: true, message: 'Product deleted from wishlist successfully' });
    });
});


app.post('/addToWishlist', (req, res) => {
    const { description, price, imageUrl } = req.body;

    // Get the currently logged-in user's ID from the session or token
    const userId = parseInt(req.session.customer_id, 10) || 0; // Use 0 as a fallback value

    const query1 = 'INSERT INTO wishlist (customer_id, product_desc, product_prix, product_picture) VALUES (?, ?, ?, ?)';
    const query2 = 'UPDATE wishlist SET customer_id = ? WHERE product_desc = ? AND product_prix = ? AND product_picture = ?';

    const insertPromise = new Promise((resolve, reject) => {
        connect.con.query(query2, [userId, description, price, imageUrl], (err, results) => {
            if (err) {
                console.error('Error adding to wishlist:', err);
                reject(err);
            } else {
                console.log('Product added to wishlist:', results);
                resolve(results);
            }
        });
    });

    insertPromise.then(() => {
        connect.con.query(query1, [userId, description, price, imageUrl], (err, results) => {
            if (err) {
                console.error('Error updating customer_id:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            const wishlistQuery = 'SELECT * FROM wishlist WHERE customer_id = ?';
            connect.con.query(wishlistQuery, [userId], (wishlistErr, wishlistResults) => {
                if (wishlistErr) {
                    console.error('Error fetching wishlist:', wishlistErr);
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
                }

                // Send the wishlist items to the client
                const response = { success: true, message: 'Product added to wishlist successfully', wishlist: wishlistResults };
                return res.status(200).json(response);
            });
        });
    }).catch((err) => {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    });
});



app.get('/shoppingcart', (req, res) => {
    // Get the currently logged-in user's ID from the session or token
    const userId = req.session.customer_id;

    // Validate the user ID
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Fetch the wishlist items for the user
    const wishlistQuery = 'SELECT * FROM shopping WHERE customer_id = ?';
    connect.con.query(wishlistQuery, [userId], (wishlistErr, wishlistResults) => {
        if (wishlistErr) {
            console.error('Error fetching wishlist:', wishlistErr);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        // Send the wishlist items to the client
        res.json({ success: true, wishlist: wishlistResults });
    });
});


app.post('/deleteFromShoppingCart', (req, res) => {
    const productdesc = req.body.productdesc; // Assuming you are sending productdesc from the client

    // Get the currently logged-in user's ID from the session or token
    const userId = parseInt(req.session.customer_id, 10) || 0; // Use 0 as a fallback value

    console.log('Deleting product from shopping cart. User ID:', userId, 'Product Desc:', productdesc);

    // Delete the product from the wishlist table
    const deleteQuery = 'DELETE FROM shopping WHERE customer_id = ? AND product_desc = ?';

    connect.con.query(deleteQuery, [userId, productdesc], (err, results) => {
        if (err) {
            console.error('Error deleting product from shopping cart:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        console.log('Delete query results:', results);

        if (results.affectedRows === 0) {
            console.log('Product not found in shopping cart');
            return res.status(404).json({ success: false, message: 'Product not found in shopping cart' });
        }

        console.log('Product deleted from shopping cart');
        return res.status(200).json({ success: true, message: 'Product deleted from shopping cart successfully' });
    });
});


app.post('/addToCart', (req, res) => {
    const { description, price, imageUrl } = req.body;

    // Get the currently logged-in user's ID from the session or token
    const userId = parseInt(req.session.customer_id, 10) || 0; // Use 0 as a fallback value

    const query1 = 'INSERT INTO shopping (customer_id, product_desc, product_prix, product_picture) VALUES (?, ?, ?, ?)';
    const query2 = 'UPDATE shopping SET customer_id = ? WHERE product_desc = ? AND product_prix = ? AND product_picture = ?';

    const insertPromise = new Promise((resolve, reject) => {
        connect.con.query(query2, [userId, description, price, imageUrl], (err, results) => {
            if (err) {
                console.error('Error adding to shopping cart:', err);
                reject(err);
            } else {
                console.log('Product added to shopping cart:', results);
                resolve(results);
            }
        });
    });

    insertPromise.then(() => {
        connect.con.query(query1, [userId, description, price, imageUrl], (err, results) => {
            if (err) {
                console.error('Error updating customer_id:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            const wishlistQuery = 'SELECT * FROM shopping WHERE customer_id = ?';
            connect.con.query(wishlistQuery, [userId], (wishlistErr, wishlistResults) => {
                if (wishlistErr) {
                    console.error('Error fetching wishlist:', wishlistErr);
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
                }

                // Send the wishlist items to the client
                const response = { success: true, message: 'Product added to shopping cart successfully', wishlist: wishlistResults };
                return res.status(200).json(response);
            });
        });
    }).catch((err) => {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    });
});



app.post("/update", (req, res) => {
    const { Customer_id, Name, Type, Birthdate, Age } = req.body;

    // Check if the customer with the specified ID exists
    connect.con.query("SELECT * FROM customer2 WHERE customer_id = ?", [Customer_id], (err, result, fields) => {
        if (err) {
            console.error('Error executing query', err);
            res.status(500).send('Error checking if customer exists');
            return;
        }

        if (result.length === 0) {
            // Customer does not exist
            res.status(404).send('Customer not found');
        } else {
            // Customer exists, proceed with the update
            const updateQuery = "UPDATE customer2 SET Customer_name = ?, Customer_type = ?, DOB = ?, Age = ? WHERE customer_id = ?";
            const updateValues = [Name, Type, Birthdate, Age, Customer_id];

            connect.con.query(updateQuery, updateValues, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error executing update query', updateErr);
                    res.status(500).send('Error updating data');
                } else {
                    console.log('Data updated successfully');
                    res.status(200).send('Data updated successfully');
                }
            });
        }
    });
});


app.get("/delete", (req, res) => {
    res.sendFile(`${HTMLpath}/delete.html`);
}
);
app.post("/delete", (req, res) => {
    const { Customer_id, Name, Type, Birthdate, Age } = req.body;
    connect.con.query("Select * from customer2 where customer_id=?", [Customer_id], (err, result, fields) => {
        if (err) {
            console.error('Error executing query', err);
            res.status(500).send('Error checking if customer exists');
            return;
        }
        if (result.length === 0) {
            res.status(400).send('Customer not found');
        } else {
            const deleteQuery = "DELETE FROM customer2 where customer_id=?";
            connect.con.query(deleteQuery, [Customer_id], (deleteErr, deleteResult) => {
                if (deleteErr) {
                    res.status(500).send('Error deleting data');
                } else {
                    res.status(200).send('Data deleted successfully');
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});