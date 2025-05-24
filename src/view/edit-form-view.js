import { DATE_FORMAT, POINT_TYPE } from '../const.js';
import { createEventTypeItems, formateDate } from '../utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

function createDestinationList(destinations) {
  return destinations.map((destination) => `<option value="${destination.name}"></option>`).join('');
}

function createPictures(pictures) {
  return pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`);
}

function createEditFormTemplate(point, destinations, offers) {
  const {basePrice, dateFrom, dateTo, type} = point;

  const pointDestination = destinations.find((d) => d.id === point.destination);
  const pointOffers = offers.find((offer) => offer.type === type)?.offers;

  const destinationListTemplate = createDestinationList(destinations);
  const eventTypeItems = createEventTypeItems(POINT_TYPE, type);

  const destinationPictures = pointDestination ? createPictures(pointDestination.pictures) : '';

  return `<form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>
                        ${eventTypeItems}
                      </fieldset>
                    </div>
                  </div>

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${type}
                    </label>
                    <input class="event__input  event__input--destination"
                    id="event-destination-1" type="text" name="event-destination"
                    value="${pointDestination.name}" list="destination-list-1"
                    onfocus="this.value=null;"
                    onchange="this.blur();">
                    <datalist id="destination-list-1">
                      ${destinationListTemplate}
                    </datalist>
                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formateDate(dateFrom, DATE_FORMAT['full-date-and-time-slash'])}">
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formateDate(dateTo, DATE_FORMAT['full-date-and-time-slash'])}">
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                  <button class="event__reset-btn" type="reset">Delete</button>
                  <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>
                </header>
                <section class="event__details">
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

                    <div class="event__available-offers">
                      ${pointOffers ? pointOffers.map((offer) => `<div class="event__offer-selector">
                        <input class="event__offer-checkbox  visually-hidden" id="event-offer-luggage-1" type="checkbox" name="event-offer-luggage" ${point.offers.includes(offer.id) ? 'checked' : ''}>
                        <label class="event__offer-label" for="event-offer-luggage-1">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>`) : ''}
                    </div>
                  </section>

                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${pointDestination.description}</p>
                    <div class="event__photos-container">
                      <div class="event__photos-tape">
                        ${destinationPictures}
                      </div>
                    </div>
                  </section>
                </section>
              </form>`;
}

export default class EditForm extends AbstractStatefulView {
  #destinations;
  #offers;
  #handleSumbit;

  constructor({point, destinations, offers, onFormSubmit}) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleSumbit = onFormSubmit;

    this._setState(EditForm.pointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createEditFormTemplate(this._state, this.#destinations, this.#offers);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#submitHandler);
    this.element.addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#handleChangeType);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleChangeDestination);
  }

  #handleChangeType = (evt) => {
    evt.target.checked = true;
    if (evt.target) {
      this.updateElement({type: evt.target.value});
    }
  };

  #handleChangeDestination = (evt) => {
    const selectedDestination = this.#destinations.find((destination) => destination.name === evt.target.value);

    if (!selectedDestination) {
      return;
    }

    this.updateElement({
      destination: selectedDestination.id
    });
  };

  reset(point) {
    this.updateElement(EditForm.pointToState(point));
  }

  static pointToState(point) {
    return { ...point };
  }

  static stateToPoint(state) {
    const point = { ...state };
    return point;
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSumbit(EditForm.stateToPoint(this._state));
  };
}
