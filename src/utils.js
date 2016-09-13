'use strict';

define('utils', function() {
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
   * Проверяем, какая клавиша нажата
   * @param  {number}   keyCode   код клавиши
   * @param  {Function} callback  вызывем коллбэк по нажатию
   * @return {function}           проверяем, та ли нажата клавиша
   */
  function listenKey(keyCode, callback) {
    return function(evt) {
      if (evt.keyCode === keyCode) {
        callback.call(this);
      }
    };
  }

  /**
   * Троттлим что-то
   * @param  {callback} callback    функция, которая будет троттлиться
   * @param  {number}   time        время троттлинга
   */
  function throttle(callback, time) {
    /**
     * controlDate контрольная дата, с которой начинается троттлинг
     * @type {Date}
     */
    var controlDate = new Date();

    return function() {
      var currentDate = new Date();

      if (currentDate.valueOf() - controlDate.valueOf() >= time) {
        callback();
        controlDate = new Date();
      }
    };
  }

  return {
    getTemplateClone: getTemplateClone,
    listenKey: listenKey,
    throttle: throttle
  };
});
