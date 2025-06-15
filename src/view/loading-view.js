import AbstractView from '../framework/view/abstract-view.js';
function createLoadingTemplate() {
  return `
        <section class="trip-events">
          <h2 class="visually-hidden">Trip events</h2>
          <p class="trip-events__msg">Loading...</p>
        </section>
`;
}

export default class LoadingView extends AbstractView {
  constructor() {
    super();
  }

  get template() {
    return createLoadingTemplate();
  }
}
