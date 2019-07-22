require('dotenv').config();
const hbs = require('hbs');
const web = require("express")();
const bodyParser = require("body-parser");
const session = require('express-session');
const config = require("./config.json");

global.__basedir = __dirname;

require('./utils/sql').initTable();

web.use(require('helmet')());
web.use(bodyParser.urlencoded({
    extended: true
}));
web.use(bodyParser.json());
web.use(require('passport').initialize());

hbs.registerPartials(__dirname + '/views/partials');
web.engine('hbs', hbs.__express);
web.set('view engine', 'hbs');
web.set('views', __dirname + '/views/layouts');

var cookieData = {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: null
};

if (process.env.NODE_ENV === 'production') {
    web.set('trust proxy', 1);
    cookieData.secure = true;
}

web.use(session({
    genid: () => {
        return require('uuid/v4')();
    },
    secret: config.web.secret,
    name: "mlink_session",
    saveUninitialized: false,
    resave: true,
    proxy: true,
    cookie: cookieData
}));

require('./passport');
web.use(require("./routes"));

web.listen(config.port, () => {
    console.log("Express port : " + config.port);
});
