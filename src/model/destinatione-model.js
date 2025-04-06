import {destinations} from '../mock/destinations.js';

export default class DestinationModel {
  constructor() {
    this.destinations = [];
  }

  init() {
    this.destinations = destinations;
  }

  getDestinations() {
    return this.destinations;
  }
}
