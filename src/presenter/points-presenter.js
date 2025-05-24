import { render } from '../framework/render';
import { sortPointsByDate, sortPointsByPrice, sortPointsByTime, updateItem } from '../utils';
import EmptyPoints from '../view/empty-points-list-view';
import PointPresenter from './point-presenter';
import Sort from '../view/sort-view.js';
import { SORT_TYPE } from '../const.js';


export default class PointsPresenter {
  #points = [];
  #offers = [];
  #destinations = [];

  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #pointsListView = null;
  #container = null;

  #pointPresenters = new Map();

  #currentSortType = null;
  #originalPoints = [];

  constructor({ pointsModel, destinationsModel, offersModel, pointsListView, eventsContainer}) {
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#pointsListView = pointsListView;
    this.#container = eventsContainer;
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#offers = [...this.#offersModel.offers];
    this.#destinations = [...this.#destinationsModel.destinations];
    this.#originalPoints = [...this.#pointsModel.points];

    this.#renderComponents();
  }

  #renderComponents() {
    this.#renderSort();
    this.#renderPointsList();
  }

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderPointsList() {
    render(this.#pointsListView, this.#container);

    if (this.#points.length === 0) {
      render(new EmptyPoints(), this.#container);
    }

    if (this.#currentSortType === null) {
      this.#sortPoints(SORT_TYPE.DAY);
    }

    for (let i = 0; i < this.#points.length; i++) {
      this.#renderPoint(this.#points[i]);
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: document.querySelector('.trip-events__list'),
      offers: this.#offers,
      destinations: this.#destinations,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPoints() {
    this.#pointPresenters.forEach((pres) => pres.destroy());
    this.#pointPresenters.clear();
  }

  #renderSort() {
    render(new Sort({onSortTypeChange: this.#handleSort}), this.#container);
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case SORT_TYPE.DAY:
        this.#points.sort(sortPointsByDate);
        break;
      case SORT_TYPE.TIME:
        this.#points.sort(sortPointsByTime);
        break;
      case SORT_TYPE.PRICE:
        this.#points.sort(sortPointsByPrice);
        break;
      default:
        this.#points = [...this.#originalPoints];
    }
    this.#currentSortType = sortType;
  }

  #handleSort = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#sortPoints(sortType);
    this.#clearPoints();
    this.#renderPointsList();
  };
}
