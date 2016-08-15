'use strict';

(function() {
  /**
   * @constructor
   * @param {string} image
   */
  var Resizer = function(image) {
    // Изображение, с которым будет вестись работа.
    this._image = new Image();
    this._image.src = image;

    // Холст.
    this._container = document.createElement('canvas');
    this._ctx = this._container.getContext('2d');

    // Создаем холст только после загрузки изображения.
    this._image.onload = function() {
      // Размер холста равен размеру загруженного изображения. Это нужно
      // для удобства работы с координатами.
      this._container.width = this._image.naturalWidth;
      this._container.height = this._image.naturalHeight;

      /**
       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
       * стороны изображения.
       * @const
       * @type {number}
       */
      var INITIAL_SIDE_RATIO = 0.75;

      // Размер меньшей стороны изображения.
      var side = Math.min(
          this._container.width * INITIAL_SIDE_RATIO,
          this._container.height * INITIAL_SIDE_RATIO);

      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
      // от размера меньшей стороны.
      this._resizeConstraint = new Square(
          this._container.width / 2 - side / 2,
          this._container.height / 2 - side / 2,
          side);

      // Отрисовка изначального состояния канваса.
      this.setConstraint();
    }.bind(this);

    // Фиксирование контекста обработчиков.
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
  };

  Resizer.prototype = {
    /**
     * Родительский элемент канваса.
     * @type {Element}
     * @private
     */
    _element: null,

    /**
     * Положение курсора в момент перетаскивания. От положения курсора
     * рассчитывается смещение на которое нужно переместить изображение
     * за каждую итерацию перетаскивания.
     * @type {Coordinate}
     * @private
     */
    _cursorPosition: null,

    /**
     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
     * от верхнего левого угла исходного изображения.
     * @type {Square}
     * @private
     */
    _resizeConstraint: null,

    /*
     * Черный слой вокруг рамки
     * @param {number} cropSide
     * @param {number} frameThickness
     */
    _drawRectangle: function(cropSide, frameThickness) {
      var outerLeftX = -this._container.width / 2;
      var outerTopY = -this._container.height / 2;
      var outerRightX = this._container.width;
      var outerBottomY = this._container.height;

      var innerLeftX = -cropSide / 2;
      var innerTopY = -cropSide / 2;
      var innerRightX = cropSide / 2;
      var innerBottomY = cropSide / 2;

      this._ctx.lineWidth = 1;
      this._ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
      this._ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this._ctx.setLineDash([0, 0]);

      this._ctx.beginPath();
      this._ctx.moveTo(outerLeftX, outerTopY);
      this._ctx.lineTo(outerLeftX + outerRightX, outerTopY);
      this._ctx.lineTo(outerLeftX + outerRightX, outerTopY + outerBottomY);
      this._ctx.lineTo(outerLeftX, outerTopY + outerBottomY);
      this._ctx.lineTo(outerLeftX, outerTopY);

      this._ctx.moveTo(innerLeftX - frameThickness, innerTopY - frameThickness);
      this._ctx.lineTo(innerRightX + frameThickness, innerTopY - frameThickness);
      this._ctx.lineTo(innerRightX + frameThickness, innerBottomY + frameThickness);
      this._ctx.lineTo(innerLeftX - frameThickness, innerBottomY + frameThickness);
      this._ctx.lineTo(innerLeftX - frameThickness, innerTopY);

      this._ctx.closePath();
      this._ctx.stroke();
      this._ctx.fill('evenodd');
    },

    /*
     * Надпись размеров картинки над кадрированием
     * @param {number} fontSize
     * @param {number} frameThickness
     */
    _drawText: function(fontSize, frameThickness) {
      var OFFSET = fontSize / 2;
      var coordinateB = -this._resizeConstraint.side / 2 - OFFSET - frameThickness;
      var message = this._image.naturalWidth + ' x ' + this._image.naturalHeight;

      this._ctx.fillStyle = 'white';
      this._ctx.lineWidth = 1;
      this._ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
      this._ctx.font = fontSize + 'px Tahoma';
      this._ctx.textAlign = 'center';

      this._ctx.fillText(message, 0, coordinateB);
    },

    // Отрисовка кружочка для рамочки
    _drawCircle: function(xCoordinate, yCoordinate, radius, fillColor) {
      this._ctx.fillStyle = fillColor;
      this._ctx.beginPath();
      this._ctx.arc(xCoordinate, yCoordinate, radius, 0, 2 * Math.PI, false);
      this._ctx.fill();
    },

    // Отрисовка прямоугольника, обозначающего область изображения после
    // кадрирования. Координаты задаются от центра.
    /*
     * @param {number} cropSide
     * @param {number} frameThickness
     * @param {string} fillColor
     */
    _drawRectangleFrame: function(cropSide, frameThickness, fillColor) {
      this._ctx.fillStyle = fillColor;
      this._ctx.strokeRect(
          (-cropSide / 2) - frameThickness / 2,
          (-cropSide / 2) - frameThickness / 2,
          cropSide + frameThickness,
          cropSide + frameThickness);
    },

    /*
     * Рамочка точечками
     * @param {number} cropSide
     * @param {string} fillColor
     */
    _drawDottedFrame: function(cropSide, fillColor) {
      var i;
      var CIRCLE_RADIUS = 3;
      var circleDiameter = CIRCLE_RADIUS * 2;
      var intervalSize = 4;
      var circleAmount;
      var intervalAmount;
      var rightCornerX = cropSide / 2;
      var leftCornerX = -cropSide / 2;
      var bottomCornerY = cropSide / 2;
      var topCornerY = -cropSide / 2;
      var stepCoordinateX = leftCornerX - CIRCLE_RADIUS;
      var stepCoordinateY = topCornerY - CIRCLE_RADIUS;

      intervalAmount = Math.floor((cropSide + circleDiameter) / (circleDiameter + intervalSize));
      intervalSize = (cropSide - circleDiameter * (intervalAmount - 1)) / intervalAmount;
      circleAmount = intervalAmount + 1;

      for (i = 0; i < circleAmount; i++) {
        if (i === 0 || i === circleAmount - 1) {
          while (stepCoordinateX < rightCornerX + circleDiameter) {
            this._drawCircle(stepCoordinateX, stepCoordinateY, CIRCLE_RADIUS, fillColor);
            stepCoordinateX += circleDiameter + intervalSize;
          }
          stepCoordinateX = leftCornerX - CIRCLE_RADIUS;
          stepCoordinateY += circleDiameter + intervalSize;
        } else {
          while (stepCoordinateX < rightCornerX + circleDiameter) {
            this._drawCircle(stepCoordinateX, stepCoordinateY, CIRCLE_RADIUS, fillColor);
            stepCoordinateX += cropSide + circleDiameter;
          }
          stepCoordinateX = leftCornerX - CIRCLE_RADIUS;
          stepCoordinateY += circleDiameter + intervalSize;
        }
      }
      stepCoordinateX = -rightCornerX - CIRCLE_RADIUS;
      stepCoordinateY = -bottomCornerY - CIRCLE_RADIUS;
    },

    /*
     * Рамка зигзагом
     * @param {number} cropSide
     * @param {number} frameThickness
     * @param {string} fillColor
     */
    _drawZigZagFrame: function(cropSide, frameThickness, fillColor) {
      var i, j;

      // Переключатель стороны рамочки (верх/низ)
      var directionSwitch;

      var step = frameThickness * 2;
      var amountOfArms = Math.round(cropSide / step);
      var coordinateA, coordinateB;

      this._ctx.fillStyle = fillColor;
      this._ctx.setLineDash([0, 0]);
      this._ctx.beginPath();

      //Делаем количество шагов четным
      amountOfArms % 2 < 2 ? amountOfArms -= (amountOfArms % 2) : amountOfArms += 4 - (amountOfArms % 2);
      step = cropSide / amountOfArms;

      for (j = 0; j < 4; j++) {
        //Задаем начальные координаты рисования рамки - coordinate и начальное направление движения влево или вправо - directionSwitch для зигзага
        // j = 0, 1 - верхняя и нижняя сторона, j = 2, 3 - боковые стороны
        switch (j) {
          case 0:
            directionSwitch = 1;
            coordinateA = -cropSide / 2;
            coordinateB = -cropSide / 2 + step;
            break;
          case 1:
            directionSwitch = 0;
            coordinateA = -cropSide / 2;
            coordinateB = cropSide / 2 - step;
            break;
          case 2:
            directionSwitch = 0;
            coordinateA = -cropSide / 2;
            coordinateB = cropSide / 2 - step;
            break;
          case 3:
            directionSwitch = 1;
            coordinateA = -cropSide / 2;
            coordinateB = -cropSide / 2 + step;
            break;
        }

        //устанавливаем начальные координаты рисования рамки
        if (j < 2) {
          this._ctx.moveTo(coordinateA, coordinateB);
        } else {
          this._ctx.moveTo(coordinateB, coordinateA);
        }

        for (i = 0; i < amountOfArms; i++) {
          coordinateA += step;
          i % 2 === directionSwitch ? coordinateB += step : coordinateB -= step;

          if (j < 2) {
            this._ctx.lineTo(coordinateA, coordinateB);
          } else {
            this._ctx.lineTo(coordinateB, coordinateA);
          }
        }
      }

      this._ctx.stroke();
    },

    /*
     * Произвольный цвет
     */
    _getRandomColor: function() {
      var randomRedColor = (Math.random() * 254 + 1).toFixed(0);
      var randomGreenColor = (Math.random() * 254 + 1).toFixed(0);
      var randomBlueColor = (Math.random() * 254 + 1).toFixed(0);

      return 'rgba(' + randomRedColor + ', ' + randomGreenColor + ', ' + randomBlueColor + ', ' + '1)';
    },

    /**
     * Отрисовка канваса.
     */
    redraw: function() {
      var BOLD_LINE = 6;
      var FONT_SIZE = 18;
      var cropSide = this._resizeConstraint.side;
      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
      var fillColor = this._getRandomColor();

      // Очистка изображения.
      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

      // Параметры линии.
      // NB! Такие параметры сохраняются на время всего процесса отрисовки
      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
      // чего-либо с другой обводкой.

      // Толщина линии.
      this._ctx.lineWidth = BOLD_LINE;
      // Цвет обводки.
      this._ctx.strokeStyle = this._getRandomColor();
      // Размер штрихов. Первый элемент массива задает длину штриха, второй
      // расстояние между соседними штрихами.
      this._ctx.setLineDash([15, 10]);
      // Смещение первого штриха от начала линии.
      this._ctx.lineDashOffset = 7;

      // Сохранение состояния канваса.
      this._ctx.save();

      // Установка начальной точки системы координат в центр холста.
      this._ctx.translate(this._container.width / 2, this._container.height / 2);

      // Отрисовка изображения на холсте. Параметры задают изображение, которое
      // нужно отрисовать и координаты его верхнего левого угла.
      // Координаты задаются от центра холста.
      this._ctx.drawImage(this._image, displX, displY);

      // Рамочки
      //this._drawRectangleFrame(cropSide, BOLD_LINE, fillColor);
      //this._drawDottedFrame(cropSide, fillColor);
      this._drawZigZagFrame(cropSide, BOLD_LINE, fillColor);

      // Рисуем наш темный фон
      this._drawRectangle(cropSide, BOLD_LINE);

      //Текст с размерами изображения
      this._drawText(FONT_SIZE, BOLD_LINE);

      // Восстановление состояния канваса, которое было до вызова ctx.save
      // и последующего изменения системы координат. Нужно для того, чтобы
      // следующий кадр рисовался с привычной системой координат, где точка
      // 0 0 находится в левом верхнем углу холста, в противном случае
      // некорректно сработает даже очистка холста или нужно будет использовать
      // сложные рассчеты для координат прямоугольника, который нужно очистить.
      this._ctx.restore();
    },

    /**
     * Включение режима перемещения. Запоминается текущее положение курсора,
     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
     * позволяющие перерисовывать изображение по мере перетаскивания.
     * @param {number} x
     * @param {number} y
     * @private
     */
    _enterDragMode: function(x, y) {
      this._cursorPosition = new Coordinate(x, y);
      document.body.addEventListener('mousemove', this._onDrag);
      document.body.addEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Выключение режима перемещения.
     * @private
     */
    _exitDragMode: function() {
      this._cursorPosition = null;
      document.body.removeEventListener('mousemove', this._onDrag);
      document.body.removeEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Перемещение изображения относительно кадра.
     * @param {number} x
     * @param {number} y
     * @private
     */
    updatePosition: function(x, y) {
      this.moveConstraint(
          this._cursorPosition.x - x,
          this._cursorPosition.y - y);
      this._cursorPosition = new Coordinate(x, y);
    },

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _onDragStart: function(evt) {
      this._enterDragMode(evt.clientX, evt.clientY);
    },

    /**
     * Обработчик окончания перетаскивания.
     * @private
     */
    _onDragEnd: function() {
      this._exitDragMode();
    },

    /**
     * Обработчик события перетаскивания.
     * @param {MouseEvent} evt
     * @private
     */
    _onDrag: function(evt) {
      this.updatePosition(evt.clientX, evt.clientY);
    },

    /**
     * Добавление элемента в DOM.
     * @param {Element} element
     */
    setElement: function(element) {
      if (this._element === element) {
        return;
      }

      this._element = element;
      this._element.insertBefore(this._container, this._element.firstChild);
      // Обработчики начала и конца перетаскивания.
      this._container.addEventListener('mousedown', this._onDragStart);
    },

    /**
     * Возвращает кадрирование элемента.
     * @return {Square}
     */
    getConstraint: function() {
      return this._resizeConstraint;
    },

    /**
     * Смещает кадрирование на значение указанное в параметрах.
     * @param {number} deltaX
     * @param {number} deltaY
     * @param {number} deltaSide
     */
    moveConstraint: function(deltaX, deltaY, deltaSide) {
      this.setConstraint(
          this._resizeConstraint.x + (deltaX || 0),
          this._resizeConstraint.y + (deltaY || 0),
          this._resizeConstraint.side + (deltaSide || 0));
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} side
     */
    setConstraint: function(x, y, side) {
      if (typeof x !== 'undefined') {
        this._resizeConstraint.x = x;
      }

      if (typeof y !== 'undefined') {
        this._resizeConstraint.y = y;
      }

      if (typeof side !== 'undefined') {
        this._resizeConstraint.side = side;
      }

      requestAnimationFrame(function() {
        this.redraw();
        window.dispatchEvent(new CustomEvent('resizerchange'));
      }.bind(this));
    },

    /**
     * Удаление. Убирает контейнер из родительского элемента, убирает
     * все обработчики событий и убирает ссылки.
     */
    remove: function() {
      this._element.removeChild(this._container);

      this._container.removeEventListener('mousedown', this._onDragStart);
      this._container = null;
    },

    /**
     * Экспорт обрезанного изображения как HTMLImageElement и исходником
     * картинки в src в формате dataURL.
     * @return {Image}
     */
    exportImage: function() {
      // Создаем Image, с размерами, указанными при кадрировании.
      var imageToExport = new Image();

      // Создается новый canvas, по размерам совпадающий с кадрированным
      // изображением, в него добавляется изображение взятое из канваса
      // с измененными координатами и сохраняется в dataURL, с помощью метода
      // toDataURL. Полученный исходный код, записывается в src у ранее
      // созданного изображения.
      var temporaryCanvas = document.createElement('canvas');
      var temporaryCtx = temporaryCanvas.getContext('2d');
      temporaryCanvas.width = this._resizeConstraint.side;
      temporaryCanvas.height = this._resizeConstraint.side;
      temporaryCtx.drawImage(this._image,
          -this._resizeConstraint.x,
          -this._resizeConstraint.y);
      imageToExport.src = temporaryCanvas.toDataURL('image/png');

      return imageToExport;
    }
  };

  /**
   * Вспомогательный тип, описывающий квадрат.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @param {number} side
   * @private
   */
  var Square = function(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
  };

  /**
   * Вспомогательный тип, описывающий координату.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @private
   */
  var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
  };

  window.Resizer = Resizer;
})();
