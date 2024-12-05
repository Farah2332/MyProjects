import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [url, setUrl] = useState('');
    const [scrapedData, setScrapedData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (event) => {
        setUrl(event.target.value);
    };

    const handleScrape = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/scrape-shein?url=${url}`);
            setScrapedData(response.data.data);
        } catch (error) {
            console.error('Error scraping data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Scrape Shein</h1>
            <input
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="Enter Shein product URL"
            />
            <button onClick={handleScrape} disabled={loading}>
                {loading ? 'Scraping...' : 'Scrape'}
            </button>
            {scrapedData && (
                <div>
                    <h2>Scraped Data</h2>
                    <p>Title: {scrapedData.title}</p>
                    <p>Price: {scrapedData.price}</p>
                    <p>Description: {scrapedData.description}</p>
                </div>
            )}
        </div>
    );
};

export default Home;
