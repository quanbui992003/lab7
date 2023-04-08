var config = require('../config/database');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../model/user");
var Book = require("../model/book");

const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');

router.use(bodyParser.json());
router.use(express.json())
router.use(cookieParser());
const parser = bodyParser.urlencoded({ extended: true });
router.use(parser);

router.get("/login", (req, res) => {
    res.render("login")
})
router.get('/dangky', function (req, res) {
    res.render('dangky')
})

router.post('/signup', async function (req, res) {

    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        // save the user
        await newUser.save();

        res.json({ success: true, msg: 'Successful created new user.' });

    }

});


router.post('/signin', async function (req, res) {

    console.log(req.body);

    let user = await User.findOne({ username: req.body.username });

    console.log(user);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
        // check if password matches
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
                // if user is found and password is right create a token
                const token = jwt.sign({ user }, config.secret, { expiresIn: '10s' });
                console.log(token);
                res.cookie('token', token, { httpOnly: true });
                // return the information including token as JSON
                res.redirect('/api/book')
            } else {
                res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
            }
        });
    }
});


router.post('/book', verifyToken,async function (req, res) {
   // var token = getToken(req.headers);
    
        console.log(req.body);
        var newBook = new Book({
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher
        });

        await newBook.save()
        .then(() =>{
         res.redirect("/api/book")
        })
        .catch(err =>{
         console.log(err);
     
        });
  
});


router.get('/book',verifyToken , async function (req, res) {
    try {
        let books = await Book.find();
        console.log(books);
        if (books) {
            res.render("home", {
                books: books.map(book => book.toJSON())
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/addBook", verifyToken, (req, res) => {
    res.render("addBook")
})
function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/api/login');
    }

  
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return res.redirect('/api/login');
        }
        req.user = decoded.user;
        next();
    });
}

module.exports = router;
