'use strict';

define('pictureConstructor', ['./template', './gallery'], function(getPictureElement, Gallery) {

  /**
   * Конструктор отдельной картинки
   * @param {object} data Данные, полученные по JSONP
   * @param {number} pictureNumber Номер фото, с которого начнется показ галереи
   *                               - номер элемента в массиве данных, полученном через JSONP
   * @constructor
   */
  function Picture(data, pictureNumber) {
    this.data = data;
    this.element = getPictureElement(this.data);

    this.showGallery = function(evt) {
      evt.preventDefault();
      Gallery.show(pictureNumber);
    };

    this.element.addEventListener('click', this.showGallery);
  }

  Picture.prototype.showGallery = function(pictureNumber) {
    Gallery.show(pictureNumber);
  };

  Picture.prototype.remove = function() {
    this.element.removeEventListener('click', this.showGallery);
  };

  return Picture;
});
