var fs = require('fs');
var express = require('express');
var app = express();
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
var Database = require('better-sqlite3');
// import sqliteStoreFactory from 'express-session-sqlite';
import * as sqlite3 from 'sqlite3'
// var csrf = require('csrf');
// var csrfProtection = csrf({cookie: true});
// var parseForm = bodyParser.urlencoded({extended: false});
// app.use(cookieParser());
app.set('trustproxy', true);
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
app.use(session({
    secret: 'resebud', 
    resave: false, 
    saveUninitialized: true, 
    cookie: {maxAge: 900000}, 
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: 'db/',
    })
}));
app.use(express.urlencoded({extended: true})); 

const db = new Database('db/memes.db', { verbose: console.log });
let port = 8070;

// parse arguments -n is new database and -p is port
for(var i = 0;i < process.argv.length; i++) {
    if(process.argv[i] == '-n') {
        console.log("loading database");
        let superCommand = fs.readFileSync('db/init.sql').toString();
        db.exec(superCommand, err => {
            if (err) throw err;
            else console.log("init OK");
        });
    }
    if(process.argv[i] == '-p') {
        var p = parseInt(process.argv[i+1], 10);
        if (!isNaN(p)) port = p;
        else console.log("please, provide a valid port");
    }
}

let dbModPrice = db.prepare("UPDATE Memes SET price = ? WHERE id = ?");
let dbAddMod = db.prepare("INSERT INTO Changes (name, memeId, price) VALUES (?, ?, ?)");

class Meme {
    url: string;
    name: string;
    price: number;
    id: number;
    history: Array<number>;
    constructor(name: string, link: string, price: number, id: number) {
        this.name = name;
        this.url = link;
        this.price = price;
        this.history = [];
        this.history.push(price);
        this.id = id;
    }

    newPrice(price: any) {
        let x: number;
        if(isNaN(price)) x = parseInt(price);
        else x = price;
        this.price = x;
        this.history.unshift(x);
        dbModPrice.run(this.price, this.id);
    }
}

class Memestash {
    memes: Array<Meme>;
    constructor(data) {
        this.memes = [];
        data.forEach(meme => {
            let t = new Meme(meme.name, meme.url, meme.price, meme.id);
            // console.log(t);
            this.memes.push(t);
        });
    }
    getTop(count: number) {
        let ret = [];
        this.memes.sort((a: Meme, b: Meme) =>  b.price - a.price);
        for(let i = 0;i<count && i < this.memes.length;i++) {
            ret.push(this.memes[i]);
        }
        return ret;
    }

    getById(id: number) {
        return this.memes.find(meme => meme.id == id);
    }
}
let stash: Memestash;

class User {
    name: string;
    pass: string;
    constructor(name, pass) {
        this.name = name;
        this.pass = pass;
    }

    match(name, pass) {
        return (this.name == name) && (this.pass == pass);
    }
}
let user1 = new User('user1', 'user1');
let user2 = new User('user2', 'user2');

app.set('view engine', 'pug');

app.post('/login', function(req, res) {
    let name = req.body.name;
    let pass = req.body.pass;
    if(user1.match(name, pass)) req.session.login = name;
    if(user2.match(name, pass)) req.session.login = name;
    res.redirect('/');
});

app.get('/logout', function(req, res) {
    req.session.login = undefined;
    res.redirect('/');
});

app.get('/', function(req, res) {
    console.log(req.session);
    if(req.session.count) req.session.count ++;
    else req.session.count = 1;
    let tdb = new Database('db/sessions.db');
    console.log(tdb.prepare('select * from sessions').all());
    res.render('index', { title: 'Meme market', message: 'Hello there!', memes: stash.getTop(3), count: req.session.count});
});

app.get('/meme/:memeId', function (req, res) {
    console.log(req.session);
    console.log(req.params);
    if(req.session.count) req.session.count ++;
    else req.session.count = 1;
    // console.log(req.session);
    res.render('meme', { meme: stash.getById(parseInt(req.params.memeId)), count: req.session.count });
 })

app.post('/meme/:memeId', function (req, res) {
    console.log(req.session);
    console.log(req.params);
    let meme = stash.getById(req.params.memeId);
    if(req.session.login) {
        let price = req.body.price;
        meme.newPrice(price);
        console.log(req.body.price);
        dbAddMod.run(req.session.login, req.params.memeId, price);
        console.log(db.prepare("select * from Changes").all());
    }
    res.render('meme', { meme: meme , count: req.session.count});
})

let initialMemes = db.prepare("SELECT * FROM Memes").all();
// console.log(initialMemes);
stash = new Memestash(initialMemes);

// set up server
app.listen(port, function() {
    console.log('server is running on port ' + port);
});