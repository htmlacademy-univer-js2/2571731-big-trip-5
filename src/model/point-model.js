import { UpdateType } from '../const.js';
import Observable from '../framework/observable.js';
export default class PointModel extends Observable {
  #pointsApiService;
  #points = [];
  #isLoaded = false;

  constructor(pointsApiService) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  get points() {
    return this.#points;
  }

  get isLoaded() {
    return this.#isLoaded;
  }

  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);
    } catch (err) {
      this.#points = [];
    }
    this.#isLoaded = true;
    this._notify(UpdateType.INIT);
  }

  async updatePoints(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === - 1) {
      throw new Error('I can\'t update this point');
    }
    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatePoint = this.#adaptToClient(response);
      this.#points = [...this.#points.slice(0, index), updatePoint, ...this.#points.slice(index + 1)];
      this._notify(updateType, updatePoint);
    } catch (err) {
      throw new Error('I can\'t update this point');
    }
  }

  async addPoints(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#points = [...this.#points, newPoint];
      this._notify(updateType, update);
    } catch (err) {
      throw new Error(err);
    }
  }

  async deletePoints(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === - 1) {
      throw new Error('I can\'t delete this point');
    }
    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = [...this.#points.slice(0, index), ...this.#points.slice(index + 1)];
      this._notify(updateType, update);
    } catch (err) {
      throw new Error('I can\'t delete this point');
    }
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite'],
      basePrice: point['base_price'],
    };

    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];
    delete adaptedPoint['base_price'];

    return adaptedPoint;
  }
}
