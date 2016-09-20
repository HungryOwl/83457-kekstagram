'use strict';

define('pictureConstructor', ['./template', './gallery'], function(getPictureElement, Gallery) {

  /**
   * Конструктор отдельной картинки
   * @param {object} data Данные, полученные по XMLHttpRequest
   * @param {number} pictureNumber Номер фото, с которого начнется показ галереи
   *                               - номер элемента в массиве данных, полученном через XMLHttpRequest
   */
  function Picture(data, pictureNumber) {
    this.data = data;
    this.element = getPictureElement(this.data);
    this.pictureNumber = pictureNumber;

    this.showGallery = this.showGallery.bind(this);
    this.changeUrl = this.changeUrl.bind(this);

    this.element.addEventListener('click', this.changeUrl);
  }

  Picture.prototype.changeUrl = function() {
    Gallery.changeUrl(this.data.url);
  };

  Picture.prototype.showGallery = function() {
    Gallery.show(this.pictureNumber);
  };

  Picture.prototype.remove = function() {
    this.element.removeEventListener('click', this.changeUrl);
  };

  return Picture;
});
