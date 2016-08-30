'use strict';

(function() {
  var amountOfRequests = 0;
  var PICTURES_LOAD = 'http://localhost:1506/api/pictures';

  /**
   * Получаем данные с сервера по JSONP
   * @param  {String}   url      Адрес, по которому получаем данные
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

  requestJsonp(PICTURES_LOAD, function(pictures) {
    console.log(pictures);
  });
})();

