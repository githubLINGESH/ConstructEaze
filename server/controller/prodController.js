const path = require('path');
const e_products = require('../model/prodModel');


exports.getProductPage = (req, res) => {
res.sendFile(path.join(__dirname, '..', '..', 'prod.html'));
};

exports.submitMaterial = async (req, res) => {
   
      const {
        Date_o,
        Vendor_name,
        Name_of_Material,
        Required_quantity,
      } = req.body;
      
      console.log('Vendor_name:', Vendor_name);
      console.log('Name_of_Material:', Name_of_Material);

  
      const materialInward = await e_products.findOne({ Vendor_name, Name_of_Material });
  
      if (!materialInward) {
        return res.status(404).json({ error: 'Material not found' });
      }
      const firm_name = materialInward.Firmname;
      const address = materialInward.Address;
      const Gst =materialInward.Gst;
      const phone=materialInward.Phone;
      const Item_code=materialInward.Item_code;
      const category=materialInward.Category;
      const unit=materialInward.Unit;

      
      try {
        const record = new e_products({
          //id: Number,
          Date_o: Date_o ,
          Date_i:null ,
          Date_u: null,
          flag: false,
          order: true,
          Vendor_name: Vendor_name,
          Firmname: firm_name,
          Address: address,
          Gst: Gst,
          Phone: phone,
          Item_code : Item_code,
          Name_of_Material: Name_of_Material,
          Category: category,
          Unit: unit,
          Unit_prize:null,
          Required_quantity: Required_quantity,
          Supplied_quantity: 0,
          Used: 0,
          Current_stock: 0,
          Price: null
      });
      await record.save();
      res.status(200).send("Record Updated successfully");
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).send('Error updating record.');
    }
  };


exports.getTasks = async (req, res) => {
try {
    const tasks = await e_products.find({flag : true});
    res.status(200).json(tasks);
} catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
}
};

exports.gettableTasks = async (req, res) => {
    try {
        const tasks = await e_products.find({order:true});
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }
    };

    exports.getProductOrders = async () => {
        try {
        const productOrders = await e_products.find();
        return productOrders;
        } catch (error) {
        throw error;
        }
    };
    
    // Function to add a new product order to the database
    exports.addProductOrder = async (productOrderData) => {
        try {
        // Perform any data validation or processing if needed
        const newProductOrder = new e_products(productOrderData);
        await newProductOrder.save();
        } catch (error) {
        throw error;
        }
    };

    exports.autosearchforprod = async (req, res) => {
        const query = req.query.term.toLowerCase();
        
        try {
          const productSuggestions = await e_products.find({ Name_of_Material: { $regex: query, $options: 'i' } })
              .select('Name_of_Material')
              .limit(10);
  
          const vendorSuggestions = await e_products.find({ Vendor_name: { $regex: query, $options: 'i' } })
              .select('Vendor_name')
              .limit(10);
  
          const productNames = productSuggestions.map(task => task.Name_of_Material);
          const vendorNames = vendorSuggestions.map(task => task.Vendor_name);
  
          // Concatenate product and vendor names
          const suggestions = [...productNames, ...vendorNames];
  
          res.json(suggestions);
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
            res.status(500).send('Error fetching autocomplete suggestions.');
        }
    };
