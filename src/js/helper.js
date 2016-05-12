/* jshint esversion: 6 */

/**
 * @method Number.prototype.getRandomInt
 * @descriptions creates a random number between two boundaries
 * @param min
 * @param max
 * @returns {*}
 */

Number.prototype.getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * @method Number.prototype.map
 * @descriptions maps a number from one range to another range
 * @param inMin
 * @param inMax
 * @param outMin
 * @param outMax
 * @returns {number}
 */

Number.prototype.map = function (inMin, inMax, outMin, outMax) {
    return (this - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

/**
 * @method String.prototype.isNumeric
 * @descriptions checks if string is a number or german number
 * @returns {boolean}
 */

String.prototype.isNumeric = function () {
    return !isNaN(parseFloat(this)) && isFinite(this) || this.isNumericGerman();
};

/**
 * @method String.prototype.isNumericGerman
 * @description checks if string is a german number, for example 0,9 or 9999,999
 * @returns {boolean}
 */

String.prototype.isNumericGerman = function () {
    const tmp = this.split(",");
    return tmp.length === 2 && tmp[0].isNumeric() && tmp[0].isNumeric();
};

/**
 * @method String.prototype.isDate
 * @description recognizes following date formats
 *   YYYY.MM.DD
 *   YYYY-MM-DD
 *   YYYY/MM/DD
 *   DD.MM.YYYY
 *   DD-MM-YYYY
 *   DD/MM/YYYY
 *   MM.DD.YYYY
 *   MM-DD-YYYY
 *   MM/DD/YYYY
 * @return {boolean}
 */

String.prototype.isDate = function () {
    let YYYYMMDD = /^\d{4}[\/\-.](0?[1-9]|1[012])[\/\-.](0?[1-9]|[12][0-9]|3[01])$/;
    let DDMMYYYY = /^(0?[1-9]|[12][0-9]|3[01])[\/\-.](0?[1-9]|1[012])[\/\-.]\d{4}$/;
    let MMDDYYYY = /^(0?[1-9]|1[012])[\/\-.](0?[1-9]|[12][0-9]|3[01])[\/\-.]\d{4}$/;
    return YYYYMMDD.test(this) || DDMMYYYY.test(this) || MMDDYYYY.test(this);
};
