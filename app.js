const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');


app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

const pass = require('./pass');
pass.passini(app);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), (req, res,next) => {
    //console.log(req.user);
    res.redirect('/dashboard');
});



const port = process.env.PORT || 3000;
const path = require('path');


app.use(express.json());

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

const routes = require('./routes');
routes.paths(app);


app.listen(port, () => console.log(`Listening on port ${port}...`));