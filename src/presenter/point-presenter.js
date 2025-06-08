import PointView from '../view/point-view.js';
import EditForm from '../view/edit-form-view.js';
import { remove, render, replace } from '../framework/render.js';
import { isDatesEqual, isEscapeKey } from '../utils.js';
import { MODE, UpdateType, UserAction } from '../const.js';

export default class PointPresenter {
  #pointListContainer = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #offers = [];
  #destinations = [];

  #point = null;
  #pointComponent = null;
  #editFormComponent = null;
  #mode = MODE.DEFAULT;

  constructor({ pointListContainer, offers, destinations, onDataChange, onModeChange }) {
    this.#pointListContainer = pointListContainer;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevEditFormComponent = this.#editFormComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
      onEditClick: () => {
        this.#replacePointToEditForm();
      },
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editFormComponent = new EditForm({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onFormSubmit: this.#handleSubmit,
      onDiscardChanges: this.#handleDiscardChanges,
      onDeleteClick: this.#handleDeleteClick
    });

    if (prevPointComponent === null || prevEditFormComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === MODE.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === MODE.EDITING) {
      replace(this.#pointComponent, prevEditFormComponent);
      this.#mode = MODE.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevEditFormComponent);
  }

  #replacePointToEditForm() {
    replace(this.#editFormComponent, this.#pointComponent);
    this.#handleModeChange();
    this.#mode = MODE.EDITING;
    document.addEventListener('keydown', this.#onEscKeyDownClose);
  }

  #replaceEditFormToPoint() {
    replace(this.#pointComponent, this.#editFormComponent);
    document.removeEventListener('keydown', this.#onEscKeyDownClose);
    this.#mode = MODE.DEFAULT;
  }

  #onEscKeyDownClose = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#handleDiscardChanges();
      document.removeEventListener('keydown', this.#onEscKeyDownClose);
    }
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite }
    );
  };

  #handleSubmit = (update) => {
    const isMinorUpdate =
      this.#point.basePrice !== update.basePrice ||
      !isDatesEqual(this.#point.dateFrom, update.dateFrom) ||
      !isDatesEqual(this.#point.dateTo, update.dateTo);

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update,
    );
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #handleDiscardChanges = () => {
    this.#editFormComponent.reset(this.#point);
    this.#replaceEditFormToPoint();
  };

  destroy() {
    remove(this.#pointComponent);
    remove(this.#editFormComponent);
  }

  resetView() {
    if (this.#mode !== MODE.DEFAULT) {
      this.#editFormComponent.reset(this.#point);
      this.#replaceEditFormToPoint();
    }
  }

  setSaving() {
    if (this.#mode === MODE.EDITING) {
      this.#editFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === MODE.EDITING) {
      this.#editFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === MODE.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#editFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editFormComponent.shake(resetFormState);
  }
}
