"use strict";
const path = require(`path`);
const express = require(`express`);
const cookieParser = require(`cookie-parser`);
const helmet = require(`helmet`);
const session = require(`express-session`);
const sequelize = require(`../lib/sequelize`);
const SequelizeStore = require(`connect-session-sequelize`)(session.Store);

const mainRouter = require(`./routes/main`);
const myRouter = require(`./routes/my`);
const offersRouter = require(`./routes/offers`);
const { HttpCode } = require(`../constants`);

const PUBLIC_DIR = `public`;
const UPLOAD_DIR = `upload`;

const { SESSION_SECRET } = process.env;
if (!SESSION_SECRET) {
  throw new Error(`SESSION_SECRET environment variable is not defined`);
}

const sessionStore = new SequelizeStore({
  db: sequelize,
  expiration: 600000,
  checkExpirationInterval: 6000,
});

sequelize.sync({ force: false });

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        connectSrc: [`*`],
      },
    },
  })
);

app.use(
  session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    proxy: true,
    saveUninitialized: false,
    name: `s_user`,
    cookie: {
      maxAge: 600000,
    },
  })
);

app.use(`/`, mainRouter);
app.use(`/my`, myRouter);
app.use(`/offers`, offersRouter);

app.use(express.static(path.resolve(__dirname, PUBLIC_DIR)));
app.use(express.static(path.resolve(__dirname, UPLOAD_DIR)));

app.use((req, res) => {
  res.status(HttpCode.NOT_FOUND).render(`errors/404`);
});

// app.use((error, req, res) => {
//   res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`, {error});
// });

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.listen(8080);
