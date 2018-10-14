var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    managerTasks();
});

function managerTasks() {
    console.log("________Bamazon Manager________");
    inquirer.prompt([{
        type: "list",
        name: "tasks",
        message: "What would you like to do today?",
        choices: [
            'View Products for Sale',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product',
            'Leave'
        ]

    }]).then(function (answer) {
        switch (answer.tasks) {
            case 'View Products for Sale':
                productList();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                newInventory();
                break;
            case 'Add New Product':
                newProduct();
                break;
            case 'Leave':
                connection.end();
                break;
        }
    });
}

function productList() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log('\n_______________________Inventory_______________________\n');


        var productInfo = '';
        for (var i = 0; i < res.length; i++) {
            productInfo = '';
            productInfo += 'Item ID: ' + res[i].id + ' | ';
            productInfo += 'Product Name: ' + res[i].product_names + ' | ';
            productInfo += 'Department: ' + res[i].department_name + ' | ';
            productInfo += 'Price: $' + res[i].price + ' | ';
            productInfo += 'Quantity: ' + res[i].stock_quantity + '\n';


            console.log(productInfo);
           
        }
        console.log("________________________________");
        leave();
    })
};

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        console.log('\n_______________________Low Inventory_______________________\n');
        console.log("Products with a quantity less than 5\n");

        var productInfo = '';
        for (var i = 0; i < res.length; i++) {
            productInfo = '';
            productInfo += 'Item ID: ' + res[i].id + ' | ';
            productInfo += 'Product Name: ' + res[i].product_names + ' | ';
            productInfo += 'Department: ' + res[i].department_name + ' | ';
            productInfo += 'Price: $' + res[i].price + ' | ';
            productInfo += 'Quantity: ' + res[i].stock_quantity + '\n';


            console.log(productInfo);
            

        }
        console.log("________________________________");
    leave();
    })
   
};

function newInventory() {
    // productList();
    inquirer.prompt([{
            name: "id",
            type: "input",
            message: "Pick the ID of the item you want to update."
        },
        {
            name: "addQty",
            type: "input",
            message: "How many are you adding to inventory?"
        }
    ]).then(function (answer) {
            var newQty = (parseInt(answer.addQty));
            connection.query("SELECT * FROM products WHERE ?", [{id: answer.id}], function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        var updateQty = (parseInt(res[0].stock_quantity) + newQty);
                    }
                    connection.query("UPDATE products SET stock_quantity = ? WHERE id = ? ", [updateQty, answer.id], function (err, data) {
                            if (err) {
                                throw err;
                            } else {
                                
                                console.log("\n____________________Updated Inventory Complete____________________\n")
                                leave();
                            }
                        }


                    
                )

            })
    })};

    function newProduct(){
        inquirer.prompt([{
            name:"item",
            type:"input",
            message:"What is the product name?"
        },
        {
            name:"itemDept",
            type:"input",
            message:"What department will this item belong to?"
        },
        {
            name:"itemPrice",
            type:"input",
            message:"What will this item cost?(no symbols)"
        },
        {
            name:"itemQty",
            type:"input",
            message: "What is the quantity of this item?"

        }]).then(function(answer){
            var newItem = answer.item;
            var newDept = answer.itemDept;
            var newPrice = answer.itemPrice;
            var newQty = answer.itemQty;

            connection.query("INSERT INTO products (product_names, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [newItem, newDept, newPrice, newQty], function(err, res){
                if (err){
                    throw err;
                } else {
                    console.log("\nYou added " + newItem + "'s\n");
                    leave();
                }
            })

        })

    }
    function leave(){
        inquirer.prompt({
            name: "continue",
            type: "confirm",
            message: "Would you like to go to another Task?"
          }).then(function (input) {
            if (input.continue === true) {
              
              managerTasks();
            } else {
              connection.end();
            }
          });
    }

