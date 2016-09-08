'use strict';

define('getPictureElement', ['./load', './utils', './gallery'], function(load, utils) {

  var htmlElementToClone = utils.getTemplateClone('#picture-template', '.picture');

  /**
   * Грузим картинку в склонированный шаблон
   * @param  {Object} data
   * @param  {HTMLElement} pictureNode DOM-элемент, заполненный данными
   * @return {HTMLElement} pictureNode DOM-элемент, заполненный данными и атрибутом src у тега img
   */
  function getPictureImg(data, pictureNode) {
    var pictureImg = pictureNode.querySelector('img');
    var PICTURE_SIZE = 182;

    function onImageLoad(error) {
      if(error) {
        pictureNode.classList.add('picture-load-failure');
      } else {
        pictureImg.height = PICTURE_SIZE;
        pictureImg.width = PICTURE_SIZE;
        pictureImg.src = data.url;
      }
    }

    load.loadImg(data.url, onImageLoad);

    return pictureNode;
  }

  /**
   * Генерируем DOM-элемент с данными
   * @param  {Object} data Данные, которыми заполняем шаблон
   * @return {HTMLElement} DOM-элемент, заполненный данными
   */
  function getPictureElement(data) {
    var pictureElement = htmlElementToClone.cloneNode(true);

    pictureElement.querySelector('.picture-comments').textContent = data.comments;
    pictureElement.querySelector('.picture-likes').textContent = data.likes;

    getPictureImg(data, pictureElement);

    pictureElement.addEventListener('click', function(evt) {
      evt.preventDefault();
    });

    return pictureElement;
  }

  return getPictureElement;
});
