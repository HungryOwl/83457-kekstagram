/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

//Подключили библиотеку куки
define(['browser-cookies', './resizer'], function(browserCookies, Resizer) {

  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма фильтрации изображения.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * Ищем элементы формы в форме с пом-ю свойства elements по атрибуту name элемента формы
   * @const
   * @type {HTMLInputElement}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
   */
  var resizeLeftSide = resizeForm['x'];

  var resizeTopSide = resizeForm['y'];

  var resizeSize = resizeForm['size'];

  var resizeSubmit = resizeForm['fwd'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * Кладем в константу коллекцию радиобаттонов формы
   * @const
   * @type {RadioNodeList}
   * @see https://developer.mozilla.org/en-US/docs/Web/API/RadioNodeList
   */
  var filterCollection = filterForm.elements['upload-filter'];

  /**
   * Куки, в котором храним тип фильтра
   * @const
   * type {string}
   */
  var COOKIE_FILTER_NAME = 'upload-filter';

  /**
   * Вычисляем количество дней, прошедших со дня моего рождения до текущей даты
   * @return {number}
   */
  function getDateToExpire() {
    /**
     * Сегодняшняя дата
     * @type {Date}
     */
    var today = new Date();

    /**
     * Вычисляем текущий год
     * @type {number}
     */
    var currentYear = today.getFullYear();

    /**
     * Устанавливаем текущий год дня рождения Грейс Хоппер
     * @type {Date}
     */
    var birthday = new Date(currentYear, 11, 9);

    /**
     * Число милисекунд в дне
     * @const
     * @type {number}
     */
    var MS_IN_DAY = 1000 * 60 * 60 * 24;

    if (today < birthday) {
      birthday.setFullYear(currentYear - 1);
    }

    return Math.floor((today - birthday) / MS_IN_DAY);
  }

  function isInputWidthCorrect(coordinateX, cropSide) {
    return coordinateX + cropSide <= currentResizer._image.naturalWidth;
  }

  function isInputHeightCorrect(coordinateY, cropSide) {
    return coordinateY + cropSide <= currentResizer._image.naturalHeight;
  }

  function isInputCoordinatesCorrect(coordinateX, coordinateY) {
    return coordinateX >= 0 && coordinateY >= 0;
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var offsetX = parseInt(resizeLeftSide.value.trim(), 10);
    var offsetY = parseInt(resizeTopSide.value.trim(), 10);
    var side = parseInt(resizeSize.value.trim(), 10);

    var isFormCorrect, isWidthCorrect, isHeightCorrect, isCoordinatesCorrect;

    isWidthCorrect = isInputWidthCorrect(offsetX, side);
    isHeightCorrect = isInputHeightCorrect(offsetY, side);
    isCoordinatesCorrect = isInputCoordinatesCorrect(offsetX, offsetY);

    isFormCorrect = isWidthCorrect && isHeightCorrect && isCoordinatesCorrect;

    resizeSubmit.disabled = !isFormCorrect;

    return isFormCorrect;
  }

  /**
   * Записываем Куку
   */
  function setCookie() {
    var cookieOptExpires = {expires: getDateToExpire()};

    Array.prototype.forEach.call(filterCollection, function(filter) {
      if (filter.checked) {
        browserCookies.set(COOKIE_FILTER_NAME, filter.value, cookieOptExpires);
      }
    });
  }

  /**
   * Читаем фильтр из Куки
   */
  function setFilterFromCookie() {
    Array.prototype.forEach.call(filterCollection, function(filter) {
      filter.checked = Boolean(filter.value === browserCookies.get(COOKIE_FILTER_NAME)) || filter.checked;
    });
  }

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если формат загружаемого файла не поддерживается
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      var image = currentResizer.exportImage().src;

      var thumbnails = filterForm.querySelectorAll('.upload-filter-preview');
      for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].style.backgroundImage = 'url(' + image + ')';
      }

      filterImage.src = image;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia',
        'marvin': 'filter-marvin'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  resizeLeftSide.min = 0;
  resizeTopSide.min = 0;
  resizeSize.min = 0;
  resizeLeftSide.value = 0;
  resizeTopSide.value = 0;
  resizeSize.value = 0;

  resizeLeftSide.addEventListener('input', resizeFormIsValid);
  resizeTopSide.addEventListener('input', resizeFormIsValid);
  resizeSize.addEventListener('input', resizeFormIsValid);

  cleanupResizer();
  updateBackground();
  setFilterFromCookie();

  filterForm.addEventListener('submit', setCookie);

  function setFormValues() {
    var resizerConstraint = currentResizer.getConstraint();

    resizeLeftSide.value = Math.round(resizerConstraint.x);
    resizeTopSide.value = Math.round(resizerConstraint.y);
    resizeSize.value = Math.round(resizerConstraint.side);
  }

  function setResizerSize() {
    var leftSide = parseInt(resizeLeftSide.value, 10);
    var topSide = parseInt(resizeTopSide.value, 10);
    var resizeSide = parseInt(resizeSize.value, 10);

    currentResizer.setConstraint(leftSide, topSide, resizeSide);
  }

  resizeForm.addEventListener('change', setResizerSize);
  window.addEventListener('resizerchange', setFormValues);
});
