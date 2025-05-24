import {generateFilters} from '../mock/filters.js';
import Filters from '../view/filters-view.js';
import PointsList from '../view/points-list-view.js';
import { render } from '../framework/render.js';
import { updateItem } from '../utils.js';
import PointsPresenter from './points-presenter.js';

export default class Presenter {
  #eventsContainer = null;
  #filterContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #pointsListViewComponent = new PointsList();
  #pointsPresenter = null;

  constructor({eventsContainer, filtersContainer, pointsModel, destinationsModel, offersModel}) {
    this.#filterContainer = filtersContainer;
    this.#eventsContainer = eventsContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
  }

  init() {
    this.points = this.#pointsModel.getPoints();
    this.destinations = this.#destinationsModel.getDestinations();
    this.offers = this.#offersModel.getOffers();

    this.renderPage();
  }

  renderPage() {
    this.#renderFilters();

    render(this.#pointsListViewComponent, this.#eventsContainer);
    this.#renderPoints();
  }

  #renderPoints() {
    this.#pointsPresenter = new PointsPresenter({
      pointsModel: this.#pointsModel,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      pointsListView: this.#pointsListViewComponent,
      eventsContainer: this.#eventsContainer
    });
    this.#pointsPresenter.init();
  }

  handleEventChange = (updatedPoint) => {
    this.points = updateItem(this.points, updatedPoint);
    this.#pointsPresenter.updatePoint(updatedPoint);
  };

  #renderFilters() {
    const filters = generateFilters(this.points);
    render(new Filters({filters}), this.#filterContainer);
  }
}
