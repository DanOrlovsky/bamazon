var mysql = require('mysql');

// Configure connection
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon_db',
});


// Opens the connection to the database. 
function openConnection(callback) {
    connection.connect(function (err) {
        if (err) throw err;
        console.log('Connected to DB');
        callback();
    });
}

// Returns all the departments in the database
function getDepartments(callback) {
    connection.query('SELECT * FROM departments', (err, data, fields) => {
        if (err) throw err;
        callback(data);
    })
}


// Get's the department Id from a department name
function getDepartmentIdFromName(deptName, callback) {
    connection.query('SELECT id FROM departments WHERE ?', {
        department_name: deptName
    }, (err, data) => {
        if (err) throw err;
        callback(parseInt(data[0].id));
    });
}

// Get's the products id from its name
function getProductIdFromName(productName, callback) {
    connection.query('SELECT id, stock_quantity FROM products WHERE ?', {
        product_name: productName
    }, (err, data) => {
        if (err) throw err;
        callback(parseInt(data[0].id), parseInt(data[0].stock_quantity));
    });
}

// Displays a separator.
function separator() {
    console.log('-----------------------------------------------------------------------');
}

// Updates the quantity field of a product.
function removeProductFromDatabase(productName, buyQuantity, callback) {
    getProductIdFromName(productName, (id, quantity) => {
        // Checks if there's any products to remove
        if (quantity <= 0) {
            separator();
            console.log('Sorry, there\'s no more of these in stock.');
            separator();
            callback();
        // Checks if you're trying to buy more than is available.
        } else if(buyQuantity > quantity) {
            separator();
            console.log(`I'm sorry, there's only ${ quantity } ${ productName }(s) left in stock.`);
            separator();
            callback();
        } else {
            quantity-=buyQuantity;
            connection.query('UPDATE products SET ? WHERE ?', [{ stock_quantity: quantity }, { id: id }], (err, data) => {
                if (err) throw err;
                separator();
                console.log(`Congratulations!  You've purchased: ${ buyQuantity } ${ productName }(s)!`);
                separator();
                callback();
            });
        }
    });
}

// Get products from the department name
function getProductsByDepartmentName(deptName, callback) {
    getDepartmentIdFromName(deptName, (data) => {
        connection.query('SELECT * FROM products WHERE ?', {
            department_id: data
        }, (err, products) => {
            if (err) throw err;
            callback(products);
        })
    });
}

// Gets all products from the database
function getAllProducts(callback) {
    connection.query("SELECT * FROM products", (err, data) => {
        if(err) throw err;
        callback(data);
    })
}

// Adds a new product to the database
function addProductToDatabase(name, price, stock_quantity, deptId, callback) {
    var query = `INSERT INTO products (product_name, price, stock_quantity, department_id) VALUES('${name}', ${price}, ${stock_quantity}, ${ deptId })`;
    connection.query(query, (err, data) => { 
        if(err) throw err;
        callback(data);
    });
}
// Runs a custom query over the database
function customQuery(query, callback) {
    connection.query(query, (err, data) => {
        if(err) throw err;
        callback(data);
    });
}

// Closes the connection to the database
function closeConnection() {
    connection.end();
}


// 
module.exports = {
    getDepartments,
    openConnection,
    addProductToDatabase,
    getDepartmentIdFromName,
    getProductsByDepartmentName,
    removeProductFromDatabase,
    getAllProducts,
    customQuery,
    closeConnection,
};