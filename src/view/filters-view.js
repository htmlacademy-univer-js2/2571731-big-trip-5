import AbstractView from '../framework/view/abstract-view.js';

function createFilterItem(filter) {
  const {type, count} = filter;

  return (
    `
    <div class="trip-filters__filter">
      <input id="filter-${type}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${type}"
      ${count === 0 && type !== 'everything' ? 'disabled' : ''}
      ${type === 'everything' ? 'checked' : ''}>
      <label class="trip-filters__filter-label" for="filter-${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
    </div>
    `
  );
}

function createFiltersTemplate(filters) {
  const filtersTemplate = filters.map((filter) => createFilterItem(filter)).join('');

  return `<form class="trip-filters" action="#" method="get">
            ${filtersTemplate}
            <button class="visually-hidden" type="submit">Accept filter</button>
          </form>`;
}

export default class Filters extends AbstractView {
  #filters;

  constructor({filters = []} = {}) {
    super();
    this.#filters = filters;
  }

  get template() {
    return createFiltersTemplate(this.#filters);
  }
}
