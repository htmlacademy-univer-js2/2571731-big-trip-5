import AbstractView from '../framework/view/abstract-view.js';

function createRouteTemplate({ routeTitle, tripDates, totalCost }) {
  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${routeTitle}</h1>
        <p class="trip-info__dates">${tripDates}</p>
      </div>
      <p class="trip-info__cost">
        Total: € <span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>
  `;
}

export default class RouteView extends AbstractView {
  #routeTitle;
  #tripDates;
  #totalCost;

  constructor({ routeTitle, tripDates, totalCost }) {
    super();
    this.#routeTitle = routeTitle;
    this.#tripDates = tripDates;
    this.#totalCost = totalCost;
  }

  get template() {
    return createRouteTemplate({
      routeTitle: this.#routeTitle,
      tripDates: this.#tripDates,
      totalCost: this.#totalCost,
    });
  }
}
