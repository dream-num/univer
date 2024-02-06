/**
 * Copyright 2023-present DreamNum Inc.
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

export function binarySearchArray(arr: number[], pos: number) {
    let low: number = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = Math.floor((high + low) / 2);

        if (pos < arr[mid] && (mid === 0 || pos >= arr[mid - 1])) {
            return mid;
        }
        if (pos >= arr[mid]) {
            low = mid + 1;
        } else if (pos < arr[mid]) {
            high = mid - 1;
        } else {
            return -1;
        }
    }

    return -1;
}

export function orderSearchArray(arr: number[], pos: number) {
    let i = 0;
    let cur = 0;
    let cur_pre = 0;
    let cur_index = -1;
    let i_ed = arr.length - 1;

    while (i < arr.length && i_ed >= 0 && i_ed >= i) {
        cur = arr[i_ed];

        if (i_ed === 0) {
            cur_pre = 0;
        } else {
            cur_pre = arr[i_ed - 1];
        }

        if (pos >= cur_pre && pos <= cur) {
            cur_index = i_ed;
            break;
        }

        cur = arr[i];

        if (i === 0) {
            cur_pre = 0;
        } else {
            cur_pre = arr[i - 1];
        }

        if (pos >= cur_pre && pos < cur) {
            cur_index = i;
            break;
        }

        i++;
        i_ed--;
    }

    return cur_index;
}

export function searchArray(arr: number[], num: number) {
    let index: number = arr.length - 1;
    if (num < 0) {
        return -1;
    }
    if (num < arr[0]) {
        return 0;
    }
    if (num > arr[arr.length - 1]) {
        return Number.POSITIVE_INFINITY;
    }

    if (arr.length < 40 || num <= arr[20] || num >= arr[index - 20]) {
        index = orderSearchArray(arr, num);
    } else {
        index = binarySearchArray(arr, num);
    }

    return index;
}
