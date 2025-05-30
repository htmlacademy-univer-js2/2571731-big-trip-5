import { DATE_FORMAT, POINT_TYPES } from '../const.js';
import { formateDate } from '../utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

function createDestinationList(destinations) {
  return destinations.map((destination) => `<option value="${destination.name}"></option>`).join('');
}

function createFormOffersTemplate(pointOffers, point) {
  return pointOffers
    .map((offer) => {
      const checked = point.offers.includes(offer.id) ? 'checked' : '';
      return `<div class="event__offer-selector">
                        <input class="event__offer-checkbox  visually-hidden"
                        id="event-offer-${offer.id}"
                        data-offer-id="${offer.id}"
                        type="checkbox"
                        name="event-offer-${offer.type}-${offer.id}"
                        ${checked}
                        ${point.isDisabled ? 'disabled' : ''}>
                        <label class="event__offer-label" for="event-offer-${offer.id}">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>`;
    }).join('');
}

function createEventTypeItem(offers) {
  return offers.map((offer) => `<div class="event__type-item">
  <input id="event-type-${offer}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${offer}">
  <label class="event__type-label  event__type-label--${offer}" for="event-type-${offer}-1">${(offer)[0].toUpperCase() + (offer).slice(1)}</label>
</div>`).join('');
}

function createPictures(pictures) {
  return pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`);
}

function createEditFormTemplate(point, destinations, offers) {
  const {basePrice, dateFrom, dateTo, type, isDisabled, isSaving, isDeleting} = point;

  const pointDestination = destinations.find((d) => d.id === point.destination);
  const pointOffers = offers.find((offer) => offer.type === type)?.offers;

  const offersItems = createFormOffersTemplate(pointOffers, point);
  const destinationListTemplate = createDestinationList(destinations);
  const eventTypeItems = createEventTypeItem(POINT_TYPES, type);

  const destinationPictures = pointDestination ? createPictures(pointDestination.pictures) : '';

  let resetButtonText;
  if (isDeleting) {
    resetButtonText = 'Deleting...';
  } else {
    resetButtonText = 'Delete';
  }

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
                    value="${pointDestination?.name || ''}" list="destination-list-1"
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
                    <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}">
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit">${isSaving ? 'Saving...' : 'Save'}</button>
                  <button class="event__reset-btn" type="reset">${resetButtonText}</button>
                  <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>
                </header>
                <section class="event__details">
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

                    <div class="event__available-offers">
                      ${offersItems}
                    </div>
                  </section>

                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${pointDestination?.description || ''}</p>
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
  #datepickerStart = null;
  #datepickerEnd = null;

  #destinations;
  #offers;
  #handleSumbit;
  #handleDelete;


  constructor({point, destinations, offers, onFormSubmit, onDeleteClick}) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleSumbit = onFormSubmit;
    this.#handleDelete = onDeleteClick;

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
    this.element.querySelector('.event__input--price').addEventListener('input', this.#changePriceHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteHandler);

    if (this.element.querySelector('.event__section--offers')) {
      this.element.querySelector('.event__section--offers')
        .addEventListener('change', this.#offerChangeHandler);
    }

    this.#setDatepicker();
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

  #changePriceHandler = (evt) => {
    this._setState({
      basePrice: Number(evt.target.value)
    });
  };

  #setDatepicker() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'), {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        locale: { firstDayOfWeek: 1 },
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#changeStartDateHandler
      });
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-end-time-1'), {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        locale: { firstDayOfWeek: 1 },
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom || '',
        onChange: this.#changeEndDateHandler
      });
  }

  #changeStartDateHandler = ([newDate]) => {
    this.updateElement({
      dateFrom: dayjs(newDate).toISOString()
    });
  };

  #changeEndDateHandler = ([newDate]) => {
    this.updateElement({
      dateTo: dayjs(newDate).toISOString()
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

  #deleteHandler = (evt) => {
    evt.preventDefault();
    this.#handleDelete(EditForm.stateToPoint(this._state));
  };

  #offerChangeHandler = (evt) => {
    const currentOffer = evt.target.dataset.offerId;

    if (evt.target.checked) {
      this._setState({
        offers: [...this._state.offers, currentOffer]
      });
    } else {
      this._setState({
        offers: this._state.offers.filter((offer) => offer !== currentOffer)
      });
    }
  };
}
