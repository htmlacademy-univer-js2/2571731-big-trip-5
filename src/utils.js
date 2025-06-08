import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import objectSupport from 'dayjs/plugin/objectSupport';
import { FILTERS_TYPE } from './const.js';


dayjs.extend(utc);
dayjs.extend(objectSupport);

const formateDate = (date, format) => dayjs(date).utc().format(format);

const getDuration = (dateFrom, dateTo) => {
  const date1 = dayjs(dateTo);
  const date2 = dayjs(dateFrom);

  const days = date1.diff(date2, 'day');
  const hours = date1.diff(date2.add(days, 'day'), 'hour');
  const minutes = date1.diff(date2.add(days, 'day').add(hours, 'hour'), 'minute');

  if (days) {
    return `${days < 10 ? `0${days}` : days}D ${hours < 10 ? `0${hours}` : hours}H ${minutes < 10 ? `0${minutes}` : minutes}M`;
  } else if (hours) {
    return `${hours < 10 ? `0${hours}` : hours}H ${minutes < 10 ? `0${minutes}` : minutes}M`;
  }
  return `${minutes < 10 ? `0${minutes}` : minutes}M`;
};

const isPointPast = (point) => dayjs().isAfter(dayjs(point.dateTo));

const isPointFuture = (point) => dayjs().isBefore(dayjs(point.dateFrom));

const isPointPresent = (point) => dayjs().isAfter(dayjs(point.dateFrom)) && dayjs().isBefore(dayjs(point.dateTo));

const isEscapeKey = (evt) => evt.key === 'Escape';

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

function sortPointsByDate(pointA, pointB) {
  return dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
}

function sortPointsByTime(pointA, pointB) {
  const pointADur = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom), 'minute');
  const pointBDur = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom), 'minute');
  return pointBDur - pointADur;
}

function sortPointsByPrice(pointA, pointB) {
  return pointB.basePrice - pointA.basePrice;
}

const filter = {
  [FILTERS_TYPE.EVERYTHING]: (points) => [...points],
  [FILTERS_TYPE.PAST]: (points) => points.filter((point) => isPointPast(point)),
  [FILTERS_TYPE.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FILTERS_TYPE.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
};

function isDatesEqual(dateA, dateB) {
  return (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');
}

const getCurrentDate = (date) => dayjs(date).format('DD MMM');

const getOffersByType = (type, offers) => offers.find((offer) => offer.type === type)?.offers || [];

const getPriceWithoutOffers = (points) => points.reduce((sum, price) => sum + price.basePrice, 0);

const getDestination = (id, destinations) => destinations.find((destination) => destination.id === id);

const getPointOffersPrice = (point, allOffers) => {
  const pointOffers = getOffersByType(point.type, allOffers);
  const includesPointOffers = pointOffers.filter((offers) => point.offers.includes(offers.id));
  return includesPointOffers.reduce((sum, currentPoint) => sum + currentPoint.price, 0);
};

const convertDateToISO = (date) => dayjs(date).toISOString();

export { isDatesEqual, formateDate, getDuration, isPointPast, isPointFuture, isPointPresent, isEscapeKey, updateItem, sortPointsByDate, sortPointsByTime, sortPointsByPrice, filter, getCurrentDate, getPointOffersPrice, getDestination, getPriceWithoutOffers, getOffersByType, convertDateToISO };
