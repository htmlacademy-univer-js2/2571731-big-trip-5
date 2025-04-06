import { FILTERS_GENERATOR } from '../const';

const generateFilters = (points) => Object.entries(FILTERS_GENERATOR).map(([filterType, filterValue]) => ({
  type: filterType,
  count: filterValue(points).length,
}));

export {generateFilters};
