//
// humgat/module1-task2.js
//

var humgat = require('./utils/humgat.js').create();

require('./utils/humgat-common.js')(humgat);

/*
Если первый аргумент, a, имеет тип boolean, то:
    Если он true, вернуть строку, в которую подставлен параметр b:
        "Переданное GIF-изображение анимировано и содержит [b] кадров"
    Если он false, то вернуть строку:
        "Переданное GIF-изображение не анимировано"

Если первый аргумент имеет числовой тип, то вернуть строку:
    "Переданное SVG-изображение содержит [a] объектов и [b * 4] атрибутов"

Если первый аргумент массив, то вернуть строку:
    "Количество красных точек во всех строчках изображения: [sum]"
    где [sum] — это сумма значений переданного массива

Если оба аргумента массивы, то вернуть строку:
    "Общая площадь артефактов сжатия: [square] пикселей"
    где [square] — это сумма произведений соответствующих элементов массивов a и b,
    cумма произведения первого элемента a с первым элементом b, второго со вторым и так далее
*/

humgat.on('page.open.success', function() {
  this.dom.assertEqual(
    'function',
    function() { return typeof(getMessage); },
    'Функция должна быть определена'
  ).catch(function() {
    this.emit('suite.failed');
  });

  this.dom.assertEqual(
    'Переданное GIF-изображение анимировано и содержит 38 кадров',
    function() { return getMessage(true, '38'); },
    'a === true'
  );

  this.dom.assertEqual(
    'Переданное GIF-изображение не анимировано',
    function() { return getMessage(false); },
    'a === false'
  );

  this.dom.assertEqual(
    'Переданное SVG-изображение содержит 20 объектов и 60 атрибутов',
    function() { return getMessage(20, 15); },
    'a - число'
  );

  this.dom.assertEqual(
    'Количество красных точек во всех строчках изображения: 10',
    function() { return getMessage([1, 2, 3, 4]); },
    'a - массив'
  );

  this.dom.assertEqual(
    'Общая площадь артефактов сжатия: 20 пикселей',
    function() { return getMessage([1, 2, 3, 4], [2, 2, 2, 2]); },
    'a и b - массивы'
  );

  this.emit('suite.done');
}).run();
