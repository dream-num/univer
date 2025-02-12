/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    return xCode === szID[17];
}

const redColor = 'rgb(240, 55, 31)';

// eslint-disable-next-line no-undef
const activeSheet = univerAPI.getActiveWorkbook().getActiveSheet();
const range = activeSheet.getRange(1, 1, 50, 1);
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
