import { NO_POINT_MESSAGES } from '../const';
import AbstractView from '../framework/view/abstract-view';

function createEmptyPointList(filterType) {
  return `<p class="trip-events__msg">${NO_POINT_MESSAGES[filterType.toUpperCase()]}</p>`;
}

export default class EmptyPoints extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createEmptyPointList(this.#filterType);
  }
}
