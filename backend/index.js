import express from "express";
import cors from "cors";
import axios from 'axios';
import cheerio from 'cheerio';
import mongoose from 'mongoose'; // Import mongoose for MongoDB interaction
import { PORT, mongoDBURL } from "./config.js";

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define a schema for your product data

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: String
});

// Create Product model
const Product = mongoose.model('Product', productSchema);
const containsCaptcha = (html) => {
    return html.includes('captcha') || html.includes('Captcha');
};

// Mock function to simulate solving CAPTCHAs
const solveCaptcha = async () => {
    // Simulate solving CAPTCHA by returning a static value
    return 'mocked-captcha-solution';
};

// Route handler for the /scrape endpoint
app.get('/scrape-shein', async (req, res) => {
    try {
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        // Fetch the HTML of the page with a User-Agent header
        const response = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const html = response.data;

        // Check if the response contains CAPTCHA indicators
        if (containsCaptcha(html)) {
            // Solve CAPTCHA
            const solvedCaptcha = await solveCaptcha();

            // Retry scraping with solved CAPTCHA
            const responseWithCaptcha = await axios.get(productUrl, { headers: { 'x-captcha-solution': solvedCaptcha } });
            html = responseWithCaptcha.data;

            // Check if the response still contains CAPTCHA indicators
            if (containsCaptcha(html)) {
                return res.status(503).json({ error: 'CAPTCHA detected. Unable to solve.' });
            }
        }

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract product details using Cheerio
        let title = $('meta[property="og:title"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let price = $('meta[property="og:price:amount"]').attr('content');
        let imageUrl = $('meta[property="og:image"]').attr('content');

        // If meta tags are missing, log it for debugging and use alternative selectors
        if (!title || !price || !description || !imageUrl) {
            console.log('Meta tags not found. Checking alternative selectors.');
            title = title || $('title').text();
            price = price || $('.ProductIntroHeadPrice__head-mainprice span').text().trim(); // Adjust this selector based on the HTML structure
            description = description || $('meta[name="description"]').attr('content');
            // Try to get image URL from various attributes
            imageUrl = imageUrl || $('.crop-image-container').attr('data-before-crop-src');
            if (!imageUrl) {
                imageUrl = $('.crop-image-container__img').attr('src');
            }
        }

        // Ensure the image URL is complete
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https:${imageUrl}`;
        }

        // Log the extracted values for debugging
        console.log('Extracted title:', title);
        console.log('Extracted price:', price);
        console.log('Extracted description:', description);
        console.log('Extracted image URL:', imageUrl);

        const productDetails = {
            title: title ? title.trim() : '',
            price: price ? price.trim() : '',
            description: description ? description.trim() : '',
            imageUrl: imageUrl ? imageUrl.trim() : ''
        };

        res.status(200).json({ message: 'Product details scraped successfully', data: productDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/test-scrape-captcha', async (req, res) => {
    try {
        // Simulate a URL that triggers CAPTCHA
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        let response = await axios.get(productUrl);
        let html = response.data;

        // Check if the response contains CAPTCHA indicators
        if (containsCaptcha(html)) {
            // Solve CAPTCHA
            const solvedCaptcha = await solveCaptcha();

            // Retry scraping with solved CAPTCHA
            response = await axios.get(productUrl, { headers: { 'x-captcha-solution': solvedCaptcha } });
            html = response.data;

            // Check if the response still contains CAPTCHA indicators
            if (containsCaptcha(html)) {
                return res.status(503).json({ error: 'CAPTCHA detected. Unable to solve.' });
            }
        }

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        let title = $('meta[property="og:title"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let price = $('meta[property="og:price:amount"]').attr('content');
        let imageUrl = $('meta[property="og:image"]').attr('content');

        // If meta tags are missing, log it for debugging and use alternative selectors
        if (!title || !price || !description || !imageUrl) {
            console.log('Meta tags not found. Checking alternative selectors.');
            title = title || $('title').text();
            price = price || $('.ProductIntroHeadPrice__head-mainprice span').text().trim(); // Adjust this selector based on the HTML structure
            description = description || $('meta[name="description"]').attr('content');
            // Try to get image URL from various attributes
            imageUrl = imageUrl || $('.crop-image-container').attr('data-before-crop-src');
            if (!imageUrl) {
                imageUrl = $('.crop-image-container__img').attr('src');
            }
        }

        // Ensure the image URL is complete
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https:${imageUrl}`;
        }

        // Log the extracted values for debugging
        console.log('Extracted title:', title);
        console.log('Extracted price:', price);
        console.log('Extracted description:', description);
        console.log('Extracted image URL:', imageUrl);

        const productDetails = {
            title: title ? title.trim() : '',
            price: price ? price.trim() : '',
            description: description ? description.trim() : '',
            imageUrl: imageUrl ? imageUrl.trim() : ''
        };

        res.status(200).json({ message: 'Product details scraped successfully', data: productDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/scrape-amazon', async (req, res) => {
    try {
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        // Fetch the HTML of the page with a User-Agent header
        const response = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const html = response.data;

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract product details using Cheerio
        let title = $('meta[property="og:title"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let price = $('.a-offscreen').first().text().trim();
        let imageUrl = $('#landingImage').attr('src');

        // If meta tags are missing, log it for debugging and use alternative selectors
        if (!title || !price || !description || !imageUrl) {
            console.log('Meta tags not found. Checking alternative selectors.');
            title = title || $('title').text();
            price = price || $('.a-price-whole').first().text().trim() + '.' + $('.a-price-fraction').first().text().trim();
            description = description || $('meta[name="description"]').attr('content');
            imageUrl = imageUrl || $('#landingImage').attr('data-old-hires');
        }

        // Ensure the image URL is complete
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://${imageUrl}`;
        }

        // Log the extracted values for debugging
        console.log('Extracted title:', title);
        console.log('Extracted price:', price);
        console.log('Extracted description:', description);
        console.log('Extracted image URL:', imageUrl);

        const productDetails = {
            title: title ? title.trim() : '',
            price: price ? price.trim() : '',
            description: description ? description.trim() : '',
            imageUrl: imageUrl ? imageUrl.trim() : ''
        };

        res.status(200).json({ message: 'Product details scraped successfully', data: productDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/scrape-and-add-product', async (req, res) => {
    try {
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        // Fetch the HTML of the page with a User-Agent header
        const response = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const html = response.data;

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract product details using Cheerio
        let title = $('meta[property="og:title"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let price = $('meta[property="og:price:price"]').attr('content');
        // If meta tags are missing, log it for debugging and use alternative selectors
        if (!title || !price || !description) {
            console.log('Meta tags not found. Checking alternative selectors.');
            title = title || $('title').text();
            price = price || $('.ProductIntroHeadPrice__head-mainprice span').text().trim(); // Adjust this selector based on the HTML structure
            description = description || $('meta[name="description"]').attr('content');
        }

        // Log the extracted values for debugging
        console.log('Extracted title:', title);
        console.log('Extracted price:', price);
        console.log('Extracted description:', description);

        // Create a new Product document
        const product = new Product({ title, description, price });

        // Save the product to the database
        await product.save();

        res.status(201).json({ message: 'Product added successfully', data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route handler for deleting a product by its title
app.delete('/delete-product/:title', async (req, res) => {
    try {
        const title = req.params.title;

        if (!title) {
            return res.status(400).json({ error: 'Product title is required' });
        }

        // Find the product by its title and delete it
        const deletedProduct = await Product.findOneAndDelete({ title });

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully', data: deletedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/scrape-aliexpress', async (req, res) => {
    try {
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        // Fetch the HTML of the page with a User-Agent header
        const response = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const html = response.data;

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract product details using Cheerio
        let title = $('meta[property="og:title"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let imageUrl = $('meta[property="og:image"]').attr('content');

        // If meta tags are missing, log it for debugging and use alternative selectors
        if (!title || !description || !imageUrl) {
            console.log('Meta tags not found. Checking alternative selectors.');

            title = title || $('title').text();
            description = description || $('meta[name="description"]').attr('content');

            // Alternative selectors for image URL
            if (!imageUrl) {
                imageUrl = $('img').first().attr('src');
            }
        }

        // Ensure the image URL is complete
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https:${imageUrl}`;
        }

        // Log the extracted values for debugging
        console.log('Extracted title:', title);
        console.log('Extracted description:', description);
        console.log('Extracted image URL:', imageUrl);

        // Prepare the product details
        const productDetails = {
            title: title ? title.trim() : '',
            description: description ? description.trim() : '',
            imageUrl: imageUrl ? imageUrl.trim() : ''
        };

        // Respond with the product details
        res.status(200).json({ message: 'Product details scraped successfully', data: productDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/scrape-ebay', async (req, res) => {
    try {
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        // Fetch the HTML of the page with a User-Agent header
        const response = await axios.get(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const html = response.data;

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract product details using Cheerio
        let title = $('meta[property="og:title"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let imageUrl = $('meta[property="og:image"]').attr('content');

        // If meta tags are missing, log it for debugging and use alternative selectors
        if (!title || !description || !imageUrl) {
            console.log('Meta tags not found. Checking alternative selectors.');

            title = title || $('h1[itemprop="name"]').text().trim();
            description = description || $('meta[name="description"]').attr('content');

            // Alternative selectors for image URL
            if (!imageUrl) {
                imageUrl = $('img#icImg').attr('src');
            }
            if (!imageUrl) {
                imageUrl = $('img[src*="i.ebayimg.com"]').attr('src');
            }
        }

        // Ensure the image URL is complete
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https:${imageUrl}`;
        }

        // Log the extracted values for debugging
        console.log('Extracted title:', title);
        console.log('Extracted description:', description);
        console.log('Extracted image URL:', imageUrl);

        // Check if any of the required details are missing
        if (!title || !description || !imageUrl) {
            return res.status(404).json({ error: 'Product details not found or the page structure has been updated' });
        }

        const productDetails = {
            title: title ? title.trim() : '',
            description: description ? description.trim() : '',
            imageUrl: imageUrl ? imageUrl.trim() : ''
        };
        res.status(200).json({ message: 'Product details scraped successfully', data: productDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.listen(PORT, () => {
    console.log(`App is listening to port: ${PORT}`);
});
