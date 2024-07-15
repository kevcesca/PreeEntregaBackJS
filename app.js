const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;

const pathProductos = './data/productos.json';
const pathCarrito = './data/carrito.json';

app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON

// Función para leer productos desde el archivo
const leerProductos = () => {
    const data = fs.readFileSync(pathProductos);
    return JSON.parse(data);
};

// Función  para escribir productos en el archivo
const escribirProductos = (products) => {
    fs.writeFileSync(pathProductos, JSON.stringify(products, null, 2));
};

// Función para leer carritos desde el archivo
const leerCarrito = () => {
    const data = fs.readFileSync(pathCarrito);
    return JSON.parse(data);
};

// Función para escribir carritos en el archivo
const escribirCarrito = (carts) => {
    fs.writeFileSync(pathCarrito, JSON.stringify(carts, null, 2));
};

// Ruta raíz que muestra las rutas disponibles
app.get('/', (req, res) => {
    res.send(`
        <h1>Rutas Disponibles</h1>
        <ul>
            <li>GET /api/products - Listar todos los productos</li>
            <li>GET /api/products/:pid - Obtener un producto por ID</li>
            <li>POST /api/products - Agregar un nuevo producto</li>
            <li>PUT /api/products/:pid - Actualizar un producto por ID</li>
            <li>DELETE /api/products/:pid - Eliminar un producto por ID</li>
            <li>GET /api/carts/:cid - Listar productos en un carrito por ID</li>
            <li>POST /api/carts - Crear un nuevo carrito</li>
            <li>POST /api/carts/:cid/product/:pid - Agregar un producto a un carrito</li>
        </ul>
    `);
});



// Rutas para productos

// Ruta GET /api/products - Lista todos los productos
app.get('/api/products', (req, res) => {
    const products = leerProductos();
    res.json(products);
});

// Ruta GET /api/products/:pid - Obtiene un producto por ID
app.get('/api/products/:pid', (req, res) => {
    const products = leerProductos();
    const product = products.find(p => p.id == req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
});

// Ruta POST /api/products - Agrega un nuevo producto
app.post('/api/products', (req, res) => {
    const products = leerProductos();
    const newProduct = req.body;
    newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
    products.push(newProduct);
    escribirProductos(products);
    res.status(201).json(newProduct);
});

// Ruta PUT /api/products/:pid - Actualiza un producto por ID
app.put('/api/products/:pid', (req, res) => {
    const products = leerProductos();
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index !== -1) {
        const updatedProduct = { ...products[index], ...req.body };
        products[index] = updatedProduct;
        escribirProductos(products);
        res.json(updatedProduct);
    } else {
        res.status(404).send('Product not found');
    }
});

// Ruta DELETE /api/products/:pid - Elimina un producto por ID
app.delete('/api/products/:pid', (req, res) => {
    const products = leerProductos();
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index !== -1) {
        const deletedProduct = products.splice(index, 1);
        escribirProductos(products);
        res.json(deletedProduct);
    } else {
        res.status(404).send('Product not found');
    }
});



// Rutas para carritos

// Ruta GET /api/carts/:cid - Lista productos en un carrito por ID
app.get('/api/carts/:cid', (req, res) => {
    const carts = leerCarrito();
    const cart = carts.find(c => c.id == req.params.cid);
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Cart not found');
    }
});

// Ruta POST /api/carts - Crea un nuevo carrito
app.post('/api/carts', (req, res) => {
    const carts = leerCarrito();
    const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: req.body.products || [] };
    carts.push(newCart);
    escribirCarrito(carts);
    res.status(201).json(newCart);
});

// Ruta POST /api/carts/:cid/product/:pid - Agrega un producto a un carrito
app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const carts = leerCarrito();
    const cart = carts.find(c => c.id == req.params.cid);
    if (!cart) {
        return res.status(404).send('Cart not found');
    }

    const products = leerProductos();
    const product = products.find(p => p.id == req.params.pid);
    if (!product) {
        return res.status(404).send('Product not found');
    }

    const productIndex = cart.products.findIndex(p => p.id == product.id);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity += req.body.quantity || 1;
    } else {
        cart.products.push({ id: product.id, quantity: req.body.quantity || 1 });
    }

    escribirCarrito(carts);
    res.json(cart);
});


// Maneo de archivos y levantar el servidor

// Crear la carpeta data si no existe
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

// Crear archivos JSON si no existen
if (!fs.existsSync(pathProductos)) {
    fs.writeFileSync(pathProductos, JSON.stringify([]));
}

if (!fs.existsSync(pathCarrito)) {
    fs.writeFileSync(pathCarrito, JSON.stringify([]));
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
