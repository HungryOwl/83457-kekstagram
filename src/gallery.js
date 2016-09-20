'use strict';

define('galleryConstructor', ['./utils'], function(utils) {

  /**
   * Конструктор галереи
   */
  function Gallery() {
    this.pictures = null;
    this.activePicture = 0;
    this.overlay = document.querySelector('.gallery-overlay');
    this.closeButton = this.overlay.querySelector('.gallery-overlay-close');
    this.imgContainer = this.overlay.querySelector('.gallery-overlay-image');
    this.likes = this.overlay.querySelector('.likes-count');
    this.comments = this.overlay.querySelector('.comments-count');

    this.bindListeners();

    window.addEventListener('hashchange', this.onHashChange);
  }

  /**
   * Сохраняем контекст
   */
  Gallery.prototype.bindListeners = function() {
    this.hide = this.hide.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);

    this.keyRightCheck = this.keyRightCheck.bind(this);
    this.keyLeftCheck = this.keyLeftCheck.bind(this);
    this.keyEscCheck = this.keyEscCheck.bind(this);

    this.changeUrl = this.changeUrl.bind(this);
    this.onHashChange = this.onHashChange.bind(this);

    return this;
  };

  /**
   * Записываем в свойство pictures исходный массив с объектами данных по фотографиям
   * @param {Array<Object>} pictureData массив с объектами данных по фотографиям
   */
  Gallery.prototype.setPictures = function(pictureData) {
    if(!this.pictures) {
      this.pictures = pictureData;
    } else {
      pictureData.forEach(function(picture) {
        this.pictures.push(picture);
      }, this);
    }
  };

  /**
   * Показываем следующее фото
   */
  Gallery.prototype.next = function() {
    var nextSrc;

    if(this.pictures[this.activePicture + 1]) {
      nextSrc = this.pictures[this.activePicture + 1].url;
    } else {
      nextSrc = this.pictures[0].url;
    }

    this.setActivePicture(this.activePicture);
    this.changeUrl(nextSrc);
  };

  /**
   * Показываем предыдущее фото
   */
  Gallery.prototype.prev = function() {
    var prevSrc;

    if(this.pictures[this.activePicture - 1]) {
      prevSrc = this.pictures[this.activePicture - 1].url;
    } else {
      prevSrc = this.pictures[this.pictures.length - 1].url;
    }

    this.setActivePicture(this.activePicture);
    this.changeUrl(prevSrc);
  };

  /**
   * Скрываем галерею, убираем листенеры
   */
  Gallery.prototype.hide = function() {
    window.location.hash = '';

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
   * @param {number} pageNumber Номер фото, с которого начинается показ
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

  Gallery.prototype.URL_MATCHER = /#photo\/(\S+)/;

  /**
   * Добавляем хэш в адресную строку
   * @param  [string] photoUrl часть нашего хэша
   */
  Gallery.prototype.changeUrl = function(photoUrl) {
    if(photoUrl) {
      window.location.hash = 'photo/' + photoUrl;
    } else {
      window.location.hash = '';
    }
  };

  /**
   * Вскрываем нашу галерею по изменению хэша
   */
  Gallery.prototype.onHashChange = function() {
    var hash = window.location.hash;
    var photoUrl;
    var urlMatchHash = this.URL_MATCHER.exec(hash);
    var pictureIndex;

    if(urlMatchHash) {
      photoUrl = urlMatchHash[1];

      if(this.pictures) {
        this.pictures.forEach(function(pictureObject, pictureNumber) {
          if(photoUrl === pictureObject.url) {
            pictureIndex = pictureNumber;
          }
        });
      }

      if(pictureIndex || pictureIndex === 0) {
        this.show(pictureIndex);
      }
    } else {
      this.hide();
    }

    return this;
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
