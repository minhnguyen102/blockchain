const express = require('express');
const bodyParser = require('body-parser');
const blockchainController = require('./controllers/blockchainController');

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));

app.use('/', blockchainController);


app.listen(port, () => {
    console.log(`Blockchain Student Management app listening at http://localhost:${port}`);
});