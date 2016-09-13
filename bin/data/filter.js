'use strict';

module.exports = function(list, filterID) {
  var lastPictureDate;

  switch(filterID) {
    case 'filter-popular':
      list.sort(function(a, b) {
        return b.likes - a.likes;
      });
      break;

    case 'filter-new':
      list.sort(function(a, b) {
        return b.created - a.created;
      });

      lastPictureDate = new Date(list[0].created);

      lastPictureDate.setDate(lastPictureDate.getDate() - 3);

      list = list.filter(function(picture) {
        return new Date(picture.created) >= lastPictureDate;
      });
      break;

    case 'filter-discussed':
      list.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;
  }

  return list;
};
