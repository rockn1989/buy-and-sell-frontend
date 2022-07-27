'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);
const {getAPI} = require(`../api`);

const offersRouter = new Router();
const api = getAPI();
const upload = require(`../middleware/upload`);
const checkAuth = require(`../middleware/check-auth`);
const privateRoute = require(`../middleware/private-route`);
const redirectHandler = require(`../middleware/redirect-handler`);
const {OFFERS_PER_PAGE} = require(`../../constants`);

const csrfProtection = csrf();

offersRouter.get(`/add`, [privateRoute, csrfProtection], async (req, res) => {
  const {user} = req.session;
  const categories = await api.getCategories();
  res.render(`pages/ticket/ticket-new`, {categories, user, csrfToken: req.csrfToken()});
});

offersRouter.get(`/:id`, csrfProtection, async (req, res, next) => {
  const {id} = req.params;
  const {user} = req.session;
  try {
    const offer = await api.getOffer(id, {comments: true});
    res.render(`pages/ticket/ticket-detail`, {offer, user, csrfToken: req.csrfToken()});
  } catch (err) {
    redirectHandler(err, req, res, next);
  }
});

offersRouter.get(`/edit/:id`, [privateRoute, csrfProtection], async (req, res, next) => {
  const {id} = req.params;
  const {user} = req.session;

  try {
    const [offer, categories] = await Promise.all([
      api.getOffer(id),
      api.getCategories()
    ]);

    offer.categories = offer.categories.map((item) => item.name);
    res.render(`pages/ticket/ticket-edit`, {offer, categories, user, csrfToken: req.csrfToken()});
  } catch (err) {
    redirectHandler(err, req, res, next);
  }

});

offersRouter.get(`/category/:id`, async (req, res) => {
  const {id} = req.params;
  const {user} = req.session;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * limit;

  const {category, count, offersByCategory} = await api.getCategory(id, {limit, offset});
  res.render(`pages/category`, {offersByCategory, limit, page, count, category, user});
});

offersRouter.post(`/add`, [privateRoute, upload.single(`picture`), csrfProtection], async (req, res) => {

  const offerData = {
    title: req.body.title,
    description: req.body.description,
    category: Array.isArray(req.body.category) ? req.body.category : [req.body.category],
    sum: parseInt(req.body.sum, 10),
    type: req.body.type,
    picture: req.file.filename ? req.file.filename : ``
  };

  try {
    await api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (err) {
    const {errorsList: errorMessages, incorrectOffer} = err.response.data;
    const categories = await api.getCategories();

    res.render(`pages/ticket/ticket-new`, {categories, errorMessages, incorrectOffer, csrfToken: req.csrfToken()});
  }

});

offersRouter.post(`/edit/:id`, [privateRoute, upload.single(`picture`), csrfProtection], async (req, res) => {
  const {id} = req.params;
  const {user} = req.session;
  const {id: userId} = user;

  const offerData = {
    title: req.body.title,
    description: req.body.description,
    category: Array.isArray(req.body.category) ? req.body.category : [req.body.category],
    sum: parseInt(req.body.sum, 10),
    type: req.body.type,
    picture: req.file ? req.file.filename : req.body[`old-picture`]
  };

  try {
    await api.editOffer(id, offerData, userId);
    res.redirect(`/my`);
  } catch (err) {
    const {errorsList: errorMessages} = err.response.data;
    const [offer, categories] = await Promise.all([
      api.getOffer(id),
      api.getCategories()
    ]);

    offer.categories = offer.categories.map((item) => item.name);
    res.render(`pages/ticket/ticket-edit`, {offer, categories, errorMessages, csrfToken: req.csrfToken()});
  }

});

offersRouter.post(`/:offerId`, [checkAuth, csrfProtection], async (req, res) => {
  const {offerId} = req.params;
  const {comment} = req.body;
  const {user} = req.session;

  try {
    await api.createComment(offerId, {userId: user.id, text: comment});
    res.redirect(`/offers/${offerId}`);
  } catch (err) {
    const errorMessage = err.response.data;
    const offer = await api.getOffer(offerId, {comments: true});

    res.render(`pages/ticket/ticket-detail`, {offer, errorMessage, user, csrfToken: req.csrfToken()});
  }
});

offersRouter.post(`/:offerId/comments/:commentId`, [checkAuth, csrfProtection], async (req, res) => {
  const {offerId, commentId} = req.params;
  const {user} = req.session;

  try {
    await api.deleteComment(offerId, commentId, user);
    res.redirect(`/my/comments`);
  } catch (err) {
    req.session.user.error = err.response.data;
    res.redirect(`/my/comments`);
  }
});

module.exports = offersRouter;
