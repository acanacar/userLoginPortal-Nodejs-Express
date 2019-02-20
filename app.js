var createError = require('http-errors')
var express = require('express')
var path = require('path')
var logger = require('morgan')
var session = require('express-session')
var okta = require('@okta/okta-sdk-nodejs')
var ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC

const dashboardRouter = require('./routes/dashboard')
const publicRouter = require('./routes/public')
const usersRouter = require('./routes/users')

const OktaOrgUrl = 'https://dev-135388.oktapreview.com'
const OktaToken = '009ngOv6Ew95zhgwRMXuR-31_wE1UKpTv_wiKkEqdd'
const ClientId = 'apl_c6PQBYM0YKjFLm0iMfZArKxmVqnjPVauliVz'
const ClientSecret = '0oajfp0izwa0PMIqD0h7'

var app = express()

const oktaClient = new okta.Client({
  orgUrl: `${OktaOrgUrl}`,
  token: `${OktaToken}`,
})

const oidc = new ExpressOIDC({
  issuer: `${OktaOrgUrl}/oauth2/default`,
  client_id: { ClientId },
  client_secret: { ClientSecret },
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: 'openid profile',
  routes: {
    login: {
      path: '/users/login',
    },
    callback: {
      path: '/users/callback',
      defaultRedirect: '/dashboard',
    },
  },
})
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'psdofapfaipi',
  resave: true,
  saveUninitialized: false,
}))
app.use(oidc.router)

app.use((req, res, next) => {
  if (!req.userInfo) {
    return next()
  }

  oktaClient.getUser(req.userInfo.sub)
    .then(user => {
      req.user = user
      res.user.local = user
      next()
    }).catch(err => {
    next(err)
  })
})


app.use('/', publicRouter)
app.use('/dashboard', loginRequired, dashboardRouter)
app.use('/users', usersRouter)


app.get('/test', (req, res) => {
  res.json({ profile: req.user ? req.user.profile : null })
})

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render('unauthenticated')
  }
  next()
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
