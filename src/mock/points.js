import { nanoid } from 'nanoid';
import { getRandomArrayElement } from '../utils';

export const points = [
  {
    id: 'J1K2',
    basePrice: 1000,
    dateFrom: '2023-07-10T22:00:00.000Z',
    dateTo: '2023-07-10T23:30:00.000Z',
    destination: 1,
    isFavorite: false,
    offers: [1, 2],
    type: 'taxi'
  },
  {
    id: 'BD1R',
    basePrice: 777,
    dateFrom: '2022-05-01T10:30:00.000Z',
    dateTo: '2022-05-02T11:22:13.375Z',
    destination: 2,
    isFavorite: true,
    offers: [1],
    type: 'flight'
  },
  {
    id: 'KAK0',
    basePrice: 13500,
    dateFrom: '2025-01-10T22:30:00.000Z',
    dateTo: '2025-01-10T22:43:13.375Z',
    destination: 3,
    isFavorite: false,
    offers: [],
    type: 'check-in'
  }
];

function getRandomPoint() {
  return {
    ...getRandomArrayElement(points), // Сначала распыляем данные точки
    id: nanoid()
  };
}

export {getRandomPoint};
