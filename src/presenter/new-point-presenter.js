import { remove, render, RenderPosition } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';
import EditFormView from '../view/edit-form-view.js';
import { OnEscKeyDown } from '../utils/utls.js';

export default class NewPointPresenter {
  #pointListContainer = null;
  #onDataChange = null;
  #onDestroy = null;

  #pointEditComponent = null;

  constructor(pointListContainer, onDataChange, onDestroy) {
    this.#pointListContainer = pointListContainer;
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  init(offerModel, destinationModel) {
    if (this.#pointEditComponent !== null) {
      return;
    }
    const blankPoint = {
      basePrice: 0,
      dateFrom: '',
      dateTo: '',
      destination: '',
      offers: [],
      type: 'flight',
      isFavorite: false
    };

    this.#pointEditComponent = new EditFormView(
      blankPoint,
      offerModel,
      destinationModel,
      this.#onFormSubmit,
      this.#onDeleteClick
    );

    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#onEscKeyDown);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#onDestroy();

    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    document.removeEventListener('keydown', this.#onEscKeyDown);
  }

  setSaving() {
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointEditComponent.shake(resetFormState);
  }

  #onFormSubmit = (_, point) => {
    this.#onDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #onDeleteClick = () => {
    this.destroy();
  };

  #onEscKeyDown = (evt) => {
    OnEscKeyDown(evt, this.destroy.bind(this));
  };
}
