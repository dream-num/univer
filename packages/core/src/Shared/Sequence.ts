/**
 * column subscript letter to number
 * @param a letter
 * @returns
 */
export function ABCToNumber(a: string) {
    if (a == null || a.length === 0) {
        return NaN;
    }
    const str = a.toLowerCase().split('');
    const al = str.length;
    const getCharNumber = (charX: string) => charX.charCodeAt(0) - 96;
    let numOut = 0;
    let charnum = 0;
    for (let i = 0; i < al; i++) {
        charnum = getCharNumber(str[i]);
        numOut += charnum * 26 ** (al - i - 1);
    }
    if (numOut === 0) {
        return NaN;
    }
    return numOut - 1;
}

const orderA = 'A'.charCodeAt(0);
const orderZ = 'Z'.charCodeAt(0);
const order_a = 'a'.charCodeAt(0);
const order_z = 'z'.charCodeAt(0);

/**
 * column subscript number to letters
 * @param n number
 * @returns
 */
export function numberToABC(n: number) {
    const len = orderZ - orderA + 1;

    let s = '';

    while (n >= 0) {
        s = String.fromCharCode((n % len) + orderA) + s;

        n = Math.floor(n / len) - 1;
    }

    return s;
}

/**
 * Repeats the given string (first argument) num times (second argument). If num is not positive, an empty string is returned.
 * @param string given string
 * @param times repeat times
 * @returns
 */
export function repeatStringNumTimes(string: string, times: number) {
    let repeatedString = '';
    while (times > 0) {
        repeatedString += string;
        times--;
    }
    return repeatedString;
}

/**
 * Column subscript numbers are converted to list-style letters, for example, after 25, it means AA BB CC, not AA AB AC
 * @param n number
 * @param uppercase Is it a capital letter
 * @returns
 */
export function numberToListABC(n: number, uppercase = false) {
    const len = orderZ - orderA + 1;

    let order = order_a;
    if (uppercase) {
        order = orderA;
    }

    const abc = String.fromCharCode((n % len) + order);

    const times = Math.floor(n / len) + 1;

    return repeatStringNumTimes(abc, times);
}
