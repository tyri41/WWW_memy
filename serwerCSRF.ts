var fs = require('fs');
var express = require('express');
var app = express();

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

const memestash = [
    {'id': 10,
    'name': 'Gold',
    'price': 1000,
    'url': 'https://i.redd.it/h7rplf9jt8y21.png'},
    {'id': 9,
    'name': 'Platinum',
    'price': 1100,
    'url': 'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg'},
    {'id': 8,
    'name': 'Elite',
    'price': 1200,
    'url': 'https://i.imgflip.com/30zz5g.jpg'},
    {'id': 7,
    'name': 'alfa',
    'price': 1112,
    'url': 'https://i.redd.it/0le89kvmh1451.jpg'},
    {'id': 6,
    'name': 'beta',
    'price': 1144,
    'url': 'https://i.redd.it/0bzn1kn1b0451.jpg'},
    {'id': 5,
    'name': 'dzeta',
    'price': 1253,
    'url': 'https://i.redd.it/m7smk6rtp0451.png'}
];

let stash: Memestash = new Memestash(memestash);

app.set('view engine', 'pug');
app.get('/', function(req, res) {
    res.render('index', { title: 'Meme market', message: 'Hello there!', memes: stash.getTop(3) })
});

app.get('/meme/:memeId', function (req, res) {
    console.log(req.params);
    res.render('memeCSRF', { meme: stash.getById(parseInt(req.params.memeId)) })
 })

app.use(express.urlencoded({extended: true})); 
app.post('/meme/:memeId', function (req, res) {
    console.log(req.body);
    console.log(req.get('Content-Type'));
   let meme = stash.getById(req.params.memeId);
   let price = req.body.price;
   meme.newPrice(price);
   console.log(req.body.price);
   res.render('memeCSRF', { meme: meme })
})

let port = 8060;

// parse arguments -n is new database and -p is port
for(var i = 0;i < process.argv.length; i++) {
    if(process.argv[i] == '-p') {
        var p = parseInt(process.argv[i+1], 10);
        if (!isNaN(p)) port = p;
        else console.log("please, provide a valid port");
    }
}

// set up server
app.listen(port, function() {
    console.log('server is running on port ' + port);
});