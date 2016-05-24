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

/**
 * @method Array.prototype.getNominalBoundaries
 * @descriptions Calculates the amount of unique nominal values in an array and returns the unique-counter-dictionary, as well as the pure values
 * @param selection {Object}
 * @param both {Boolean} Tells the function to use both axis i.o. to save calculation time because only one loop is needed
 * @param type {String} this parameter is only used if both = false and it tells the function which axis to use(x or y);
 * @returns {Object}
 */
Array.prototype.getNominalBoundaries = function (selection, both, type = undefined) {

    let unique, result;

    let getUniqueElements = function (selection, both) {
        let dict = {};

        if(both){

            dict.x = {};
            dict.y = {};

            for (let i = 0; i < this.length; i++) {
                dict.x[this[i][selection.x]] = ++dict.x[this[i][selection.x]] || 1;
                dict.y[this[i][selection.y]] = ++dict.y[this[i][selection.y]] || 1;
            }

        } else{

            for (let i = 0; i < this.length; i++) {
                dict[this[i][selection]] = ++dict[this[i][selection]] || 1;
            }

        }

        return dict;
    };

    if(both){
        unique = getUniqueElements.call(this, selection, true);
        result = {
            minX: 0,
            maxX: Object.keys(unique.x).length,
            minY: 0,
            maxY: Object.keys(unique.y).length,
            uniqueX: unique.x,
            uniqueY: unique.y
        };
    }
    else{

        unique = getUniqueElements.call(this, selection, false);
        if(type === "x"){
            result = {
                minX: 0,
                maxX: Object.keys(unique).length,
                uniqueX: unique
            };
        } else{
            result = {
                minY: 0,
                maxY: Object.keys(unique).length,
                uniqueY: unique
            };
        }

    }
    return result;
};


/**
 * @method Array.prototype.getNumericalBoundaries
 * @descriptions Calculates min and max values of axis
 * @param features {Object}
 * @param both {Boolean} Tells the function to use both axis i.o. to save calculation time because only one loop is needed
 * @param type {String} this parameter is only used if both = false and it tells the function which axis to use(x or y);
 * @returns {Object}
 */
Array.prototype.getNumericalBoundaries = function (features, both, type = undefined) {
    let result;
    if(both){

        let maxValueX = 0, minValueX = 0;
        let maxValueY = 0, minValueY = 0;

        for (let i = 0; i < this.length; i++) {
            let x = parseFloat(this[i][features.x]);
            let y = parseFloat(this[i][features.y]);

            if (x > maxValueX) {
                maxValueX = x;
            } else if (x < minValueX) {
                minValueX = x;
            }

            if (y > maxValueY) {
                maxValueY = y;
            } else if (y < minValueY) {
                minValueY = y;
            }
        }

        result = {
            minX: minValueX,
            maxX: maxValueX,
            minY: minValueY,
            maxY: maxValueY
        };

    } else{

        let maxValue = 0, minValue = 0, i, current;

        if(type === "x"){

            for (i = 0; i < this.length; i++) {
                current = parseFloat(this[i][features.x]);
                if (current > maxValue) {
                    maxValue = current;
                } else if (current < minValue) {
                    minValue = current;
                }
            }

            result = {
                minX: minValue,
                maxX: maxValue
            };

        } else{

            for (i = 0; i < this.length; i++) {
                current = parseFloat(this[i][features.y]);
                if (current > maxValue) {
                    maxValue = current;
                } else if (current < minValue) {
                    minValue = current;
                }
            }

            result = {
                minY: minValue,
                maxY: maxValue
            };

        }
    }

    return result;

};
