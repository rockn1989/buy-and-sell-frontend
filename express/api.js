'use strict';

const axios = require(`axios`);

const TIMEOUT = 1000;
const port = process.env.API_PORT || 3000;
const defaultURL = `http://localhost:${port}/api/`;

class API {
  constructor(baseURL, timeout) {

    this._https = axios.create({
      baseURL,
      timeout
    });
  }

  async _load(url, options) {
    const response = await this._https.request({url, ...options});
    return response.data;
  }

  async getCategories(count) {
    return await this._load(`/categories`, {
      params: count
    });
  }

  async getCategory(id, {limit, offset}) {
    return await this._load(`/categories/${id}`, {
      params: {limit, offset}
    });
  }

  async getOffers({limit, comments, offset, topOffers, id, roleId} = {}) {
    return this._load(`/offers`, {
      params: {limit, offset, comments, topOffers, id, roleId},
      data: {id, roleId}
    });
  }

  async getOffer(id, comments) {
    return this._load(`/offers/${id}`, {
      params: comments
    });
  }

  async createComment(id, data) {
    return this._load(`/offers/${id}/comments`, {
      method: `POST`,
      data
    });
  }

  async getComments() {
    return this._load(`/comments`);
  }

  async getUserComments(userId) {
    return this._load(`/offers/comments`, {
      params: {userId}
    });
  }

  async deleteComment(offerId, commentId, user) {
    return this._load(`/offers/${offerId}/comments/${commentId}`, {
      method: `DELETE`,
      data: {user}
    });
  }

  async search(query) {
    return this._load(`/search`, {params: {query}});
  }

  async createOffer(data) {
    return this._load(`/offers`, {
      method: `POST`,
      data
    });
  }

  async editOffer(id, offerData, userId) {
    return this._load(`/offers/${id}`, {
      method: `PUT`,
      data: {
        offerData,
        userId
      }
    });
  }

  async deleteOffer(id) {
    return this._load(`/offers/${id}`, {
      method: `DELETE`
    });
  }

  async createUser(data) {
    return this._load(`/user/register`, {
      method: `POST`,
      data
    });
  }

  async auth(data) {
    return this._load(`/user/auth`, {
      method: `POST`,
      data
    });
  }

  async refresh(token) {

    return this._load(`/user/refresh`, {
      method: `POST`,
      data: {token},
    });
  }
}

const defaultAPI = new API(defaultURL, TIMEOUT);

module.exports = {
  API,
  getAPI: () => defaultAPI
};
