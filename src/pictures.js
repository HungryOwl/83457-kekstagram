'use strict';

define('pictures', ['./load', './utils', './template'], function(load, utils, getPictureElement) {

  var PICTURES_LOAD = 'http://localhost:1506/api/pictures';

  var pictures = [];

  var pictureContainer = document.querySelector('.pictures');

  var filterForm = document.querySelector('.filters');

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

  /*
   * Прячем фильтры перед отрисовкой
   */
  filterForm.classList.add('hidden');

  load.requestJsonp(PICTURES_LOAD, function(picturesData) {
    pictures = picturesData;

    renderImages();
    filterForm.classList.remove('hidden');
  });
});



