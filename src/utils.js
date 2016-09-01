'use strict';

define('utils', function() {
  /**
   * Ищет шаблон и клонирует
   * @param  {string} template      селектор самого шаблона
   * @param  {string} innerSelector имя конкретного шаблона
   * @return {HTMLElement}          склонированный элемент
   */
  function getTemplateClone(template, innerSelector) {
    var templateElement = document.querySelector(template);
    var elementToClone;

    if ('content' in templateElement) {
      elementToClone = templateElement.content.querySelector(innerSelector);
    } else {
      elementToClone = templateElement.querySelector(innerSelector);
    }

    return elementToClone;
  }

  return {
    getTemplateClone: getTemplateClone
  };
});
