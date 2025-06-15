import AbstractView from '../framework/view/abstract-view.js';
import { emptyListMessages } from '../const.js';
function createEmptyListTemplate(actualFilter) {

  return `
        <section class="trip-events">
          <h2 class="visually-hidden">Trip events</h2>
          <p class="trip-events__msg">${emptyListMessages[actualFilter]}</p>
        </section>
`;
}

export default class EmptyListView extends AbstractView {
  #actualFilter;
  constructor(actualFilter) {
    super();
    this.#actualFilter = actualFilter;
  }

  get template() {
    return createEmptyListTemplate(this.#actualFilter);
  }
}
