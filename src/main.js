import { render } from './framework/render.js';
import Filters from '../src/view/filters-view.js';
import Presenter from './presenter/main-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationModel from './model/destinatione-model.js';
import OffersModel from './model/offers-model.js';
import { generateFilters } from './mock/filters.js';

const filtersContainer = document.body.querySelector('.trip-controls__filters');
const eventsContainer = document.body.querySelector('.trip-events');

const pointsModel = new PointsModel();
const destinationsModel = new DestinationModel();
const offersModel = new OffersModel();
pointsModel.init();
destinationsModel.init();
offersModel.init();

const filters = generateFilters(pointsModel.getPoints());

render(new Filters({filters}), filtersContainer);

const presenter = new Presenter({container: eventsContainer, pointsModel, destinationsModel, offersModel});

presenter.init();
