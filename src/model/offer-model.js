import { UpdateType } from '../const';
import Observable from '../framework/observable';

const FIRST_ELEMENT = 0;

export default class OfferModel extends Observable {
  #offers = [];
  #offersApiService;
  #isLoaded = false;

  constructor(offersApiService) {
    super();
    this.#offersApiService = offersApiService;
  }

  get offers() {
    return this.#offers;
  }

  get isLoaded() {
    return this.#isLoaded;
  }

  async init() {
    try {
      this.#offers = await this.#offersApiService.offers;
    } catch (err) {
      this.#offers = [];
    }
    this.#isLoaded = true;
    this._notify(UpdateType.INIT);
  }

  getOfferById(type, id) {
    if (this.#offers.length === 0) {
      return;
    }
    return this.#offers.filter((offer) => offer.type === type)[FIRST_ELEMENT].offers.find((item) => item.id === id);
  }

  getOfferByType(type) {
    return this.#offers.filter((offer) => offer.type === type).map((offer) => offer.offers).flat();
  }
}
