const fs = require('fs');
const checklist = require('../model/checklistModel');

exports.uploadImages = async (req, res) => {
    try {
        const files = req.files;

        const projectId = req.session.projectId;
        
        const imagePromises = files.map(file => {
            const image = new checklist({
                projectId:projectId,
                image: {
                    data: fs.readFileSync(file.path),
                    contentType: file.mimetype,
                },
            });
            
            return image.save();
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
        const images = await checklist.find({ projectId: projectId }, 'image contentType');

        // Map the image data and send it as a JSON response
        const imageData = images.map(image => {
            return {
                contentType: image.contentType,
                data: image.image.data
            };
        });

        res.json({ images: imageData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching images.');
    }
};
