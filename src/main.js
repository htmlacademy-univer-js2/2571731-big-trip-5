import Presenter from './presenter/main-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationModel from './model/destinatione-model.js';
import OffersModel from './model/offers-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import { render } from './framework/render.js';
import NewPointButtonView from './view/new-point-button.js';
import PointsApiService from './points-api-service.js';

const AUTHORIZATION = 'Basic hg19gk364u';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);

const filtersContainer = document.body.querySelector('.trip-controls__filters');
const eventsContainer = document.body.querySelector('.trip-events');
const siteHeaderElement = document.body.querySelector('.trip-main');

const pointsModel = new PointsModel({pointsApiService});
const destinationsModel = new DestinationModel({pointsApiService});
const offersModel = new OffersModel({pointsApiService});
const filterModel = new FilterModel();

pointsModel.init();
destinationsModel.init();
offersModel.init();

const presenter = new Presenter({
  eventsContainer: eventsContainer,
  filtersContainer: filtersContainer,
  pointsModel: pointsModel,
  destinationsModel: destinationsModel,
  offersModel: offersModel,
  filterModel: filterModel,
  onNewPointDestroy: handleNewPointFormClose});

const filterPresenter = new FilterPresenter({
  filterContainer: filtersContainer,
  filterModel: filterModel,
  pointsModel: pointsModel
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function handleNewPointButtonClick() {
  presenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

render(newPointButtonComponent, siteHeaderElement);

presenter.init();
filterPresenter.init();
