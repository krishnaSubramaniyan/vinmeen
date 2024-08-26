const path        = require("path");
const bodyParser  = require("body-parser");
const express     = require("express");
const app         = express();
require("dotenv").config({debug : process.env.DOTENV_DEBUG === 'true'});
const signUp      = require("./Routes/signUp.js");
const login       = require("./Routes/login.js");
const addProduct  = require("./Routes/addProduct.js");
const search      = require("./Routes/search.js");
const viewProduct = require("./Routes/viewProduct.js");
const sendRequest = require("./Routes/sendRequest.js");
const listProduct = require("./Routes/listProduct.js");

//public folder
app.use(express.static("public"));
app.use(express.static("product_images"));

//view engin
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));

//body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// slash route
app.get('/',(req, res)=>{
    res.render("index.ejs");
})

//signup
app.use('/signup',signUp);

//login
app.use('/login',login);

//addProduct
app.use('/addproduct', addProduct);

//search product
app.use('/search', search);

//view product
app.use('/viewproduct', viewProduct);

//send product request
app.use('/sendrequest', sendRequest);

//list product
app.use('/listproduct', listProduct);


//listening port
const port = process.env.PORT || 8080;
app.listen(port,(err)=>{
    console.log(`listening on port ${port}`);
});

