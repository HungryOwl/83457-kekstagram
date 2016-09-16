'use strict';

define('pictures', ['./load', './utils', './gallery', './picture'], function(load, utils, Gallery, Picture) {

  var PICTURES_LOAD = 'http://localhost:1506/api/pictures';

  /**
   * Массив отзывов, полученных по JSONP
   * @type {Array.<Object>}
   */
  var pictureData = [];

  /**
   * Контейнер для вставки всех картинок
   * @type {HTMLElement}
   */
  var pictureContainer = document.querySelector('.pictures');

  /**
   * Футер для проверки, заполнена ли страница
   */
  var footer = document.querySelector('.footer');

  /**
   * Форма с фильтрами
   * @type {HTMLFormElement}
   */
  var filterForm = document.querySelector('.filters');

  /**
   * Количество отрисованных фото
   * @const {number}
   */
  var PAGE_SIZE = 5;

  /**
   * Номер страницы, с которой начинаем показ фото
   * @type {number}
   */
  var pageNumber = 0;

  /**
   * Список for у меток, по которым фильтруем
   * @type {Object}
   */
  var Filter = {
    POPULAR: 'filter-popular',
    NEWEST: 'filter-new',
    DISCUSSED: 'filter-discussed'
  };

  /**
   * Дефолтный фильтр
   * @const {string}
   */
  var DEFAULT_FILTER = Filter.POPULAR;

  /**
   * Имя фильтра в локалсторедже
   * @type {string}
   */
  var filterStorageKey = 'filter';

  /**
   * Параметры для запроса по XMLHttpRequest
   * @type {Object}
   */
  var XhrParams = {
    from: pageNumber * PAGE_SIZE,
    to: pageNumber * PAGE_SIZE + PAGE_SIZE,
    filter: DEFAULT_FILTER
  };

  /**
   * Отрисовываем картинки, пробегаясь по массиву с данными
   * @param  {Array.<objects>} pictures Массив объектов, полученных по XMLHttpRequest
   */
  function renderPictures(pictures) {
    window.pictures = pictures;

    var pictureCollection = document.createDocumentFragment();
    var pictureNumber = XhrParams.from;

    pictureData.forEach(function(data) {
      var picture = new Picture(data, pictureNumber);

      pictureNumber++;
      pictureCollection.appendChild(picture.element);
    });

    pictureContainer.appendChild(pictureCollection);
  }

  /**
   * Грузим и рендерим на страницу фото при загрузке, коллбэк функции callServer
   * @param  {boolean}         error     Обработка ошибки загрузки XMLHttpRequest
   * @param  {Array.<Object>}  pictures  Массив объектов, поллученных по XMLHttpRequest
   */
  function showPictures(error, pictures) {
    if(error) {
      console.log('Данные по XMLHttpRequest не загрузились');
    } else {
      pictureData = pictures;

      renderPictures(pictures);
      Gallery.setPictures(pictureData);

      if(filterForm.classList.contains('hidden')) {
        filterForm.classList.remove('hidden');
      }
    }
  }

  /**
   * Загружаем данные с картинками по XMLHttpRequest
   */
  function loadPictures() {
    load.callServer(PICTURES_LOAD, XhrParams, showPictures);
  }

  /**
   * Проверяем, заполнен ли экран
   * @return {Boolean} true - заполнен
   *                   false - нет
   */
  function isScreenFilled() {
    var footerPosition = footer.getBoundingClientRect();

    return footerPosition.top - window.innerHeight > 0;
  }

  /**
   * Проверяем, доступна ли следующая страница
   * @param  {Array.<Object>}  pictures   Массив объектов, описывающих наши фоточки
   * @param  {number}          pageSize   Размер страницы
   * @return {Boolean}         true       - доступна (длина масива / размер страницы = 1)
   *                           false      - недоступна (длина масива / размер страницы < 1)
   */
  function isNextPageAvailable(picturesData, pageSize) {
    return picturesData.length / pageSize === 1;
  }

  /**
   * Грузим следующую пачку фото на страницу
   */
  function loadNextPage() {
    pageNumber++;
    XhrParams.from = pageNumber * PAGE_SIZE;
    XhrParams.to = pageNumber * PAGE_SIZE + PAGE_SIZE;

    loadPictures();
  }

  /**
   * Рендерим следующую пачку фото на страницу если доступен следующий кусок данных
   */
  function renderNextPage() {
    if(isNextPageAvailable(window.pictures, PAGE_SIZE)) {
      loadNextPage();
    }
  }

  /**
   * Заполняем оставшуюся часть пустого экрана при первой загрузке
   */
  function fillEmptySpaceOnScreen() {
    var renderTimeout = setTimeout(function check() {
      //Если экран не заполнен и доступен следующий пак данных,
      //показываем следующий пак фоток с помощью рекурсивного setTimeout
      if(!isScreenFilled() && isNextPageAvailable(window.pictures, PAGE_SIZE)) {
        setTimeout(check, 50);
      }

      loadNextPage();
      clearTimeout(renderTimeout);
    }, 50);
  }

  /**
   * Настраиваем фильтры по атрибуту for у метки, записываем фильтры в localStorage
   * @param {string} filter атрибут for у метки
   */
  function setFilter(filter) {
    var filterButton;

    if(filter) {
      localStorage.setItem(filterStorageKey, filter);
      XhrParams.filter = filter;

      pageNumber = 0;
      XhrParams.from = pageNumber * PAGE_SIZE;
      XhrParams.to = pageNumber * PAGE_SIZE + PAGE_SIZE;

      pictureContainer.innerHTML = '';
      Gallery.pictures = null;
    } else {
      XhrParams.filter = localStorage.getItem(filterStorageKey) || DEFAULT_FILTER;
      filterButton = filterForm.querySelector('#' + XhrParams.filter);

      if(filterButton) {
        filterButton.checked = true;
      }
    }

    loadPictures();
    fillEmptySpaceOnScreen();
  }

  /**
   * Ищем все наши метки и вешаем на них фильтры по событию change
   */
  function enableFilters() {
    filterForm.addEventListener('click', function(evt) {
      if (evt.target.classList.contains('filters-item')) {
        setFilter(evt.target.getAttribute('for'));
      }
    }, true);
  }

  /*
   * Прячем фильтры перед отрисовкой
   */
  filterForm.classList.add('hidden');

  enableFilters();
  setFilter();

  window.addEventListener('scroll', utils.throttle(renderNextPage, 50));
});
