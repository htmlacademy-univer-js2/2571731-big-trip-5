import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { capitalizeString, humanizeDate } from '../utils/utls.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

function createFormTemplate(state, offerModel, destinationModel, isNewPoint) {
  const {
    basePrice,
    dateFrom,
    dateTo,
    destination,
    offers,
    type,
    isDisabled,
    isSaving,
    isDeleting,
  } = state;
  const pointOffers = [];
  for (const offerId of offers) {
    pointOffers.push(offerModel.getOfferById(type, offerId));
  }

  const allOffers = offerModel.getOfferByType(type);
  const availableOfferIds = allOffers.map((offer) => offer.id);
  const filteredOffers = offers.filter((id) => availableOfferIds.includes(id));
  const { name, description, pictures } = destinationModel.getDestinationById(destination);
  const deleteText = isDeleting ? 'Deleting...' : 'Delete';
  return `
            <li class="trip-events__item">
              <form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>

                    <div class="event__type-list">
                      <fieldset class="event__type-group" ${isDisabled ? 'disabled' : ''}>
                        <legend class="visually-hidden">Event type</legend>

                        <div class="event__type-item">
                          <input id="event-type-taxi-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="taxi" ${type === 'taxi' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--taxi" for="event-type-taxi-1">Taxi</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-bus-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="bus" ${type === 'bus' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--bus" for="event-type-bus-1">Bus</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-train-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="train" ${type === 'train' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--train" for="event-type-train-1">Train</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-ship-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="ship" ${type === 'ship' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--ship" for="event-type-ship-1">Ship</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-drive-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="drive" ${type === 'drive' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--drive" for="event-type-drive-1">Drive</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-flight-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="flight" ${type === 'flight' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--flight" for="event-type-flight-1">Flight</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-check-in-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="check-in" ${type === 'check-in' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--check-in" for="event-type-check-in-1">Check-in</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-sightseeing-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="sightseeing" ${type === 'sightseeing' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--sightseeing" for="event-type-sightseeing-1">Sightseeing</label>
                        </div>

                        <div class="event__type-item">
                          <input id="event-type-restaurant-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="restaurant" ${type === 'restaurant' ? 'checked' : ''}>
                          <label class="event__type-label  event__type-label--restaurant" for="event-type-restaurant-1">Restaurant</label>
                        </div>
                      </fieldset>
                    </div>
                  </div>

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${capitalizeString(type)}
                    </label>
                    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(name)}" list="destination-list-1" ${isDisabled ? 'disabled' : ''}>
                    <datalist id="destination-list-1">
                    ${destinationModel.destinations.map((dest) => `<option value="${dest.name}"></option>`)}
                    </datalist>
                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time"
                    value="${humanizeDate(dateFrom, 'DD/MM/YY HH:mm')}" ${isDisabled ? 'disabled' : ''}>
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time"
                    value="${humanizeDate(dateTo, 'DD/MM/YY HH:mm')}" ${isDisabled ? 'disabled' : ''}>
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}" ${isDisabled ? 'disabled' : ''}>
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit"${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
                  <button class="event__reset-btn" type="reset"${isDisabled ? 'disabled' : ''}>${!isNewPoint ? deleteText : 'Cancel'}</button>
                  ${!isNewPoint ? `<button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>` : ''}
                </header>
                <section class="event__details">
                  ${allOffers?.length > 0 ? `
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                    ${allOffers.map((offer) => `
                      <div class="event__offer-selector">
                        <input class="event__offer-checkbox visually-hidden"
                        id="event-offer-${offer.id}-1"
                        type="checkbox"
                        name="event-offer-${offer.id}"
                        ${filteredOffers.includes(offer.id) ? 'checked' : ''}
                        data-offer-id="${offer.id}" ${isDisabled ? 'disabled' : ''}>
                        <label class="event__offer-label" for="event-offer-${offer.id}-1">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>
                    `).join('')}
                    </div>
                  </section>` : ''}
                  ${(description || pictures?.length > 0) ? `
                  <section class="event__section  event__section--destination">
                    ${description && `
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${description}</p>
                    `}
                  ${pictures?.length > 0 ? `
                      <div class="event__photos-container">
                        <div class="event__photos-tape">
                          ${pictures.map((picture) => `
                            <img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </section>` : ''}
                </section>
              </form>
            </li>
  `;
}

export default class EditFormView extends AbstractStatefulView {
  #allOffers;
  #allDestination;
  #onFormSubmit;
  #onEditButtonClick;
  #onDeletePoint;
  #datepickerStart;
  #datepickerEnd;
  #isNewPoint = false;
  #initialPoint;

  constructor(pointModel, offerModel, destinationModel, onFormSubmit, onDeletePoint, onEditButtonClick) {
    super();
    this.#initialPoint = { ...pointModel };
    this._setState(this.parsePointToState(pointModel));
    this.#allOffers = offerModel;
    this.#allDestination = destinationModel;
    this.#onEditButtonClick = onEditButtonClick;
    this.#isNewPoint = onEditButtonClick === undefined;
    this.#onFormSubmit = onFormSubmit;
    this.#onDeletePoint = onDeletePoint;
    this._restoreHandlers();
  }

  get template() {
    return createFormTemplate(this._state, this.#allOffers, this.#allDestination, this.#isNewPoint);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#onFormStateSubmit);
    if (!this.#isNewPoint) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onEditButtonClick);
    }
    this.element.querySelector('.event__type-group').addEventListener('change', (evt) => {
      this.#onTypeListChange(evt);
    });
    this.element.querySelector('.event__input--destination').addEventListener('change', (evt) => {
      this.#onCityChange(evt);
    });
    this.element.querySelector('.event__reset-btn').addEventListener('click', (evt) => {
      this.#onDeleteStateButton(evt);
    });
    this.element.querySelector('.event__input--price').addEventListener('input', this.#onPriceInput);
    this.element.querySelectorAll('.event__offer-checkbox').forEach(
      (checkbox) => checkbox.addEventListener('change', this.#onOfferChange)
    );
    this.#setDatepickerStart();
    this.#setDatepickerEnd();
  }

  #setDatepickerStart = () => {
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
    }
    this.#datepickerStart = flatpickr(this.element.querySelector('#event-start-time-1'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      onChange: (selectedDates) => {
        this._setState({ dateFrom: selectedDates[0].toISOString() });
      }
    });
  };

  #setDatepickerEnd = () => {
    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
    }
    this.#datepickerEnd = flatpickr(this.element.querySelector('#event-end-time-1'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      onChange: (selectedDates) => {
        this._setState({ dateTo: selectedDates[0].toISOString() });
      }
    });
  };


  #onPriceInput = (evt) => {
    const price = parseInt(evt.target.value, 10);
    this._setState({
      basePrice: price
    });
  };


  #onOfferChange = (evt) => {
    const offerId = evt.target.dataset.offerId;
    const newOffers = evt.target.checked
      ? [...this._state.offers, offerId]
      : this._state.offers.filter((id) => id !== offerId);
    this._setState({
      offers: newOffers
    });
  };


  #onFormStateSubmit = (evt) => {
    evt.preventDefault();
    const point = EditFormView.parseStateToPoint(this._state);
    if (isNaN(point.basePrice) || point.basePrice <= 0 || !this._state.dateTo || !this._state.dateFrom
      || new Date(this._state.dateFrom) >= new Date(this._state.dateTo) || !point.destination) {
      this.shake();
      return;
    }
    this.#onFormSubmit(evt, point);
  };


  #onCityChange = (evt) => {
    const city = evt.target.value;
    const newDestination = this.#allDestination.destinations.find((destination) => (destination.name || '') === city)?.id;
    if (newDestination) {
      this.updateElement({
        destination: newDestination
      });
    } else {
      this.updateElement({
        destination: null
      });
    }
  };

  #onTypeListChange = (evt) => {
    evt.preventDefault();
    const targetType = evt.target.value;
    const typeOffers = this.#allOffers.getOfferByType(targetType);
    this.updateElement({
      type: targetType,
      typeOffers: typeOffers,
    });
  };

  #onDeleteStateButton = (evt) => {
    evt.preventDefault();
    if (this.#isNewPoint) {
      this.#onDeletePoint();

    } else {
      this.#onDeletePoint(EditFormView.parseStateToPoint(this._state));
    }
  };

  resetToInitialState() {
    this.updateElement(this.parsePointToState(this.#initialPoint));
  }

  parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }
}

