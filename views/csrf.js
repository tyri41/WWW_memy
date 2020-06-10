function loadStuff(id) {
    console.log("stuff loaded");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/meme/" + id, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("price=2137&id=0");
}
