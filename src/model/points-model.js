import {getRandomPoint} from '../mock/points.js';
import Observable from '../framework/observable.js';
import dayjs from 'dayjs';

const POINT_COUNT = 2;

export default class PointsModel extends Observable{
  #points = Array.from({ length: POINT_COUNT }, getRandomPoint);

  get points() {
    return this.#points;
  }

  get newPoint() {
    return {
      id: 'new',
      basePrice: 0,
      dateFrom: dayjs().toISOString(),
      dateTo: dayjs().toISOString(),
      destination: '',
      isFavorite: false,
      offers: [],
      type: 'flight',
    };
  }

  addPoint(updateType, update) {
    this.#points = [
      update,
      ...this.#points,
    ];

    this._notify(updateType, update);
  }

  updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting task');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting task');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }
}
