require('dotenv').config();
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const bodyParser = require('body-parser');

const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const passport = require('passport');
const { authenticate, serialize, deserialize } = require('./passport/passport');

const dashboardRouter = require('./routes/dashboardRouter');
const userRouter = require('./routes/userRouter');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
app.use(helmet());

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_APPCODE;
mongoose.connect(mongoDB, {
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

passport.use(authenticate);
passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    saveUninitialized: true,
    resave: false,
    secret: 'keyboard cat',
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dashboard', dashboardRouter);
app.use('/user', userRouter);
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
