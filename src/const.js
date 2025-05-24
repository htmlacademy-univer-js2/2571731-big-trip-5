import { isPointPast, isPointFuture, isPointPresent } from './utils';

export const POINT_TYPE = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
export const DATE_FORMAT = {
  'full-date': 'YYYY-MM-DD',
  'month-day': 'MMM DD',
  'hours-minutes': 'HH:mm',
  'full-date-and-time': 'YYYY-MM-DDTHH:mm',
  'full-date-and-time-slash': 'DD/MM/YYYY HH:mm'
};
export const SORT_TYPE = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price'
};

export const FILTERS_TYPE = {
  EVERYTHING:'everything',
  FUTURE:'future',
  PRESENT: 'present',
  PAST:'past',
};

export const FILTERS_GENERATOR = {
  [FILTERS_TYPE.EVERYTHING]: (points) => [...points],
  [FILTERS_TYPE.PAST]: (points) => points.filter((point) => isPointPast(point)),
  [FILTERS_TYPE.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FILTERS_TYPE.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
};
