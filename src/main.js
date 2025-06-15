import MainPresenter from './presenter/list-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import PointModel from './model/point-model.js';
import OfferModel from './model/offer-model.js';
import DestinationModel from './model/destination-model.js';
import NewPointView from './view/new-point-view.js';
import { render, RenderPosition } from './framework/render.js';
import PointsApiService from './api/point-api-service.js';
import OffersApiService from './api/offer-api-service.js';
import DestinationsApiService from './api/destination-api-service.js';
import RoutePresenter from './presenter/route-presenter.js';

const AUTHORIZATION = 'Basic ssj52f854f3h3v9f';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const siteHeaderFiltersElement = document.querySelector('.trip-controls__filters');
const siteBodySortElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-main');


const filterModel = new FilterModel();
const pointModel = new PointModel(new PointsApiService(END_POINT, AUTHORIZATION));
const offerModel = new OfferModel(new OffersApiService(END_POINT, AUTHORIZATION));
const destinationModel = new DestinationModel(new DestinationsApiService(END_POINT, AUTHORIZATION));


new RoutePresenter(siteHeaderElement, pointModel, offerModel, destinationModel);

const filterPresenter = new FilterPresenter(
  siteHeaderFiltersElement,
  filterModel,
  pointModel
);

const mainPresenter = new MainPresenter(
  siteBodySortElement,
  pointModel,
  offerModel,
  destinationModel,
  filterModel,
  onNewPointFormClose
);


const newPointButtonComponent = new NewPointView(onNewPointButtonClick);

function onNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function onNewPointButtonClick() {
  mainPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}
filterPresenter.init();
mainPresenter.init();
Promise.all([
  pointModel.init(),
  offerModel.init(),
  destinationModel.init()
]).then(() => {
  render(newPointButtonComponent, siteHeaderElement, RenderPosition.BEFOREEND);
});
