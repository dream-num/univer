// 列下标  字母转数字
export function ABCToNumber(a: string) {
    if (a == null || a.length === 0) {
        return NaN;
    }
    let str = a.toLowerCase().split('');
    let al = str.length;
    let getCharNumber = (charX: string) => charX.charCodeAt(0) - 96;
    let numOut = 0;
    let charnum = 0;
    for (let i = 0; i < al; i++) {
        charnum = getCharNumber(str[i]);
        numOut += charnum * 26 ** (al - i - 1);
    }
    // console.log(a, numOut-1);
    if (numOut === 0) {
        return NaN;
    }
    return numOut - 1;
}

const orderA = 'A'.charCodeAt(0);
const orderZ = 'Z'.charCodeAt(0);
const order_a = 'a'.charCodeAt(0);
const order_z = 'z'.charCodeAt(0);

// 列下标  数字转字母
export function numberToABC(n: number) {
    const len = orderZ - orderA + 1;

    let s = '';

    while (n >= 0) {
        s = String.fromCharCode((n % len) + orderA) + s;

        n = Math.floor(n / len) - 1;
    }

    return s;
}

// 重复给定的字符串（第一个参数）num次（第二个参数）。如果num不是正数，则返回一个空字符串。
export function repeatStringNumTimes(string: string, times: number) {
    let repeatedString = '';
    while (times > 0) {
        repeatedString += string;
        times--;
    }
    return repeatedString;
}

// 列下标  数字转列表样式的字母，例如25之后表示AA BB  CC，而不是AA AB AC
export function numberToListABC(n: number, uppercase = false) {
    const len = orderZ - orderA + 1;

    let order = order_a;
    if (uppercase) {
        order = orderA;
    }

    const abc = String.fromCharCode((n % len) + order);

    let times = Math.floor(n / len) + 1;

    return repeatStringNumTimes(abc, times);
}
