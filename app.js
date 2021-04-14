const express = require('express');
const app = express();
const path = require('path');

//express ejs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000')
});

app.get('/', (req, res) => {
    res.render('home')
})
