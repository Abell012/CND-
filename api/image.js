const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    const id = req.url.replace('/', '').split('?')[0]; // ambil ID dari path

    if (!id) return res.status(400).send('Invalid image ID');

    const filePath = path.join('/tmp', id);
    
    try {
        if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            res.setHeader('Content-Type', 'image/jpeg');
            return res.send(imageBuffer);
        } else {
            return res.status(404).send('Image not found or expired');
        }
    } catch (error) {
        return res.status(500).send('Internal server error');
    }
};
