const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

// Models
const Thought = require('./models/Thought')
const User = require('./models/User')

// Import Routes
const thoughtsRoutes = require('./routes/thoughtsRoutes')
const authRoutes = require('./routes/authRoutes')

// Import Controller
const ThoughtController = require('./controllers/ThoughtController')

//Config Handlebars Time
const hbs = exphbs.create({
  helpers: {
    formatDate: (date) => {
      return new Date(date)
        .toLocaleString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(' ', ' ')
        .replace(' de ', ' de ')
        .replace(' às', ' às')
    },
  },
})

//Template engine

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

// receber resposta do body
app.use(
  express.urlencoded({
    extended: true,
  })
)

app.use(express.json())

// session middleware (onde o express vai salvar as seções)
app.use(
  session({
    name: 'session',
    secret: 'nosso_secret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 600000,
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    },
  })
)

// flash messages
app.use(flash())

// public path
app.use(express.static('public'))

// set session to res
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session
  }

  next()
})

// Routes
app.use('/thoughts', thoughtsRoutes)

app.use('/', authRoutes)

app.get('/', ThoughtController.showThoughts)

conn
  //.sync( { force: true }) //force: true para recriar as tabelas */
  .sync()
  .then(() => {
    app.listen(3000)
  })
  .catch((err) => console.log(err))
