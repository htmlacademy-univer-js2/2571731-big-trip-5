import PointsList from '../view/points-list-view.js';
import { remove, render, RenderPosition } from '../framework/render.js';
import { filter, sortPointsByDate, sortPointsByPrice, sortPointsByTime } from '../utils.js';
import { FILTERS_TYPE, SORT_TYPE, TIME_LIMIT, UpdateType, UserAction } from '../const.js';
import EmptyPoints from '../view/empty-points-list-view.js';
import Sort from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import LoadingView from '../view/loading-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import TripInfo from '../view/trip-info-view.js';
import ErrorView from '../view/error-view.js';

export default class Presenter {
  #eventsContainer = null;
  #tripInfoContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #pointsListViewComponent = new PointsList();
  #loadingViewComponent = new LoadingView();
  #errorComponent = new ErrorView();
  #sortingComponent = null;
  #noPointComponent = null;
  #tripInfoComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SORT_TYPE.DAY.text;
  #filterType = FILTERS_TYPE.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TIME_LIMIT.LOWER_LIMIT,
    upperLimit: TIME_LIMIT.UPPER_LIMIT
  });

  #onNewPointDestroy = null;

  constructor({eventsContainer, pointsModel, destinationsModel, offersModel, filterModel, onNewPointDestroy, tripInfoContainer}) {
    this.#eventsContainer = eventsContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;
    this.#tripInfoContainer = tripInfoContainer;
    this.#onNewPointDestroy = onNewPointDestroy;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointsListViewComponent.element,
      pointsModel: this.#pointsModel,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#destroyPoint
    });

    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SORT_TYPE.DAY.text:
        return filteredPoints.sort(sortPointsByDate);
      case SORT_TYPE.TIME.text:
        return filteredPoints.sort(sortPointsByTime);
      case SORT_TYPE.PRICE.text:
        return filteredPoints.sort(sortPointsByPrice);
      default:
        return filteredPoints.sort(sortPointsByDate);
    }
  }

  init() {
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#renderComponents();
    this.#handleModelEvent(UpdateType.INIT);
  }

  #renderComponents() {
    render(this.#pointsListViewComponent, this.#eventsContainer);

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.points.includes('error') || !this.#destinationsModel.destinations || !this.#offersModel.offers) {
      this.#renderError();
      return;
    }

    if (!this.points.length) {
      this.#renderEmptyPointsList();
      return;
    }

    this.#renderPointsList();
  }

  createPoint() {
    this.#currentSortType = SORT_TYPE.DAY.text;
    this.#filterModel.setFilter(UpdateType.MAJOR, FILTERS_TYPE.EVERYTHING);
    this.#newPointPresenter.init();

    remove(this.#noPointComponent);
    this.#noPointComponent = null;
  }

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch (error) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch (err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderComponents();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderComponents();
        break;
      case UpdateType.INIT:
        this.#clearBoard();
        this.#isLoading = false;
        remove(this.#loadingViewComponent);
        remove(this.#errorComponent);
        this.#renderComponents();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearBoard();
    this.#renderPointsList();
  };

  #renderSort() {
    this.#sortingComponent = new Sort({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortingComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPointsList() {
    if (!this.#destinationsModel.destinations || !this.#offersModel.offers) {
      return;
    }

    this.#renderTripInfo();
    this.#renderSort();

    remove(this.#noPointComponent);
    this.#noPointComponent = null;

    this.points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderLoading() {
    render(this.#loadingViewComponent, this.#pointsListViewComponent.element, RenderPosition.AFTERBEGIN);
  }

  #renderError() {
    render(this.#errorComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#tripInfoComponent);
    remove(this.#sortingComponent);
    remove(this.#loadingViewComponent);
    remove(this.#errorComponent);

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    if (resetSortType) {
      this.#currentSortType = SORT_TYPE.DAY.text;
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointsListViewComponent.element,
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderEmptyPointsList() {
    if (this.#noPointComponent) {
      return;
    }

    this.#noPointComponent = new EmptyPoints({
      filterType: this.#filterType
    });

    render(this.#noPointComponent, this.#pointsListViewComponent.element);
  }

  #renderTripInfo = () => {
    this.#tripInfoComponent = new TripInfo({
      points: this.#pointsModel.points,
      destinations: this.#destinationsModel.destinations,
      offers: this.#offersModel.offers,
    });
    render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
  };

  #destroyPoint = () => {
    this.#onNewPointDestroy();

    if (!this.points.length) {
      this.#renderEmptyPointsList();
    }
  };
}
