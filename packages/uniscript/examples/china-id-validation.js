/* eslint-disable no-magic-numbers */

const mutliNum = (function generate() {
    const obj = {};
    for (let i = 0, len = 17; i < len; i++) {
        obj[i] = 2 ** (17 - i) % 11;
    }
    return obj;
})();

const xCodeMap = {
    0: '1',
    1: '0',
    2: 'X',
    3: '9',
    4: '8',
    5: '7',
    6: '6',
    7: '5',
    8: '4',
    9: '3',
    10: '2',
};

function getXCode(szID) {
    let sum = 0;
    for (let i = 0, len = szID.length - 1; i < len; i++) {
        sum += szID[i] * mutliNum[i];
    }
    let xCode = sum % 11;
    xCode = xCodeMap[xCode];
    return xCode === 10 ? 'X' : `${xCode}`;
}

function validIDNum(szID) {
    if (szID.length !== 18) {
        return false;
    }

    const xCode = getXCode(szID);
    if (xCode === szID[17]) {
        return true;
    }

    return false;
}

const redColor = 'rgb(240, 55, 31)';

const activeSheet = Univer.getCurrentSheet().getActiveSheet();
const range = activeSheet.getSelection().getActiveRange();
const row = range.getRow();
const col = range.getColumn();
const width = range.getWidth();
const height = range.getHeight();

for (let i = row; i < row + height; i++) {
    for (let j = col; j < col + width; j++) {
        const range = activeSheet.getRange(i, j);
        const ID = range.getValue();
        const valid = validIDNum(ID);
        if (!valid) {
            range.setBackgroundColor(redColor);
        }
    }
}
