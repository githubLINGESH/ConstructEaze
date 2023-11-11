const fs = require('fs');
const util = require('util');
const drawing = require('../model/drawModel');

// Promisify the fs.unlink function to use it with async/await
const unlinkFile = util.promisify(fs.unlink);

exports.uploadImages = async (req, res) => {
    try {
        const files = req.files;
        const projectId = req.session.projectId;

        const imagePromises = files.map(async file => {
            const image = new drawing({
                projectId: projectId,
                image: {
                    data: fs.readFileSync(file.path),
                    contentType: file.mimetype,
                },
            });

            await image.save();

            // Delete the file from the local file system
            await unlinkFile(file.path);
        });

        await Promise.all(imagePromises);

        res.send('Images uploaded successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};


exports.getImages = async (req, res) => {
    try {
        const projectId = req.session.projectId;
        // Find and retrieve all image documents from the database based on project id
        const images = await drawing.find({ projectId: projectId }, 'image contentType');

        // Map the image data and send it as a JSON response
        const imageData = images.map(image => {
            // Convert buffer to base64 string
            const base64Data = image.image.data.toString('base64');
            return {
                _id: image._id,
                contentType: image.contentType,
                data: base64Data
            };
        });

        res.json({ images: imageData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching images.');
    }
};


exports.removeImage = async (req, res) => {
    try {
        const imageId = req.params.id;
        await drawing.findByIdAndDelete(imageId);
        res.status(200).send('Image deleted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting image.');
    }
};
