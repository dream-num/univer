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

const isBigEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x12;

const swap = (b: Uint8Array, n: number, m: number) => {
    const i = b[n];
    b[n] = b[m];
    b[m] = i;
};

const swap32 = (array: Uint8Array) => {
    const len = array.length;
    for (let i = 0; i < len; i += 4) {
        swap(array, i, i + 3);
        swap(array, i + 1, i + 2);
    }
};

export const swap32LE = (array: Uint8Array) => {
    if (isBigEndian) {
        swap32(array);
    }
};
