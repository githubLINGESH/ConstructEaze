const e_products = require('../model/prodModel');
const path = require('path');

exports.getaccountpage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'accst.html'));
};

exports.getVendorNames = async (req, res) => {
    try {
        const projectId = req.session.projectId;

        const vendorNames = await e_products.distinct('vendor.vendorName', { 'vendor.projectId': projectId });
        res.json(vendorNames);
        } catch (error) {
        console.error('Error fetching vendor names:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
    };
    

exports.getProductNames = async (req, res) => {
    try {

        const projectId = req.session.projectId;
        const productNames = await e_products.find({ 'projectId': projectId }).distinct("products.nameOfMaterial");
        res.json(productNames);
    } catch (error) {
        console.error('Error fetching product names:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getVendorDetails = async (req, res) => {
    try {
        const vendorName = req.params.vendorName;
        const vendorDetails = await e_products.find({ Vendor_name: vendorName });
        res.json(vendorDetails);
    } catch (error) {
        console.error('Error fetching vendor details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProductDetails = async (req, res) => {
    try {
        const productName = req.params.productName;
        const productDetails = await e_products.find({ Name_of_Material: productName });
        res.json(productDetails);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
