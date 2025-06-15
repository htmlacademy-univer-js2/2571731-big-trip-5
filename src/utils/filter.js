import { FilterType } from '../const';
import { isFuturePoint, isPastPoint, isPresentPoint } from './utls';

const filter = {
  [FilterType.EVERYTHING]: (points)=> points,
  [FilterType.FUTURE]: (points)=> points.filter((point)=>
    isFuturePoint(point.dateFrom)
  ),
  [FilterType.PRESENT]: (points)=> points.filter((point)=>
    isPresentPoint(point.dateFrom, point.dateTo)
  ),
  [FilterType.PAST]: (points)=> points.filter((point)=>
    isPastPoint(point.dateTo)
  )
};

export {filter};
