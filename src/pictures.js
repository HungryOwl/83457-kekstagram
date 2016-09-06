'use strict';

define('pictures', ['./load', './utils', './picture', './gallery'], function(load, utils, getPictureElement, Gallery) {

  var PICTURES_LOAD = 'http://localhost:1506/api/pictures';

  var pictureData = [];

  var pictureContainer = document.querySelector('.pictures');

  var filterForm = document.querySelector('.filters');

  /**
   * Отрисовываем картинки, пробегаясь по массиву с данными
   */
  function renderImages() {
    var pictureCollection = document.createDocumentFragment();

    pictureData.forEach(function(data, elementNumber) {
      pictureCollection.appendChild(getPictureElement(data, elementNumber));
    });

    pictureContainer.appendChild(pictureCollection);
  }

  /*
   * Прячем фильтры перед отрисовкой
   */
  filterForm.classList.add('hidden');

  load.requestJsonp(PICTURES_LOAD, function(picturesData) {
    pictureData = picturesData;

    renderImages();
    Gallery.setPictures(pictureData);

    filterForm.classList.remove('hidden');
  });
});



