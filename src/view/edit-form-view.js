import { DATE_FORMAT } from '../const.js';
import { convertDateToISO, formateDate } from '../utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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
  <input id="event-type-${offer.type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${offer.type}">
  <label class="event__type-label  event__type-label--${offer.type}" for="event-type-${offer.type}-1">${(offer.type)[0].toUpperCase() + (offer.type).slice(1)}</label>
</div>`).join('');
}

function createPictures(pictures) {
  if (Array.isArray(pictures)) {
    return pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('');
  }
  return '';
}

function createEditFormTemplate(point, destinations, offers, isCreating) {
  const { type, basePrice, dateFrom, dateTo, isDisabled, isSaving, isDeleting } = point;

  const editFormPointDestination = destinations.find((destination) => destination.id === point.destination) || {};

  const pointTypeOffer = offers.find((offer) => offer.type === point.type);

  if (!pointTypeOffer) {
    return '';
  }

  const editFormOffersTemplate = createFormOffersTemplate(pointTypeOffer.offers, point);

  const destinationPictures = editFormPointDestination
    ? createPictures(editFormPointDestination.pictures)
    : '';

  const destinationListTemplate = createDestinationList(destinations);

  const eventTypeItemTemplate = createEventTypeItem(offers);

  const startDate = formateDate(dateFrom, DATE_FORMAT['full-date-and-time-slash']);
  const endDate = formateDate(dateTo, DATE_FORMAT['full-date-and-time-slash']);

  const hasDestinationContent = editFormPointDestination.description || destinationPictures;

  const hasOffers = pointTypeOffer.offers && pointTypeOffer.offers.length > 0;

  let resetButtonText;
  if (isDeleting) {
    resetButtonText = 'Deleting...';
  } else if (isCreating) {
    resetButtonText = 'Cancel';
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
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>

                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>
                        ${eventTypeItemTemplate}
                      </fieldset>
                    </div>
                  </div>

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${type}
                    </label>
                    <input class="event__input  event__input--destination"
                    id="event-destination-1" type="text" name="event-destination"
                    value="${editFormPointDestination?.name || ''}" list="destination-list-1"
                    onfocus="this.value=null;"
                    onchange="this.blur();"
                    ${isDisabled ? 'disabled' : ''}>
                    <datalist id="destination-list-1">
                      ${destinationListTemplate}
                    </datalist>
                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDate} ${isDisabled ? 'disabled' : ''}">
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDate} ${isDisabled ? 'disabled' : ''}">
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" ${isDisabled ? 'disabled' : ''}>
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
                    ${isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button class="event__reset-btn" type="reset">
                    ${resetButtonText}
                  </button>
                  ${!isCreating ? `
                    <button class="event__rollup-btn" type="button">
                      <span class="visually-hidden">Open event</span>
                  </button>` : ''}
                </header>
                <section class="event__details">
                  ${hasOffers ? `
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                    ${editFormOffersTemplate}
                    </div>
                   </section>` : ''}

                  ${hasDestinationContent ? `
                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                     ${editFormPointDestination.description ? `<p class="event__destination-description">${editFormPointDestination.description}</p>` : ''}
                    ${destinationPictures ? `
                    <div class="event__photos-container">
                      <div class="event__photos-tape">
                        ${destinationPictures}
                      </div>
                    </div>` : ''}
                  </section>` : ''}
                </section>
              </form>`;
}

export default class EditForm extends AbstractStatefulView {
  #datepicker = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  #destinations = null;
  #offers = null;
  #handleSumbit = null;
  #handleDelete = null;
  #handleDiscardChanges = null;
  #isCreating = false;

  constructor({point, destinations, offers, onFormSubmit, onDeleteClick, isCreating, onDiscardChanges}) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isCreating = isCreating;
    this.#handleSumbit = onFormSubmit;
    this.#handleDiscardChanges = onDiscardChanges;
    this.#handleDelete = onDeleteClick;

    this._setState(EditForm.parsePointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createEditFormTemplate(this._state, this.#destinations, this.#offers, this.#isCreating);
  }

  removeElement() {
    super.removeElement();

    if (this.#datepicker) {
      this.#datepicker.destroy();
      this.#datepicker = null;
    }
  }

  reset(point) {
    this.updateElement(EditForm.parsePointToState(point));
  }

  _restoreHandlers() {
    if (this.element.querySelector('.event__rollup-btn')) {
      this.element.querySelector('.event__rollup-btn')
        .addEventListener('click', this.#handleDiscardChanges);
    }

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
    if (evt.target.closest('input')) {
      this.updateElement({
        type: evt.target.value,
        offers: []
      });
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
    const [dateStartElement, dateEndElement] = this.element.querySelectorAll('.event__input--time');

    if (!this._state.dateFrom) {
      dateStartElement.value = '';
    }
    if (!this._state.dateTo) {
      dateEndElement.value = '';
    }

    this.#datepickerStart = flatpickr(
      dateStartElement, {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        locale: { firstDayOfWeek: 1 },
        'time_24hr': true,
        defaultDate: this._state.dateFrom || undefined,
        onChange: this.#changeStartDateHandler
      });
    this.#datepickerEnd = flatpickr(
      dateEndElement, {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        locale: { firstDayOfWeek: 1 },
        'time_24hr': true,
        defaultDate: this._state.dateTo || undefined,
        onChange: this.#changeEndDateHandler,
        minDate: this._state.dateFrom || undefined
      });
  }

  #changeStartDateHandler = ([newDate]) => {
    const isoFormatDate = convertDateToISO(newDate);
    this._setState({dateFrom: isoFormatDate});
    this.#datepickerEnd.set('minDate', isoFormatDate);
  };

  #changeEndDateHandler = ([newDate]) => {
    const isoFormatDate = convertDateToISO(newDate);
    this._setState({dateTo: isoFormatDate});
  };

  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    return point;
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSumbit(EditForm.parseStateToPoint(this._state));
  };

  #deleteHandler = (evt) => {
    evt.preventDefault();
    this.#handleDelete(EditForm.parseStateToPoint(this._state));
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
