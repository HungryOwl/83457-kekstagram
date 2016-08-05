'use strict';

function getMessage(a, b) {
  var typeofa = typeof a;
  var typeofb = typeof b;
  var sumOfRedPoints, arrlength, artifactsSquare, i;

  if (typeofa === 'boolean') {
    if (a) {
      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
    } else {
      return 'Переданное GIF-изображение не анимировано';
    }
  }

  if (typeofa === 'number') {
    return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' атрибутов';
  }

  if (typeofa === 'object' && typeofb != 'object') {
    sumOfRedPoints = a.reduce(function(currentSum, currentRedPoint) {
      return currentSum + currentRedPoint;
    });

    return 'Количество красных точек во всех строчках изображения: ' + sumOfRedPoints;

  } else if (typeofa === 'object' && typeofb === 'object') {
    artifactsSquare = 0;

    arrlength = Math.max(a.length, b.length);

    for (i = 0; i < arrlength; i++) {
      artifactsSquare += (a[i] * b[i]);
    }

    return 'Общая площадь артефактов сжатия: ' + artifactsSquare + ' пикселей';
  }
};
