const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');

const ADMIN_SECRET_KEY = "admin123";

app.use(express.json())
app.use(cors({
    origin: "*"
}))

//////////////////// create the connection with our db

mongoose.connect("mongodb://localhost:27017/admin");
mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!!!!');
});

///////////////////// create our modules 

const User = require('./models/User');
const Employee = require('./models/Employee');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
////////////////////////////////////////////// create the signup request////////////////////////////////////////  


app.post("/Signup", async (req, res) => {
    try {
        const { name, email, mdp } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "user exist" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(mdp, 10);
        
        // Create new user
        const newUser = await User.create({
            name,
            email,
            mdp: hashedPassword
        });

        // Generate token immediately after signup
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            "safatesthaha",
           
        );

        // Return success with token
        res.status(201).json({
            msg: "user created successfully",
            token: token,
            userId: newUser._id
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ msg: "Error creating user" });
    }
});

app.post("/register-admin", async (req, res) => {
    try {
        const { name, email, mdp, adminKey } = req.body;

        // Verify admin secret key
        if (adminKey !== ADMIN_SECRET_KEY) {
            return res.status(401).json({ message: "Unauthorized: Invalid admin key" });
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(mdp, 10);

        // Create new admin user
        const admin = new User({
            name,
            email,
            mdp: hashedPassword,
            role,
        });

        await admin.save();

        // Generate token for the new admin
        const token = jwt.sign(
            { userId: admin._id, email: admin.email, role: admin.role },
            "safatesthaha"
        );

        res.status(201).json({ 
            message: "Admin created successfully",
            token,
            adminId: admin._id
        });

    } catch (error) {
        console.error("Admin registration error:", error);
        res.status(500).json({ error: "Error creating admin" });
    }
});




app.post("/Login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(req.body.mdp, user.mdp);
        if (!isValidPassword) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

     
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied: Admin only" });
        }

        // Generate token for admin
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                role: user.role 
            },
            "safatesthaha",
            { expiresIn: '24h' }
        );

        // Send response
        res.status(200).json({ msg: "Login successful", token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: "Server error" });
    }
}); 


  ///////////////////////////////////////////////////////////USERS////////////////////////////////////////
  // Get all users
  app.get("/getusers", async (req, res) => {
    const users = await User.find();
    res.json(users);
  });
  
  // Add a new user
  app.post("/saveusers", async (req, res) => {
    const newuser= new User(req.body);
    await newuser.save();
    res.json(newuser);
  });
  
  // Update a user
  app.put("/updateusers/:id", async (req, res) => {
    const updatedusers = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedusers);
  });
  
  // Delete a user
  app.delete("/deleteusers/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "user deleted" });
  });
  
 ///////////////////////////////////////////////////////////////EMPLOYEES//////////////////////////////////////// 
  // Get all employees
app.get("/getEmployes", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employees", error: error.message });
    }
});

// Add a new employee
app.post("/saveEmployes", async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(500).json({ message: "Error creating employee", error: error.message });
    }
});

// Update an employee
app.put("/updateEmployes/:id", async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: "Error updating employee", error: error.message });
    }
});

// Delete an employee
app.delete("/deleteEmployes/:id", async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting employee", error: error.message });
    }
});
   

 //////////////////////////////////////////////////////////////CLIENT//////////////////////////////////////// 


// Get all clients
app.get('/getclients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/saveclients', async (req, res) => {
  const client = new Client(req.body);
  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update client
app.put('/updateclients/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete client
app.delete('/deleteclients/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create a blog only if the user is authenticated.  
// If you want only authenticated users to create a blog,  
// we need middleware that will verify if the token is correct.
// CHECK THE JWT BY FUNCTION VERIFY
// IT will determent if the user able to create or not 
// donc avec verifyjwt najmo nsécurisiw ay action get/post/delete... ya3NI nlimitiw lUSER 
// ya3ni win bech t7outha fonction hedhi bech tchoflk ken user 3ando token wale bech ya3mel l'action win hatito
const verifyJwt = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const decoded = jwt.verify(token, "safatesthaha");
        if (!decoded || decoded.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admin only" });
        }

        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(401).json({ msg: "Invalid token" });
    }
};


 ///////////////////////////////////////////////////////////////SUPPLIER/////////////////////////////////////// 


// Get all suppliers
app.get('/getsuppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new supplier
app.post('/savesuppliers', async (req, res) => {
  const supplier = new Supplier(req.body);
  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update supplier
app.put('/updatesuppliers/:id', async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete supplier
app.delete('/deletesuppliers/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


 ///////////////////////////////////////////////////////////////PRODUCT/////////////////////////////////////// 

// Get all products
app.get('/getproducts', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new product
app.post('/saveproducts', async (req, res) => {
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
app.put('/updateproducts/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
app.delete('/deleteproducts/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Middleware for admin-only routes
const verifyAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const decoded = jwt.verify(token, "safatesthaha");
        if (!decoded || decoded.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admin only" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ msg: "Invalid token" });
    }
};

// Middleware for authenticated users (both admin and regular users)
const verifyUser = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const decoded = jwt.verify(token, "safatesthaha");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ msg: "Invalid token" });
    }
};

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});