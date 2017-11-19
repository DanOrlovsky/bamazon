const inquirer = require('inquirer');
const bamazonData = require('./lib/bamazonData');
const clear = require('clear');
const Table = require('cli-table');
clear();

bamazonData.openConnection(welcomeMessage);

function displayOptions() {
    let option1 = 'View products for sale';
    let option2 = 'View low inventory';
    let option3 = 'Add to inventory';
    let option4 = 'Add product to inventory';
    let option5 = 'Quit.';
    let question = [
        {
            name: "options",
            type: "list",
            message: "What would you like to do?",
            choices: [
                option1,
                option2,
                option3,
                option4,
                option5,
            ]
        }
    ];

    inquirer.prompt(question).then((answer) => {
        switch(answer.options) {
            case option1:
                viewProducts();
                break;
            case option2:
                viewLowInventory();
                break;
            case option3:
                updateInventory();
                break;
            case option4:
                getNewProductDepartment();
                break;
            case option5:
                bamazonData.closeConnection();
                process.exit();
                break;
            default:
                break;
        }
    })
}
function keyWait(callback) {
    console.log('Press any key to continue');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', callback());
}

function welcomeMessage() {
    console.log("Welcome Bamazon manager!");
    displayOptions();
}
function displayDataInTable(data) {
    var table = new Table({
        head: ['Product name', 'Price', 'Quantity' ],
        colWidths: [30, 20, 10],
    });
    
    for(let i = 0; i < data.length; i++) {
        table.push([ data[i].product_name, "$" + data[i].price, data[i].stock_quantity ]);
    }
    console.log(table.toString());
}
function updateInventory() {
    bamazonData.getAllProducts((data) => {
        let choices = [];
        for(let i = 0; i < data.length; i++) {
            choices.push(data[i].product_name);
        }
        let questions = [
            {
                name: 'product',
                message: 'Which product would you like to update?',
                type: 'list',
                choices: choices,
            },
            {
                name: 'quantity',
                message: "What should the new quantity be?",
                type: 'input',
                validate: (value) => {
                    var valid = !Number.isNaN(parseFloat(value));
                    return valid || "Please enter a number.";
                }
            },
        ];
        inquirer.prompt(questions).then(answers => {
            let query = 'UPDATE products SET stock_quantity = ' + answers.quantity + ' WHERE product_name = ' + "'" + answers.product + "';";
            bamazonData.customQuery(query, () => {
                console.log("Your product was updated!");
                displayOptions();
            })
        });
    })
}
function viewProducts() {
    bamazonData.getAllProducts((data) => {
        displayDataInTable(data);
        displayOptions();
    });
}
function getNewProductDepartment() {
    let deptChoices = [];
    bamazonData.getDepartments((data) => {
        for(let i = 0; i < data.length; i++) {
            deptChoices.push(data[i].department_name);
        };
        let question = {
            name: 'department',
            message: "In which department will you be adding a product?",
            type: 'list',
            choices: deptChoices,
        }
        inquirer.prompt(question).then((answer) => {
            bamazonData.getDepartmentIdFromName(answer.department, (deptId) => {
                addProductToInventory(deptId);
            });
        })
    });
}

function addProductToInventory(deptId) {
    let questions = [
        {
            name: 'product_name',
            type: 'input',
            message: 'What is the name of the product?',
        },
        {
            name: 'stock_quantity',
            message: 'How many are you adding to the shelf?',
            type: 'input',
            validate: (value) => {
                var valid = !Number.isNaN(parseFloat(value));
                return valid || "Please enter a number.";
            }
        },
        {
            name: 'price',
            message: "What is the price of this item?",
            type: 'input',
            validate: (value) => {
                var valid = !Number.isNaN(parseFloat(value));
                return valid || "Please enter a number.";
            },
        }

    ];
    inquirer.prompt(questions).then((answers) => {
        bamazonData.addProductToDatabase(answers.product_name, answers.price, answers.stock_quantity, deptId, (data) => {
            console.log(answers.product_name + " has been successfully entered into the database!");
            displayOptions();
        })
    })
}

function viewLowInventory() {
    bamazonData.customQuery('SELECT * FROM products WHERE stock_quantity < 5', data => {
        displayDataInTable(data);
        displayOptions();
    });
}