import MainPresenter from './presenter/mainPresenter';

const siteBodySortElement = document.querySelector('.trip-events');
const mainPresenter = new MainPresenter({container: siteBodySortElement});
mainPresenter.init();
