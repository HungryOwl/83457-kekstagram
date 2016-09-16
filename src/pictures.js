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

  function Pictures() {
    /*
     * Прячем фильтры перед отрисовкой
     */
    filterForm.classList.add('hidden');

    this
      .bindListeners()
      .enableFilters()
      .setFilter();

    window.addEventListener('scroll', utils.throttle(this.renderNextPage, 50));
  }

  Pictures.prototype.bindListeners = function() {
    this.renderPictures = this.renderPictures.bind(this);
    this.showPictures = this.showPictures.bind(this);
    this.fillEmptySpaceOnScreen = this.fillEmptySpaceOnScreen.bind(this);
    this.isScreenFilled = this.isScreenFilled.bind(this);
    this.isNextPageAvailable = this.isNextPageAvailable.bind(this);
    this.renderNextPage = this.renderNextPage.bind(this);
    this.enableFilters = this.enableFilters.bind(this);
    this.getFilter = this.getFilter.bind(this);
    this.setFilter = this.setFilter.bind(this);

    return this;
  };

  /**
   * Отрисовываем картинки, пробегаясь по массиву с данными
   * @param  {Array.<objects>} pictures Массив объектов, полученных по XMLHttpRequest
   */
  Pictures.prototype.renderPictures = function(pictures) {
    window.pictures = pictures;
    console.log('window.pictures ', window.pictures);

    var pictureCollection = document.createDocumentFragment();
    var pictureNumber = XhrParams.from;

    pictureData.forEach(function(data) {
      var picture = new Picture(data, pictureNumber);

      pictureNumber++;
      pictureCollection.appendChild(picture.element);
    });

    pictureContainer.appendChild(pictureCollection);
  };

  /**
   * Грузим и рендерим на страницу фото при загрузке, коллбэк функции callServer
   * @param  {boolean}         error     Обработка ошибки загрузки XMLHttpRequest
   * @param  {Array.<Object>}  pictures  Массив объектов, поллученных по XMLHttpRequest
   */
  Pictures.prototype.showPictures = function(error, pictures) {
    if(error) {
      console.log('Данные по XMLHttpRequest не загрузились');
    } else {
      pictureData = pictures;

      this.renderPictures(pictures);
      Gallery.setPictures(pictureData);

      if(filterForm.classList.contains('hidden')) {
        filterForm.classList.remove('hidden');
      }
    }
  };

  /**
   * Загружаем данные с картинками по XMLHttpRequest
   */
  Pictures.prototype.loadPictures = function() {
    load.callServer(PICTURES_LOAD, XhrParams, this.showPictures);
  };

  /**
   * Проверяем, заполнен ли экран
   * @return {Boolean} true - заполнен
   *                   false - нет
   */
  Pictures.prototype.isScreenFilled = function() {
    var footerPosition = footer.getBoundingClientRect();

    return footerPosition.top - window.innerHeight > 0;
  };

  /**
   * Проверяем, доступна ли следующая страница
   * @param  {Array.<Object>}  pictures   Массив объектов, описывающих наши фоточки
   * @param  {number}          pageSize   Размер страницы
   * @return {Boolean}         true       - доступна (длина масива / размер страницы = 1)
   *                           false      - недоступна (длина масива / размер страницы < 1)
   */
  Pictures.prototype.isNextPageAvailable = function(picturesData, pageSize) {
    console.log('picturesData в isNextPageAvailable ', picturesData);
    return picturesData.length / pageSize === 1;
  };

  /**
   * Грузим следующую пачку фото на страницу
   */
  Pictures.prototype.loadNextPage = function() {
    pageNumber++;
    XhrParams.from = pageNumber * PAGE_SIZE;
    XhrParams.to = pageNumber * PAGE_SIZE + PAGE_SIZE;

    this.loadPictures();
  };

  /**
   * Рендерим следующую пачку фото на страницу если доступен следующий кусок данных
   */
  Pictures.prototype.renderNextPage = function() {
    if(this.isNextPageAvailable(window.pictures, PAGE_SIZE)) {
      this.loadNextPage();
    }
  };

  /**
   * Проверяем, заполнен ли экран - callback для таймаута в fillEmptySpaceOnScreen
   * @param  {number} timerId Id таймаута, по которому он будет сброшен
   * @return {Function}       Проверяем, заполнен ли экран
   */
  Pictures.prototype.check = function(timerId) {
    return function() {
      //Если экран не заполнен и доступен следующий пак данных,
      //показываем следующий пак фоток с помощью рекурсивного setTimeout
      if(!this.isScreenFilled() && this.isNextPageAvailable(window.pictures, PAGE_SIZE)) {
        setTimeout(this.check(timerId), 50);
      }

      this.loadNextPage();
      clearTimeout(timerId);
    }.bind(this);
  };

  /**
   * Заполняем оставшуюся часть пустого экрана при первой загрузке
   */
  Pictures.prototype.fillEmptySpaceOnScreen = function() {
    var renderTimeout = setTimeout(this.check(renderTimeout), 50);
  };

  /**
   * Настраиваем фильтры по атрибуту for у метки, записываем фильтры в localStorage
   * @param {string} filter атрибут for у метки
   */
  Pictures.prototype.setFilter = function(filter) {
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

    this.loadPictures();
    this.fillEmptySpaceOnScreen();

    return this;
  };

  /**
   * Устанавливаем фильтры - callback для функции enableFilters с листенером
   * @param  {Object} evt Объект, описывающий событие и хранящий его параметры
   */
  Pictures.prototype.getFilter = function(evt) {
    if (evt.target.classList.contains('filters-item')) {
      this.setFilter(evt.target.getAttribute('for'));
    }

    return this;
  };

  /**
   * Ищем все наши метки и вешаем на них фильтры
   */
  Pictures.prototype.enableFilters = function() {
    filterForm.addEventListener('click', this.getFilter, true);

    return this;
  };

  return new Pictures();
});
