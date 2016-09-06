'use strict';

define('getPictureElement', ['./load', './utils', './gallery'], function(load, utils, Gallery) {

  var htmlElementToClone = utils.getTemplateClone('#picture-template', '.picture');

  /**
   * Грузим картинку в склонированный шаблон
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

    load.loadImg(data.url, onImageLoad);

    return element;
  }

  /**
   * Генерируем DOM-элемент с данными
   * @param  {Object} data Данные, которыми заполняем шаблон
   * @return {HTMLElement} DOM-элемент, заполненный данными
   */
  function getPictureElement(data, pageNumber) {
    var element = htmlElementToClone.cloneNode(true);

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    getPictureImg(data, element);

    element.addEventListener('click', function(evt) {
      evt.preventDefault();
      Gallery.show(pageNumber);
    });

    return element;
  }

  return getPictureElement;
});
