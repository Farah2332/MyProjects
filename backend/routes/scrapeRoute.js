import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
app.use(cors());

const router = express.Router();

// Function to check if the HTML contains CAPTCHA indicators
const containsCaptcha = (html) => {
    return html.includes('captcha') || html.includes('Captcha');
};

// Mock function to simulate solving CAPTCHAs
const solveCaptcha = async () => {
    // Simulate solving CAPTCHA by returning a static value
    return 'mocked-captcha-solution';
};

router.get('/scrape', async (req, res) => {
    try {
        const bookUrl = req.query.url;

        if (!bookUrl) {
            return res.status(400).json({ error: 'Book URL is required' });
        }

        let response = await axios.get(bookUrl);
        let html = response.data;

        // Check if the response contains CAPTCHA indicators
        if (containsCaptcha(html)) {
            // Solve CAPTCHA
            const solvedCaptcha = await solveCaptcha();

            // Retry scraping with solved CAPTCHA
            response = await axios.get(bookUrl, { headers: { 'x-captcha-solution': solvedCaptcha } });
            html = response.data;

            // Check if the response still contains CAPTCHA indicators
            if (containsCaptcha(html)) {
                return res.status(503).json({ error: 'CAPTCHA detected. Unable to solve.' });
            }
        }

        const $ = cheerio.load(html);

        const title = $('#productTitle').text().trim();
        const author = $('.author a').text().trim();
        const publishYear = $('#productDetailsTable .a-color-secondary')
            .filter((i, el) => $(el).text().includes('Publication date'))
            .next().text().trim();

        if (!title || !author || !publishYear) {
            return res.status(404).json({ error: 'Book details not found or the page structure has been updated' });
        }

        const bookDetails = { title, author, publishYear };
        res.status(200).json({ message: 'Book details scraped successfully', data: bookDetails });
    } catch (error) {
        console.error(error);
        if (error.response) {
            if (error.response.status === 404) {
                res.status(404).json({ error: 'Book not found' });
            }
        } else if (error.code === 'ENOTFOUND') {
            res.status(404).json({ error: 'Invalid URL or website not found' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Endpoint for testing CAPTCHA handling
router.get('/test-scrape-captcha', async (req, res) => {
    try {
        // Simulate a URL that triggers CAPTCHA
        const bookUrl = 'https://example.com/captcha-page';

        let response = await axios.get(bookUrl);
        let html = response.data;

        // Check if the response contains CAPTCHA indicators
        if (containsCaptcha(html)) {
            // Solve CAPTCHA
            const solvedCaptcha = await solveCaptcha();

            // Retry scraping with solved CAPTCHA
            response = await axios.get(bookUrl, { headers: { 'x-captcha-solution': solvedCaptcha } });
            html = response.data;

            // Check if the response still contains CAPTCHA indicators
            if (containsCaptcha(html)) {
                return res.status(503).json({ error: 'CAPTCHA detected. Unable to solve.' });
            }
        }

        // If CAPTCHA handling is successful, return scraped data
        const $ = cheerio.load(html);
        const title = $('#productTitle').text().trim();
        const author = $('.author a').text().trim();
        const publishYear = $('#productDetailsTable .a-color-secondary')
            .filter((i, el) => $(el).text().includes('Publication date'))
            .next().text().trim();

        if (!title || !author || !publishYear) {
            return res.status(404).json({ error: 'Book details not found or the page structure has been updated' });
        }

        const bookDetails = { title, author, publishYear };
        res.status(200).json({ message: 'Book details scraped successfully', data: bookDetails });
    } catch (error) {
        console.error(error);
        if (error.response) {
            if (error.response.status === 404) {
                res.status(404).json({ error: 'Book not found' });
            }
        } else if (error.code === 'ENOTFOUND') {
            res.status(404).json({ error: 'Invalid URL or website not found' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
router.get('/scrape-shein', async (req, res) => {
    try {
        const productUrl = req.query.url;

        if (!productUrl) {
            return res.status(400).json({ error: 'Product URL is required' });
        }

        const response = await axios.get(productUrl);
        const html = response.data;
        const $ = cheerio.load(html);

        // Extract product details
        const title = $('h1.product-name').text().trim();
        const price = $('.product-price .price').text().trim();
        const description = $('div.product-description').text().trim();

        if (!title || !price || !description) {
            return res.status(404).json({ error: 'Product details not found or the page structure has been updated' });
        }

        const productDetails = { title, price, description };
        res.status(200).json({ message: 'Product details scraped successfully', data: productDetails });
    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});



app.use('/', router);

app.listen(5555, () => {
    console.log('Server is running on port 5555');
});

export default router;
