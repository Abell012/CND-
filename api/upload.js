const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        if (!req.body || !req.body.image) {
            return res.status(400).json({ error: 'No image provided' });
        }
        
        const base64Data = req.body.image.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        
        if (buffer.length > 4.5 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size exceeds 4.5 MB limit' });
        }
        
        const id = uuidv4().substring(0, 6);
        const filePath = path.join('/tmp', id);
        
        fs.writeFileSync(filePath, buffer);
        
        setTimeout(() => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }, 3 * 60 * 60 * 1000);
        
        return res.status(200).json({ id });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
