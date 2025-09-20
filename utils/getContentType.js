import path from 'node:path'

export function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.html') {
        return 'text/html';
    } else if (ext === '.css') {
        return 'text/css'
    } else if (ext === '.js') {
        return 'text/javascript'
    } else if (ext === '.json') {
        return 'application/json'
    } else if (ext === '.png') {
        return 'image/png'
    }
}