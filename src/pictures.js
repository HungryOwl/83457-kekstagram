'use strict';

(function() {
  var amountOfRequests = 0;

  var PICTURES_LOAD = 'http://localhost:1506/api/pictures';

  var pictures = [];

  var pictureContainer = document.querySelector('.pictures');

  var filterForm = document.querySelector('.filters');

  var htmlElementToClone = getTemplateClone('#picture-template', '.picture');

  /**
   * Отрисовываем картинки
   */
  function renderImages() {
    var pictureCollection = document.createDocumentFragment();

    pictures.forEach(function(data) {
      pictureCollection.appendChild(getPictureElement(data));
    });

    pictureContainer.appendChild(pictureCollection);
  }

  /**
   * Задаем
   * @param  {Object} data
   * @param  {HTMLElement} element DOM-элемент, заполненный данными
   * @return {HTMLElement} element DOM-элемент, заполненный данными и атрибутом src у тега img
   */
  function getPictureImg(data, element) {
    var elementImg = element.querySelector('img');
    var PICTURE_SIZE = 182;

    function onImageLoad(error) {
      if(error) {
        element.classList.add('picture-load-failure');
      } else {
        elementImg.height = PICTURE_SIZE;
        elementImg.width = PICTURE_SIZE;
        elementImg.src = data.url;
      }
    }

    loadImg(data.url, onImageLoad);

    return element;
  }

  /**
   * Генерируем DOM-элемент с данными
   * @param  {Object} data Данные, которыми заполняем шаблон
   * @return {HTMLElement} DOM-элемент, заполненный данными
   */
  function getPictureElement(data) {
    var element = htmlElementToClone.cloneNode(true);

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    getPictureImg(data, element);

    return element;
  }

  /**
   * Ищет шаблон и клонирует
   * @param  {string} template      селектор самого шаблона
   * @param  {string} innerSelector имя конкретного шаблона
   * @return {HTMLElement}          склонированный элемент
   */
  function getTemplateClone(template, innerSelector) {
    var templateElement = document.querySelector(template);
    var elementToClone;

    if ('content' in templateElement) {
      elementToClone = templateElement.content.querySelector(innerSelector);
    } else {
      elementToClone = templateElement.querySelector(innerSelector);
    }

    return elementToClone;
  }

  /**
   * Создаем картинку через конструктор, загружаем ее и отрабатываем все состяния с помощью коллбэка
   * @param {string} url                 ссылка, по которой грузим картинку
   * @param {LoadImageCallback} callback отрабатываем загрузку картинки/ошибку загрузки
   */
  function loadImg(url, callback) {
    var img = new Image();
    var imgTimeout;
    var IMAGE_TIMEOUT = 15000;

    img.addEventListener('load', function() {
      clearTimeout(imgTimeout);
      callback(false);
    });

    img.addEventListener('error', function() {
      clearTimeout(imgTimeout);
      callback(true);
    });

    imgTimeout = setTimeout(function() {
      callback(true);
    }, IMAGE_TIMEOUT);

    img.src = url;
  }

  /**
   * Получаем данные с сервера по JSONP
   * @param  {string}   url      Адрес, по которому получаем данные
   * @param  {Function} callback Обрабатываем данные после загрузки
   */
  function requestJsonp(url, callback) {
    var cbName = 'cbJSONP' + amountOfRequests++;
    var script = document.createElement('script');

    script.src = url + '?callback=' + cbName;
    document.body.appendChild(script);

    window[cbName] = function(data) {
      callback(data);
      document.body.removeChild(script);
      delete window[cbName];
    };
  }

  /*
   * Прячем фильтры перед отрисовкой
   */
  filterForm.classList.add('hidden');

  requestJsonp(PICTURES_LOAD, function(picturesData) {
    pictures = picturesData;

    renderImages();
    filterForm.classList.remove('hidden');
  });
})();

