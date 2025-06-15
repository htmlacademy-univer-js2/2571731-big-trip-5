import AbstractView from '../framework/view/abstract-view.js';
function createEmptyListTemplate() {
  return '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>';
}

export default class NewPointView extends AbstractView {
  #onClick;
  constructor(onClick) {
    super();
    this.#onClick = onClick;
    this.element.addEventListener('click', this.#onNewEventClick);
  }

  get template() {
    return createEmptyListTemplate();
  }

  #onNewEventClick = (evt) => {
    evt.preventDefault();
    this.#onClick();
  };
}
