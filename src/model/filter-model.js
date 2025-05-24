import { FILTERS_TYPE } from '../const';
import Observable from '../framework/observable';

export default class FilterModel extends Observable {
  #filter = FILTERS_TYPE.EVERYTHING;

  get filter() {
    return this.#filter;
  }

  setFilter(updateType, filter) {
    this.#filter = filter;
    this._notify(updateType, filter);
  }
}
