import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getContentType } from './utils/getContentType.js';
import { populateInvestObj } from './utils/populateInvestObj.js';
import { getGoldPrice } from './utils/getGoldPrice.js';

const PORT = process.env.PORT || 8000;

const server = http.createServer(async (req, res) => {
    console.log(`Request for: ${req.url}`);

    // Open connection for live gold price stream
    if (req.url === '/gold-price-stream') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        });

        const sendPrice = async () => {
            try {
                const priceData = getGoldPrice();
                res.write(`data: ${JSON.stringify({ event: 'gold-price-updated', price: priceData})}\n\n`);
            } catch (err) {
                console.error(`Error fetching gold price: ${err}`);
                res.write(`event: error\ndata: ${JSON.stringify({ message: 'Failed to fetch price' })}\n\n`);
            }
        };

        // Send price immediately on connection
        sendPrice();

        // Set up interval to update price every 2 seconds
        const intervalId = setInterval(sendPrice, 2000);

        // Clean up when client disconnects
        req.on('close', () => {
            console.log('Client disconnected from SSE stream');
            clearInterval(intervalId);
            res.end();
        })
        return;
    }

    // Get absolute path to the public dir
    const publicDir = path.resolve('./public');
    let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);

    // Sanitise the path to prevent directory traversal
    filePath = path.normalize(filePath);
    
    if (!filePath.startsWith(publicDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain'});
        res.end("403 Forbidden");
        return;
    }
    
    if (req.method === 'GET') {    

        // Handle request for transaction data
        if (req.url === '/transactions') {
            try {
                const dataFilePath = path.join('data', 'clientData.json');
                const fileContent = await fs.readFile(dataFilePath, 'utf8');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(fileContent);
            } catch (err) {
                console.error(`Could not read transaction data: ${err}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Could not retrieve transaction history' }));
            }
            return;
        }



        // Serve public assets
        try {
            const data = await fs.readFile(filePath);
            const contentType = getContentType(filePath);

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data)

        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log(`File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end("404 Not Found");
            } else {
                console.log(`Server error: ${err}`);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Internal Server Error");
            }
        }
           
    } else if (req.method === 'POST' && req.url === '/invest') {
        // Receive amount to invest

        // Hold body chunks
        const chunks = [];

        // Listen for 'data' event
        req.on('data', chunk => chunks.push(chunk));

        // Catch network errors during request stream
        req.on('error', (err) => {
            console.error(`Request stream error: ${err}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        })

        // Listen for 'end' event (all data has arrived)
        req.on('end', async () => {
            try {
                // Concatenate all buffer chunks into one, then convert to string
                const bodyString = Buffer.concat(chunks).toString();

                // Handle case where body is empty
                if (!bodyString) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Request bodycannot be empty' }));
                }

                // Parse JSON string into object
                const parsedData = JSON.parse(bodyString);

                console.log('Received data:', parsedData);

                // Populate the object
                const investObj = populateInvestObj(parsedData);

                const dataFilePath = path.join('data', 'clientData.json');
                // Get current JSON data
                const fileContent = await fs.readFile(dataFilePath, 'utf8');
                const allClientData = JSON.parse(fileContent);

                // Push new investObj into JSON
                allClientData.push(investObj);

                await fs.writeFile(dataFilePath, JSON.stringify(allClientData, null, 2));

                console.log('Successfully saved to clientData.json');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Investment received successfully',
                    body: investObj
                }));
            } catch (err) {
                console.error(`Error processing request: ${err}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON data received' }));
            }
        })  
    };
    
})

server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

