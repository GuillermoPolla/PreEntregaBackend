const express = require('express');
const ProductManager = require('./ProductManager');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Router para /api/products
const productsRouter = express.Router();

// Ruta GET /api/products/
productsRouter.get('/', async (req, res) => {
    try {
        let limit = req.query.limit;
        let products = await productManager.getProduct();
        if (limit) {
            products = products.slice(0, parseInt(limit));
        }
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta GET /api/products/:pid
productsRouter.get('/:pid', async (req, res) => {
    try {
        let pid = parseInt(req.params.pid);
        let product = await productManager.getProductById(pid);
        if (product) {
            res.json({ product });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta POST /api/products/
productsRouter.post('/', async (req, res) => {
    try {
        const { Title, Description, Code, Price, Stock, Category, Thumbnails } = req.body;
        if (!Title || !Description || !Code || !Price || !Stock || !Category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newProduct = {
            ID: uuidv4(),
            Title,
            Description,
            Code,
            Price,
            Status: true,
            Stock,
            Category,
            Thumbnails: Thumbnails || []
        };
        await productManager.addProduct(newProduct);
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta PUT /api/products/:pid
productsRouter.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const updatedProduct = req.body;
        await productManager.updateProduct(pid, updatedProduct);
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta DELETE /api/products/:pid
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        await productManager.deleteProduct(pid);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Asignar el router de productos a /api/products
app.use('/api/products', productsRouter);

// Router para /api/carts
const cartsRouter = express.Router();

// Ruta POST /api/carts/
cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = {
            ID: uuidv4(),
            Products: []
        };
        // Persistir el nuevo carrito en el archivo
        await fs.writeFile('carrito.json', JSON.stringify(newCart, null, 2));
        res.status(201).json({ message: 'Cart created successfully', cart: newCart });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta GET /api/carts/:cid
cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const data = await fs.readFile('carrito.json', 'utf-8');
        const carts = JSON.parse(data);
        const cart = carts.find((cart) => cart.ID === cid);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ruta POST /api/carts/:cid/product/:pid
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const data = await fs.readFile('carrito.json', 'utf-8');
        let carts = JSON.parse(data);
        const cartIndex = carts.findIndex((cart) => cart.ID === cid);
        if (cartIndex !== -1) {
            let cart = carts[cartIndex];
            const existingProductIndex = cart.Products.findIndex((product) => product.id === pid);
            if (existingProductIndex !== -1) {
                cart.Products[existingProductIndex].Quantity++;
            } else {
                cart.Products.push({ id: pid, Quantity: 1 });
            }
            // Actualizar el archivo con el carrito modificado
            carts[cartIndex] = cart;
            await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2));
            res.json({ message: 'Product added to cart successfully' });
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Asignar el router de carritos a /api/carts
app.use('/api/carts', cartsRouter);

// Iniciar el servidor en el puerto 8080
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
