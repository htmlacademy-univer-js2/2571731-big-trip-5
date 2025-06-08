import { formateDate, getDuration } from '../utils.js';
import { DATE_FORMAT } from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

function createPointOffersTemplate(pointOffers, point) {
  if (!pointOffers || pointOffers.length === 0) {
    return '';
  }

  return pointOffers
    .map((offer) =>
      point.offers.includes(offer.id)
        ? `<li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>`
        : ''
    )
    .join('');
}

function createPointTemplate(point, destinations, offers) {
  const {basePrice, dateFrom, dateTo, isFavorite, type} = point;

  const pointDestination = destinations.find((d) => d.id === point.destination);
  const pointOffers = offers.find((offer) => offer.type === type) || { offers: [] };
  const pointOffersTemplate = createPointOffersTemplate(pointOffers.offers, point);

  const date = formateDate(dateFrom, DATE_FORMAT['month-day']);
  const startTime = formateDate(dateFrom, DATE_FORMAT['hours-minutes']);
  const endTime = formateDate(dateTo, DATE_FORMAT['hours-minutes']);
  const travelTime = getDuration(dateFrom, dateTo);

  return `<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="${formateDate(dateFrom, DATE_FORMAT['full-date'])}">${date}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${pointDestination.name}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="${formateDate(dateFrom, DATE_FORMAT['full-date-and-time'])}">${startTime}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${formateDate(dateTo, DATE_FORMAT['full-date-and-time'])}">${endTime}</time>
                  </p>
                  <p class="event__duration">${travelTime}</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <ul class="event__selected-offers">
                  ${pointOffersTemplate}
                </ul>
                <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
                  <span class="visually-hidden">Add to favorite</span>
                  <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                  </svg>
                </button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </div>
            </li>`;
}

export default class PointView extends AbstractView {
  #point = null;
  #destinations = null;
  #offers = null;
  #handleEdit = null;
  #handleFavorite = null;

  constructor({point, destinations, offers, onEditClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleEdit = onEditClick;
    this.#handleFavorite = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editHandler);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavorite();
  };

  #editHandler = (evt) => {
    evt.preventDefault();
    this.#handleEdit();
  };

  get template() {
    return createPointTemplate(this.#point, this.#destinations, this.#offers);
  }
}
