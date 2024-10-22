// Modules
const multer = require('multer')
const path = require('path')

// Multer Storage Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/images')
    },
    filename: function (req, file, cb) {
        // Nombre unico + extension
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

// Export
const upload = multer({ storage: storage })

module.exports = upload
