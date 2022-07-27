'use strict';

const {Router} = require(`express`);
const {getAPI} = require(`../api`);
const myRouter = new Router();
const csrf = require(`csurf`);
const checkAuth = require(`../middleware/check-auth`);
const privateRoute = require(`../middleware/private-route`);
const api = getAPI();
const csrfProtection = csrf();

myRouter.get(`/`, [privateRoute, csrfProtection], async (req, res) => {
  const {user} = req.session;
  const {id, roleId} = user;

  const offers = await api.getOffers({id, roleId});

  res.render(`pages/my-tickets`, {offers, user, csrfToken: req.csrfToken()});
});

myRouter.get(`/comments`, [checkAuth, csrfProtection], async (req, res) => {
  const {user} = req.session;

  let offers;

  if (user.roleId === 1) {
    offers = await api.getUserComments(user.id);
  }

  if (user.roleId !== 1) {
    offers = await api.getOffers({comments: true});
  }

  const errorMessage = req.session.user.error || null;

  delete req.session.user.error;
  res.render(`pages/comments`, {offers, errorMessage, user, csrfToken: req.csrfToken()});
});

myRouter.post(`/:id`, [privateRoute, csrfProtection], async (req, res) => {
  const {id} = req.params;

  try {
    await api.deleteOffer(id);
    res.redirect(`/my`);
  } catch (err) {
    const errorMessage = err.message;
    const offers = await api.getOffers({comments: false});
    res.render(`pages/my-tickets`, {offers, errorMessage, csrfToken: req.csrfToken()});
  }
});

module.exports = myRouter;
