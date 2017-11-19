// Requires
const inquirer = require('inquirer');
const bamazonData = require('./lib/bamazonData');
const clear = require('clear');

// Opens a connection to the database and displays the welcome message.
clear();
bamazonData.openConnection(welcomeMessage);


// Verifies if the customer wants to complete a purchase.
function verifyPurchase(productName, productPrice, productQuantity) {
    var question = [
        {
            type: 'input',
            name: 'yesOrNo',
            message: 
            `Are you sure you'd like to purchase ${ productQuantity } ${ productName }(s) for $${ productPrice * productQuantity }? ('y/n')`,
            validate: function(val) {
                var lower = val.toLowerCase();
                if(lower === 'y' || lower === 'n') return true;
                return 'You must enter y or n';
            }
        },
    ];
    inquirer.prompt(question).then(answer => {
        if(answer.yesOrNo === 'y') {
            bamazonData.removeProductFromDatabase(productName, productQuantity, displayDepartments);
        } else {
            displayDepartments();
        }
    });
    
}

// Displays the products for a customer to purchase
function selectProduct(products) {
    clear();
    var choices = [];
    for(var i = 0; i < products.length; i++) choices.push(products[i].product_name + " | $" + products[i].price);
    var questions = [
        {
            name: "product",
            message: "What would you like to buy?",
            type: 'list',
            choices: choices,
        },
        {
            name: "quantity",
            message: "How many would you like?",
            type: 'input',
            validate: (value) => {
                var valid = !Number.isNaN(parseFloat(value));
                return valid || "Please enter a number.";
            }
        }
    ];
    inquirer.prompt(questions).then(answer => {
        // Grabs the product name which is displayed before the |
        var productName = answer.product.substring(0, answer.product.indexOf('|')).trim();
        // Price is after | 
        var productPrice = answer.product.substring(answer.product.indexOf('$') + 1);
        
        verifyPurchase(productName, productPrice, answer.quantity);
    });
}

// Displays the departments for the user to select from.
function selectDepartment(data) {
    var choices = [];
    for(var i = 0; i < data.length; i++) choices.push(data[i].department_name);
    choices.push('Quit');
    var question = [
        {
            name: 'department_select',
            type: 'list',
            message: "Please select the department you'd like to shop in.",
            choices: choices,
        }
    ];
    inquirer.prompt(question).then(answer => {
        if(answer.department_select == 'Quit') {
            console.log('Goodbye!');
            bamazonData.closeConnection();
            process.exit();
        }
        var products = bamazonData.getProductsByDepartmentName(answer.department_select, (products) => {
            selectProduct(products);
        });
    })
}

// Displays a welcome message and then the departments for a user to select from
function welcomeMessage() {
    console.log(
        `Welcome to Bamazon!  The best online shopping experience from a command line!\n`
    );
    displayDepartments();
}


// Displays the departments
function displayDepartments() {
    bamazonData.getDepartments(data => {
        selectDepartment(data);        
    });
}