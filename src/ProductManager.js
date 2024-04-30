const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.loadProducts();
    }

    loadProducts() {
        try {
            const data = fs.readFileSync(this.path, 'utf8');
            this.products = JSON.parse(data);
        } catch (err) {
            console.error('Error loading products:', err);
        }
    }

    saveProducts() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
        } catch (err) {
            console.error('Error saving products:', err);
        }
    }

    addProduct(product) {
        const newId = this.products.length > 0 ? this.products[this.products.length - 1].ID + 1 : 1;
        product.ID = newId;
        this.products.push(product);
        this.saveProducts();
    }

    getProduct() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.ID === id);
    }

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(product => product.ID === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedProduct };
            this.saveProducts();
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(product => product.ID !== id);
        this.saveProducts();
    }
}

// Uso de la clase
const productManager = new ProductManager('./data/productos.json');

// Añadir el producto
productManager.addProduct({
    Title: 'Producto de ejemplo',
    Description: 'Descripción del producto',
    Price: 10.99,
    Thumbnail: 'https://ejemplo.com/imagen.jpg',
    Code: 'ABC123',
    Stock: 100
});

// ObtienE todos los productos
const allProducts = productManager.getProduct();
console.log(allProducts);

// Busca un producto por ID
const productById = productManager.getProductById(1);
console.log(productById);

// Actualiza un producto
productManager.updateProduct(1, { Price: 11.99 });

// Elimina un producto
productManager.deleteProduct(1);

module.exports = ProductManager;
