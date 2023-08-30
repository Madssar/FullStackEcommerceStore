const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: './config.env'});


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
db.connect((error)=>{
    if(error){
        console.log("Failed to connect with MySQL",error);
    }else{
        console.log("MySQL Connected")
    }

});

const app = express();

app.use(express.static('public'));
app.set('view-engine','ejs');

app.listen(3030,(err,result)=>{
    if (err) return "Connection failed";
    console.log("Connected with backend")
});


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

app.use(session({secret:"secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));


//calculate total. here req is used to store total in session
function calculateTotal(cart,req){
    total = 0;
    
    for(let i=0; i<cart.length; i++){
        //if offering discounted price
        if(cart[i].sale_price){
            total = total + (cart[i].sale_price*cart[i].quantity);
        }
        else{
            total = total + (cart[i].price * cart[i].quantity);
        }
    }
    req.session.total = total;
    return total;
}


//fetching products from database and displaying on homepage
app.get('/',function(req,res){
    q = "select * from products"
    db.query(q,(err,result)=>{
        if(!req.session.cart){
            req.session.cart = [];
        }
        if(err) return res.json(err);
        if(req.session.user){
            res.render("pages/index.ejs",{result:result, cart:req.session.cart, message:'loggedIn'});
        }
        else{
            res.render("pages/index.ejs",{result:result, cart:req.session.cart, message:'Not'});
        }
    })
});


//cart managment start here
app.post('/add_to_cart',function(req,res){
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const sale_price = req.body.sale_price;
    const quantity = req.body.quantity;
    const image = req.body.image;
  
    if(req.session.cart){
        var cart = req.session.cart;
        let count = 0;
        //if product id matches with the id already in the cart then increase the quantity
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                cart[i].quantity += 1;
                count++;
            }
        }
        
        //if id not matches with the cart's products then simply push into the cart
        if(count === 0){
            const cart_data = {
                id:id,
                name:name,
                price:price,
                sale_price:sale_price,
                quantity:1,
                image:image
            }
            cart.push(cart_data);
        }
     }
    

    //calculate total
    calculateTotal(cart,req);
 
    res.json({ message: 'Product added to cart'});
});


app.get('/cart',function(req,res){
        var cart = req.session.cart;
        var total = req.session.total;

        if(req.session.user){
            res.render("pages/cart.ejs",{cart:cart,total:total,message:'loggedIn'});
        }
        else{
            res.render("pages/cart.ejs",{cart:cart,total:total,message:'Not'});
        }
});


app.post('/remove_item',(req,res)=>{
    const product_id = req.body.id;
    var cart = req.session.cart;

    for(let i=0; i<cart.length; i++){
        if(cart[i].id === product_id){
            cart.splice(i, 1);
        }
    }

    calculateTotal(cart,req);
    res.json({message:'Removed from the cart',
            total:total
            });
});


//for + and  - button on cart page to manage the quantity of product
app.post('/edit_product_quantity',(req,res)=>{
    const id = req.body.id;
    const quantity = req.body.quantity;
    const clickedButtonValue = req.body.clickedButton;

    var cart = req.session.cart;

    if(clickedButtonValue == '+'){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 0){
                    cart[i].quantity = parseInt(cart[i].quantity)+1;
                }
            }
        }
    }

    else{
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 1){
                    cart[i].quantity = parseInt(cart[i].quantity)-1;
                }
            }
        }
    }
    calculateTotal(cart,req);
    
    res.json({
            total:total,
            cart:cart
            });
});





//login start here
app.get('/login',function(req,res){
    res.render("pages/login.ejs");
});

app.post('/login', async function(req,res){
    const {email, password} = req.body;

    db.query('select * from users where email=?',[email],async (err, result)=>{
        if(err){
            console.log(err);
        }
        else if(!result[0] || !await bcrypt.compare(password, result[0].password)){
            res.json({status:"error",
            message:'Email or Password incorrect'})
        }
        else{
            req.session.user = {id: result[0].id}
            return res.json({success:true});
        }
    })

})

//Forget password
app.get('/forgot-pass', function(req,res){
    res.render('pages/forgot.ejs');
});

app.post('/forgot-pass', async function(req,res){
    const {email, password} = req.body;
    let hashedPassword = await bcrypt.hash(password, 8);
    db.query('select * from users where email = ?',[email],(error,result)=>{
        if(error){
            console.log(error);
        }
        else if(result.length>=1){
            let query = 'update users set password = ? where email = ?';
            db.query(query,[hashedPassword,email], (err,result)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.json({success:true,message:'Password Successfully Changed'});
                }
            })
        }
        else{
            res.json({success:false, message:'No user found with this email'})
        }
    })
    
});


//Registration start here
app.get('/register',function(req,res){
    res.render("pages/register.ejs",{
        message: ''
    });
});

app.post('/register', (req,res)=>{
    const {fname,lname,email,password} = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results)=>{
        if(error){
            console.log(error);
        }
        if(results.length>0){
            return res.render("pages/register.ejs",{
                message: 'Email already in use'
            });
        }
        
        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', {fname:fname, lname:lname, email:email, password:hashedPassword},(error,results)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log(results);
                return res.render('pages/register.ejs', {
                    message: 'User Registered'
                });
            }
        });
    });
})




//logout
app.get("/logout",function(req,res){
    req.session.destroy();
    res.redirect("login");
})


//handling send message request
//i can use SMTP to send message by email but not using right now because as a semester project it would be difficult 
//for the teacher to test because its involve confidential information which cannot be shared to anyone so instead i am going 
//to add the meesages to database for now
app.post('/message',(req,res)=>{
   const {name, email, message} = req.body;
   insertQuery = 'insert into messages (name, email, message) values (?, ?, ?)';
   values = [name, email, message];
   db.query(insertQuery, values, (err)=>{
    if(err) throw err;
    res.json({message:'Message Sent Successfully'})
   })
})


app.post('/place-order',(req,res)=>{
    
    let totalProductPrice = 0;
    cart = req.session.cart;

    if(req.session.user){
        userId = req.session.user.id;
        
        for(let i=0; i<cart.length; i++){
                if(cart[i].sale_price){
                    totalProductPrice = cart[i].sale_price * cart[i].quantity;
                }
                else{
                    totalProductPrice = cart[i].price * cart[i].quantity;
                }
                let query = 'insert into orders (user_id, p_id, p_name, p_quantity, p_total) values (?, ?, ?, ?, ?)';
                const values = [userId, cart[i].id, cart[i].name, cart[i].quantity, totalProductPrice];

               db.query(query, values, function(err, result){
                    if(err){
                        console.log(err);
                    }
                })
            }
        
    res.json({message:'Order Successfully Placed'});
    }
  
    else{
        res.json({success:false});
    }
    
})