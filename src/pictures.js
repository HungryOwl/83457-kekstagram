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
   * Форма с фильтрами
   * @type {HTMLFormElement}
   */
  var filterForm = document.querySelector('.filters');

  /**
   * Количество отрисованных фото
   * @const {Number}
   */
  var PAGE_SIZE = 12;

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
   * Параметры для запроса по xhr - описать по @typedef
   * @type {Object}
   */
  var XhrParams = {
    from: pageNumber * PAGE_SIZE,
    to: pageNumber * PAGE_SIZE + PAGE_SIZE,
    filter: DEFAULT_FILTER
  };

  /**
   * Отрисовываем картинки, пробегаясь по массиву с данными
   */
  function renderImages() {
    var pictureCollection = document.createDocumentFragment();
    var pictureNumber = XhrParams.from;

    pictureData.forEach(function(data) {
      var picture = new Picture(data, pictureNumber);

      pictureNumber++;
      pictureCollection.appendChild(picture.element);
    });

    pictureContainer.appendChild(pictureCollection);

    pageNumber++;
    XhrParams.from = pageNumber * PAGE_SIZE;
    XhrParams.to = pageNumber * PAGE_SIZE + PAGE_SIZE;
  }

  /*
   * Прячем фильтры перед отрисовкой
   */
  filterForm.classList.add('hidden');

  /**
   * Грузим следующую страницу
   * @param  {boolean}         error     Обработка ошибки загрузки xhr
   * @param  {Array.<Object>}  pictures  Массив объектов, поллученных по xhr
   */
  function loadNextPhotosPage(error, pictures) {
    if(error) {
      console.log('Данные по xhr не загрузились');
    } else {
      pictureData = pictures;

      renderImages();
      Gallery.setPictures(pictureData);
    }
  }

  /**
   * Загружаем данные по xhr
   */
  load.callServer(PICTURES_LOAD, XhrParams, function(error, pictures) {
    if(error) {
      console.log('Данные по xhr не загрузились');
    } else {
      pictureData = pictures;

      renderImages();
      Gallery.setPictures(pictureData);

      filterForm.classList.remove('hidden');
    }
  });

  window.addEventListener('scroll', function() {
    load.callServer(PICTURES_LOAD, XhrParams, loadNextPhotosPage);
  });
});



