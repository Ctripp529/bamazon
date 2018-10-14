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
  readProducts();
});

function readProducts() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    console.log('________Bamazon Inventory________');
    

    var productInfo = '';
    for (var i = 0; i < res.length; i++) {
      productInfo = '';
      productInfo += 'Item ID: ' + res[i].id + ' | ';
      productInfo += 'Product Name: ' + res[i].product_names + ' | ';
      productInfo += 'Department: ' + res[i].department_name + ' | ';
      productInfo += 'Price: $' + res[i].price + '\n';

      console.log(productInfo);

    }
    shop();

  });
}

var shop = function () {
  // connection.query("SELECT * FROM products", function (err, res) {
  //   if (err) throw err;
  inquirer.prompt([{
      name: "id",
      type: "input",
      message: "What is the ID of the item?",
      validate: function (value) {
        if (isNaN(value) === false) {
          return true;
        } else {
          console.log("\n___________________");
          console.log("\nPlease enter an item ID!")
          return false;
        }
      }
    },
    {
      name: "quantity",
      type: "input",
      message: "How many would you like?",
      validate: function (value) {
        if (isNaN(value) === false) {
          return true;
        } else {
          console.log("\n___________________");
          console.log("\nPlease enter an item quantity!")
          return false;
        }
      }
    }
  ]).then(function (input) {
    var itemQty = parseInt(input.quantity);

    connection.query("SELECT * FROM products WHERE ?", [{id: input.id}], function (err, data) {
      if (err) throw err;

      //  for (var i=0; i < data.length; i++){

      if (data[0].stock_quantity < input.quantity) {
        console.log("________Insufficient Quantity________\n");
        
        readProducts();
      } else {
        var newQty = data[0].stock_quantity - itemQty;
        var cost = data[0].price * itemQty;

        connection.query("UPDATE products SET stock_quantity = ? WHERE id = ? ", [newQty, input.id], function (err, data) {
          if (err) {
            throw err;
          } else {
            console.log("Great we have your item in stock!");
            console.log("Your total is $" + cost + "! Thanks!");
            console.log("_________________________________");
            inquirer.prompt({
              name: "keepShopping",
              type: "confirm",
              message: "Would you like to buy more items?"
            }).then(function (input) {
              if (input.keepShopping === true) {
                console.log("Great! Let's buy some more!");
                readProducts();
              } else {
                connection.end();
              }
            });
          }
        });

      }
    });
  });
};