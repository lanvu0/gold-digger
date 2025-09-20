import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getContentType } from './utils/getContentType.js';

const PORT = 8000;

const server = http.createServer(async (req, res) => {
    // Get absolute path to the public dir
    const publicDir = path.resolve('./public');
    let filePath = path.join('public', req.url === '/' ? 'index.html' : req.url);

    // Sanitise the path to prevent directory traversal
    filePath = path.normalize(filePath);

    if (!filePath.startsWith(publicDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain'});
        res.end("403 Forbidden");
        return;
    }
    
    if (req.method === 'GET') {
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
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end("Internal Server Error");
            }
        }
           
    } else if (req.method === 'POST') {
        // Receive amount to invest
        

    }
    
})

server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

