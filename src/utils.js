import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import objectSupport from 'dayjs/plugin/objectSupport';
import { FILTERS_TYPE } from './const.js';


dayjs.extend(utc);
dayjs.extend(objectSupport);

export const formateDate = (date, format) => dayjs(date).utc().format(format);

export const getDuration = (dateFrom, dateTo) => {
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

export const isPointPast = (point) => dayjs().isAfter(dayjs(point.dateTo));

export const isPointFuture = (point) => dayjs().isBefore(dayjs(point.dateFrom));

export const isPointPresent = (point) => dayjs().isAfter(dayjs(point.dateFrom)) && dayjs().isBefore(dayjs(point.dateTo));

export const isEscapeKey = (evt) => evt.key === 'Escape';

export function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

export function sortPointsByDate(pointA, pointB) {
  return dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
}

export function sortPointsByTime(pointA, pointB) {
  const pointADur = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom), 'minute');
  const pointBDur = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom), 'minute');
  return pointBDur - pointADur;
}

export function sortPointsByPrice(pointA, pointB) {
  return pointB.basePrice - pointA.basePrice;
}

// export function createEventTypeItems(pointTypes, currentType) {
//   return pointTypes.map((type) => `<div class="event__type-item">
//   <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${currentType === type ? 'checked' : ''}>
//   <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${(type)[0].toUpperCase() + (type).slice(1)}</label>
// </div>`).join('');
// }

export const filter = {
  [FILTERS_TYPE.EVERYTHING]: (points) => [...points],
  [FILTERS_TYPE.PAST]: (points) => points.filter((point) => isPointPast(point)),
  [FILTERS_TYPE.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FILTERS_TYPE.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
};

export function isDatesEqual(dateA, dateB) {
  return (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');
}
