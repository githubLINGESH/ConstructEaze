const fs = require('fs');
const util = require('util');
const checklist = require('../model/checklistModel');

// Promisify the fs.unlink function to use it with async/await
const unlinkFile = util.promisify(fs.unlink);

exports.uploadFiles = async (req, res) => {
    try {
        const files = req.files;
        const projectId = req.session.projectId;

        const filePromises = files.map(async file => {
            try {
                if (!file || !file.path) {
                    throw new Error('Invalid file data');
                }

                const document = new checklist({
                    projectId: projectId,
                    files: [{
                        data: fs.readFileSync(file.path),
                        contentType: file.mimetype,
                    }],
                });

                await document.save();

                // Delete the file from the local file system
                await unlinkFile(file.path);
            } catch (uploadError) {
                console.error(`Error uploading file: ${uploadError.message}`, file);
            }
        });

        await Promise.all(filePromises);

        res.send('Files uploaded successfully.');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send(err);
    }
};



exports.getFiles = async (req, res) => {
    try {
        const projectId = req.session.projectId;
        // Find and retrieve all file documents from the database based on project id
        const files = await checklist.find({ projectId: projectId }, 'files.contentType files.data');

        // Map the file data and send it as a JSON response
        const fileData = files.map(file => {
            if (file.files && Array.isArray(file.files) && file.files.length > 0 && file.files[0].data) {
                // Convert buffer to base64 string
                const base64Data = file.files[0].data.toString('base64');
                return {
                    _id: file._id, // Use file._id instead of files[0]._id
                    contentType: file.files[0].contentType,
                    data: base64Data
                };
            } else {
                console.error(`File data missing or invalid structure for file with id ${file._id}`, file);
                return null;
            }
        });


        const validFiles = fileData.filter(Boolean);
        res.json({ files: validFiles });

        // Log the information about files with missing or invalid data
        const invalidFiles = fileData.filter(file => !file);
        if (invalidFiles.length > 0) {
            console.error(`${invalidFiles.length} files with missing or invalid data:`, invalidFiles);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching files.');
    }
};




exports.removeFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        await checklist.findByIdAndDelete(fileId);
        res.status(200).send('File deleted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting file.');
    }
};
