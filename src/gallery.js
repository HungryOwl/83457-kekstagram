'use strict';

define('galleryConstructor', ['./utils'], function(utils) {

  function Gallery() {
    this.pictures = [];
    this.activePicture = 0;
    this.overlay = document.querySelector('.gallery-overlay');
    this.closeButton = this.overlay.querySelector('.gallery-overlay-close');
    this.imgContainer = this.overlay.querySelector('.gallery-overlay-image');
    this.likes = this.overlay.querySelector('.likes-count');
    this.comments = this.overlay.querySelector('.comments-count');

    this.hide = this.hide.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);

    this.keyRightCheck = this.keyRightCheck.bind(this);
    this.keyLeftCheck = this.keyLeftCheck.bind(this);
    this.keyEscCheck = this.keyEscCheck.bind(this);
  }

  /**
   * Записываем в свойство pictures исходный массив с объектами данных по фотографиям
   * @param {Array<Object>} pictures массив с объектами данных по фотографиям
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };

  /**
   * Показываем следующее фото
   */
  Gallery.prototype.next = function() {
    if(++this.activePicture > this.pictures.length - 1) {
      this.activePicture = 0;
    }

    this.setActivePicture(this.activePicture);
  };

  /**
   * Показываем предыдущее фото
   */
  Gallery.prototype.prev = function() {
    if(--this.activePicture < 0) {
      this.activePicture = this.pictures.length - 1;
    }

    this.setActivePicture(this.activePicture);
  };

  /**
   * Скрываем галерею, убираем листенеры
   */
  Gallery.prototype.hide = function() {
    this.overlay.classList.add('invisible');
    this.closeButton.removeEventListener('click', this.hide);

    window.removeEventListener('keydown', this.keyRightCheck);
    window.removeEventListener('keydown', this.keyLeftCheck);
    window.removeEventListener('keydown', this.keyEscCheck);
  };

  /**
   * Проверяем нажатие клавиш вправо/влево/esc
   */
  Gallery.prototype.keyRightCheck = utils.listenKey(39, Gallery.prototype.next);
  Gallery.prototype.keyLeftCheck = utils.listenKey(37, Gallery.prototype.prev);
  Gallery.prototype.keyEscCheck = utils.listenKey(27, Gallery.prototype.hide);

  /**
   * Показываем галерею, вешаем листенеры
   * @param  {number} pageNumber Номер фото, с которого начинается показ
   */
  Gallery.prototype.show = function(pageNumber) {
    this.overlay.classList.remove('invisible');
    this.closeButton.addEventListener('click', this.hide);
    this.imgContainer.addEventListener('click', this.next);
    this.setActivePicture(pageNumber);

    window.addEventListener('keydown', this.keyRightCheck);
    window.addEventListener('keydown', this.keyLeftCheck);
    window.addEventListener('keydown', this.keyEscCheck);
  };

  /**
   * Показываем актуальную картинку в галерее
   * @param {number} pageNumber Номер фото, с которого начинается показ
   */
  Gallery.prototype.setActivePicture = function(pageNumber) {
    this.imgContainer.src = this.pictures[pageNumber].url;
    this.likes.textContent = this.pictures[pageNumber].likes;
    this.comments.textContent = this.pictures[pageNumber].comments;
    this.activePicture = pageNumber;
  };

  return new Gallery();
});
