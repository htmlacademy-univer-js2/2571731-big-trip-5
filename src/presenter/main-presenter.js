import PointsList from '../view/points-list-view.js';
import { remove, render, RenderPosition } from '../framework/render.js';
import { filter, sortPointsByDate, sortPointsByPrice, sortPointsByTime } from '../utils.js';
import { FILTERS_TYPE, SORT_TYPE, UpdateType, UserAction } from '../const.js';
import EmptyPoints from '../view/empty-points-list-view.js';
import Sort from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import LoadingView from '../view/loading-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

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
  #loadingViewComponent = new LoadingView();
  #filtersComponent = null;
  #sortingComponent = null;
  #noPointComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SORT_TYPE.DAY;
  #filterType = FILTERS_TYPE.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

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
    this.#offers = [...this.#offersModel.offers];
    this.#destinations = [...this.#destinationsModel.destinations];

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#offersModel.addObserver(this.#handleModelEvent);
    this.#destinationsModel.addObserver(this.#handleModelEvent);

    this.#renderComponents();
    this.#handleModelEvent(UpdateType.INIT);
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
        this.#renderPointsList();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderPointsList();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingViewComponent);
        this.#renderPointsList();
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

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (!this.#destinationsModel.destinations || !this.#offersModel.offers) {
      return;
    }

    const points = this.points;

    if (points.length === 0) {
      this.#renderEmptyPointsList();
      return;
    }

    if (this.#offersModel.offers.length === 0 || this.#destinationsModel.destinations.length === 0) {
      this.#renderLoading();
      return;
    }

    for (let i = 0; i < this.points.length; i++) {
      remove(this.#noPointComponent);
      this.#renderPoint(this.points[i]);
    }
  }

  #renderLoading() {
    render(this.#loadingViewComponent, this.#pointsListViewComponent.element, RenderPosition.AFTERBEGIN);
  }

  #clearBoard({ resetSortType = false } = {}) {

    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#loadingViewComponent);

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
}
