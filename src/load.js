'use strict';

define('load', function() {
  var amountOfRequests = 0;

  /**
   * Отрабатываем состояния загрузки и ошибки
   * @callback LoadJSONPCallback
   * @param {Array<Object>} - Обрабатываем массив объектов с данными
   */

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

  /**
   * Коллбэк, отрабатывающий при загрузке/ошибке загрузки/таймауте загрузки картинки
   * @callback LoadImageCallback
   * @param {boolean} error - true при ошибке и таймауте, false при успешной загрузке, см. функцию onImageLoad
   */

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

  return {
    requestJsonp: requestJsonp,
    loadImg: loadImg
  };
});


