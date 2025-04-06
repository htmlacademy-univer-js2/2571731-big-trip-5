import {offers} from '../mock/offers.js';

export default class OffersModel {
  constructor() {
    this.offers = [];
  }

  init() {
    this.offers = offers;
  }

  getOffers() {
    return this.offers;
  }
}
