import { render, RenderPosition, replace } from '../framework/render.js';
import RouteView from '../view/route-view.js';

const CITY_MAX_COUNT = 3;
const generateRouteTitle = (points, destinationModel) => {
  if (points.length === 0) {
    return '';
  }
  const sortedPoints = points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  const cities = sortedPoints.map((point) => {
    const destination = destinationModel.getDestinationById(point.destination);
    return destination && destination.name ? destination.name : point.destination;
  });
  return cities.length > CITY_MAX_COUNT
    ? `${cities[0]} — … — ${cities[cities.length - 1]}`
    : cities.join(' — ');
};

const formatTripDates = (points) => {
  if (points.length === 0) {
    return '';
  }
  const sortedPoints = points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  const startDate = new Date(sortedPoints[0].dateFrom);
  const endDate = new Date(sortedPoints[sortedPoints.length - 1].dateTo);

  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${startDate.getDate()} — ${endDate.getDate()} ${endDate.toLocaleString('en-US', {
      month: 'short',
    })}`;
  }

  const options = { day: 'numeric', month: 'short' };
  return `${startDate.toLocaleDateString('en-US', options)} — ${endDate.toLocaleDateString('en-US', options)}`;
};

const calculateTotalCost = (points, offerModel) => points.reduce((total, point) => {
  const base = Number(point.basePrice);
  const offersTotal = (point.offers || []).reduce((sum, offerId) => {
    const foundOffer = offerModel.getOfferById(point.type, offerId);
    return foundOffer ? sum + Number(foundOffer.price) : sum;
  }, 0);
  return total + base + offersTotal;
}, 0);


export default class RoutePresenter {
  #container = null;
  #pointModel = null;
  #offerModel = null;
  #destinationModel = null;
  #routeComponent = null;

  constructor(container, pointModel, offerModel, destinationModel) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#offerModel = offerModel;
    this.#destinationModel = destinationModel;

    this.#pointModel.addObserver(this.handleModelEvent);
    this.#destinationModel.addObserver(this.handleModelEvent);
    this.#offerModel.addObserver(this.handleModelEvent);

    this.renderRoute();
  }

  handleModelEvent = () => {
    this.renderRoute();
  };

  renderRoute = () => {
    const points = this.#pointModel.points;
    const routeTitle = generateRouteTitle(points, this.#destinationModel);
    const tripDates = formatTripDates(points);
    const totalCost = calculateTotalCost(points, this.#offerModel);

    const prevRouteComponent = this.#routeComponent;
    this.#routeComponent = new RouteView({
      routeTitle,
      tripDates,
      totalCost,
    });

    if (prevRouteComponent === null) {
      render(this.#routeComponent, this.#container, RenderPosition.AFTERBEGIN);
    } else {
      replace(this.#routeComponent, prevRouteComponent);
    }
  };
}
