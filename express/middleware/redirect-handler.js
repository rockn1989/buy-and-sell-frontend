'use strict';

const {HttpCode} = require(`../../constants`);

module.exports = (err, req, res, next) => {
  const errorStatusCode = err.response.status;

  if (errorStatusCode !== HttpCode.OK) {
    return res.redirect(`/404`);
  }

  return next();
};
