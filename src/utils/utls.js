import dayjs from 'dayjs';

const DATE_FORMAT = 'D MMM';
const DAYS_DIVIDER = 1000 * 60 * 60 * 24;
const HOURS_DIVIDER = 1000 * 60 * 60;
const MINUTES_DIVIDER = 1000 * 60;


function humanizeDate(dueDate, format = DATE_FORMAT) {
  return dueDate ? dayjs(dueDate).format(format) : '';
}

function getDurationTime(start, end) {
  end = dayjs(end);
  const duration = end.diff(start);
  const days = Math.floor(duration / DAYS_DIVIDER);
  const hours = Math.floor((duration % DAYS_DIVIDER) / HOURS_DIVIDER);
  const minutes = Math.floor((duration % HOURS_DIVIDER) / MINUTES_DIVIDER);

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  } else if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }
  return `${minutes.toString().padStart(2, '0')}M`;
}

function capitalizeString(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function isPresentPoint(dateFrom, dateTo) {
  return dateFrom && dateTo && !dayjs().isAfter(dateTo, 'D') && !dayjs().isBefore(dateFrom, 'D');
}

function isPastPoint(dueDate) {
  return dueDate && dayjs().isAfter(dueDate, 'D');
}

function isFuturePoint(dueDate) {
  return dueDate && dayjs().isBefore(dueDate, 'D');
}

function sortPointByDay(pointA, pointB) {
  return dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
}

function sortPointByTime(pointA, pointB) {
  const durationA = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const durationB = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));
  return durationB - durationA;
}

function isDatesEqual(dateA, dateB) {
  return (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');
}

function OnEscKeyDown(evt, callback) {
  if (evt.key === 'Escape' || evt.key === 'Esc') {
    evt.preventDefault();
    callback();
  }
}

export {
  humanizeDate,
  getDurationTime,
  capitalizeString,
  isPresentPoint,
  isFuturePoint,
  isPastPoint,
  sortPointByDay,
  sortPointByTime,
  isDatesEqual,
  OnEscKeyDown
};
