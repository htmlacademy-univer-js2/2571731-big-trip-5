import PointsList from '../view/points-list-view.js';
import { remove, render } from '../framework/render.js';
import { filter, sortPointsByDate, sortPointsByPrice, sortPointsByTime } from '../utils.js';
import { FILTERS_TYPE, SORT_TYPE, UpdateType, UserAction } from '../const.js';
import EmptyPoints from '../view/empty-points-list-view.js';
import Sort from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';

export default class Presenter {
  #eventsContainer = null;
  #filterContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #offers = [];
  #destinations = [];

  #pointsListViewComponent = new PointsList();
  #filtersComponent = null;
  #sortingComponent = null;
  #noPointComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SORT_TYPE.DAY;
  #filterType = FILTERS_TYPE.EVERYTHING;

  constructor({eventsContainer, filtersContainer, pointsModel, destinationsModel, offersModel, filterModel, onNewPointDestroy}) {
    this.#eventsContainer = eventsContainer;
    this.#filterContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointsListViewComponent.element,
      pointsModel: this.#pointsModel,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SORT_TYPE.TIME:
        return filteredPoints.sort(sortPointsByTime);
      case SORT_TYPE.PRICE:
        return filteredPoints.sort(sortPointsByPrice);
    }

    return filteredPoints.sort(sortPointsByDate);
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offers() {
    return this.#pointsModel.offers;
  }

  init() {
    this.#destinations = this.#destinationsModel.getDestinations();
    this.#offers = this.#offersModel.getOffers();

    this.#renderComponents();
  }

  #renderComponents() {
    this.#renderSort();
    this.#renderPointsList();
  }

  createPoint() {
    this.#currentSortType = SORT_TYPE.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FILTERS_TYPE.EVERYTHING);
    this.#newPointPresenter.init();
  }

  #handlePointChange = (updatedPoint) => {
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderPointsList();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderPointsList();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearBoard();
    this.#renderSort();
    this.#renderPointsList();
  };

  #renderSort() {
    if (!this.#sortingComponent) {
      this.#sortingComponent = new Sort({
        currentSortType: this.#currentSortType,
        onSortTypeChange: this.#handleSortTypeChange
      });
      render(this.#sortingComponent, this.#eventsContainer);
    }
  }

  #renderPointsList() {
    render(this.#pointsListViewComponent, this.#eventsContainer);

    const points = this.points;

    if (points.length === 0) {
      this.#renderEmptyPointsList();
    }

    for (let i = 0; i < this.points.length; i++) {
      this.#renderPoint(this.points[i]);
    }
  }

  #clearBoard({ resetSortType = false } = {}) {

    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SORT_TYPE.DAY;
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointsListViewComponent.element,
      offers: this.#offers,
      destinations: this.#destinations,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderEmptyPointsList() {
    this.#noPointComponent = new EmptyPoints({
      filterType: this.#filterType
    });
    render(this.#noPointComponent, this.#pointsListViewComponent.element);
  }
}
