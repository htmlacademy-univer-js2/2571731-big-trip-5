import { formateDate, getDuration } from '../utils.js';
import { DATE_FORMAT } from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

function createPointTemplate(point, destinations, offers) {
  const {basePrice, dateFrom, dateTo, isFavorite, type} = point;
  const pointDestination = destinations.find((d) => d.id === point.destination);
  const pointOffers = offers.find((offer) => offer.type === type)?.offers.filter((offer) => point.offers.includes(offer.id));

  return `<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="${formateDate(dateFrom, DATE_FORMAT['full-date'])}">${formateDate(dateFrom, DATE_FORMAT['month-day'])}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${pointDestination.name}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="${formateDate(dateFrom, DATE_FORMAT['full-date-and-time'])}">${formateDate(dateFrom, DATE_FORMAT['hours-minutes'])}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${formateDate(dateTo, DATE_FORMAT['full-date-and-time'])}">${formateDate(dateTo, DATE_FORMAT['hours-minutes'])}</time>
                  </p>
                  <p class="event__duration">${getDuration(dateFrom, dateTo)}</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <ul class="event__selected-offers">
                  ${pointOffers ? pointOffers.map((offer) => `<li class="event__offer">
                      <span class="event__offer-title">${offer.title}</span>
                      &plus;&euro;&nbsp;
                      <span class="event__offer-price">${offer.price}</span>
                    </li>`).join('') : ''}
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
  #point;
  #destinations;
  #offers;
  #handleEdit;
  #handleFavorite;

  constructor({point, destinations, offers, onEditClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleEdit = onEditClick;
    this.#handleFavorite = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleEdit);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavorite();
  };

  get template() {
    return createPointTemplate(this.#point, this.#destinations, this.#offers);
  }
}
