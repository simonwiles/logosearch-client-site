/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE9, IE10 and IE11 requires all of the following polyfills. **/
// import 'core-js/es6/symbol';
// import 'core-js/es6/object';
// import 'core-js/es6/function';
// import 'core-js/es6/parse-int';
// import 'core-js/es6/parse-float';
// import 'core-js/es6/number';
// import 'core-js/es6/math';
// import 'core-js/es6/string';
// import 'core-js/es6/date';
// import 'core-js/es6/array';
// import 'core-js/es6/regexp';
// import 'core-js/es6/map';
// import 'core-js/es6/weak-map';
// import 'core-js/es6/set';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/** Evergreen browsers require these. **/
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';


/**
 * Required to support Web Animations `@angular/animation`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.



/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */

/**
 * Date, currency, decimal and percent pipes.
 * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
 */
// import 'intl';  // Run `npm install --save intl`.
/**
 * Need to import at least one locale-data with intl.
 */
// import 'intl/locale-data/jsonp/en';




/***************************************************************************************************
 * LOCAL
 */

Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
  const value = this.getItem(key);
  return value && JSON.parse(value);
};

String.prototype.toCamelCase = function() {
  return this.replace(/-[a-z]/g, function(match) { return match.toUpperCase(); });
};

String.prototype.toKebabCase = function() {
  return this.replace(/[A-Z]/g, function(match) { return '-' + match.toLowerCase(); });
};

Number.prototype.siUnits = function() {
  // Handle some special cases
  if (this === 0) { return '0 Bytes'; }
  if (this === 1) { return '1 Byte'; }
  if (this === -1) { return '-1 Byte'; }

  const bytes = Math.abs(this);
  const orderOfMagnitude = Math.pow(10, 3);
  const abbreviations = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));
  let result = (bytes / Math.pow(orderOfMagnitude, i));

  // This will get the sign right
  if (this < 0) { result *= -1; }

  // This bit here is purely for show. it drops the percision on numbers greater than 100 before the units.
  // it also always shows the full number of bytes if bytes is the unit.
  if (result >= 99.995 || i === 0) {
      return result.toFixed(0) + ' ' + abbreviations[i];
  } else {
      return result.toFixed(2) + ' ' + abbreviations[i];
  }
};

Number.prototype.iecUnits = function() {
  // Handle some special cases
  if (this === 0) { return '0 Bytes'; }
  if (this === 1) { return '1 Byte'; }
  if (this === -1) { return '-1 Byte'; }

  const bytes = Math.abs(this);
  const orderOfMagnitude = Math.pow(2, 10);
  const abbreviations = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));
  let result = (bytes / Math.pow(orderOfMagnitude, i));

  // This will get the sign right
  if (this < 0) { result *= -1; }

  // This bit here is purely for show. it drops the percision on numbers greater than 100 before the units.
  // it also always shows the full number of bytes if bytes is the unit.
  if (result >= 99.995 || i === 0) {
      return result.toFixed(0) + ' ' + abbreviations[i];
  } else {
      return result.toFixed(2) + ' ' + abbreviations[i];
  }
};
