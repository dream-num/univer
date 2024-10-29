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

/**
 * Return the index of the first value in an ascending array that is greater than the target value. If there is no value greater than the target, return -1.
 *
 * Alternatively, you can consider inserting a number to ensure the array remains sorted, and return the position for insertion. If the target is the same as the maximum value, return -1.  (or arr.length -1)
 * @param arr
 * @param target
 */
export function orderSearchArray(arr: number[], target: number) {
    let left = 0;
    let right = arr.length - 1;

    if (target < arr[0]) return 0;
    if (target >= arr[arr.length - 1]) return arr.length - 1;

    while (left <= right) {
        // When an equal value is found, it is necessary to find the position immediately following the last occurrence of that equal value.
        if (arr[left] === target) {
            while (left < arr.length && arr[left] === target) {
                left++;
            }
            return left;
        }

        if (target > arr[left] && target < arr[left + 1]) {
            return left + 1;
        }

        if (arr[right] === target) {
            while (right < arr.length && arr[right] === target) {
                right++;
            }
            return right;
        }

        if (target > arr[right - 1] && target < arr[right]) {
            return right;
        }

        left++;
        right--;
    }

    return -1;
}

/**
 * Return the index of the first value in an ascending array that is greater than the target value. If there is no value greater than the target, return -1.
 *
 *
 * binarySearchArray([0,1,2,3,4, 4, 4,5, 5, 5], 1)  return 2
 * binarySearchArray([0,1,2,3,4, 4, 4, 5, 5, 5], 5)  return -1,  because max value 5 is not greater than target 5
 * binarySearchArray([0,1,2,3,4, 4, 4, 5, 5, 5], 8)  return -1,  because max value 5 is not greater than target 8
 * @param arr
 * @param pos
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

/**
 * Return the index of the first value in an ascending array that is greater than the target value. If there is no value greater than the target, return -1.
 *
 * Alternatively, you can consider inserting a number to ensure the array remains sorted, and return the position for insertion. If the target is the same as the maximum value, return -1.
 *
 * binarySearchArray([0,1,2,3,4, 4, 4,5, 5, 5], 1)  return 2
 * binarySearchArray([0,1,2,3,4, 4, 4, 5, 5, 5], 5)  return -1,  because max value 5 is not greater than target 5
 * binarySearchArray([0,1,2,3,4, 4, 4, 5, 5, 5], 8)  return -1,  because max value 5 is not greater than target 8
 * @param arr
 * @param target
 */
export function binSearchFirstGreaterThanTarget(arr: number[], target: number) {
    let left = 0;
    let right = arr.length;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);

        // If the middle value is less than or equal to the target value, continue searching in the right half.
        if (arr[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    // Returns the index of the first element greater than the target value;
    // returns last index if no value in array is greater than target.
    return left < arr.length ? left : arr.length - 1;
}

/**
 * Return the index of the first value in an ascending array that is greater than the target value.
 * If target is greater than biggest value, return arr.length -1(last biggest value index).
 * If target is equal to biggest value, return arr.length -1(last biggest value index);
 *
 * searchArray([0, 1, 2, 3, 4, 4, 4, 5, 5, 5], 1) return 2
 * searchArray([0, 1, 2, 3, 4, 4, 4, 5, 5, 5], 1) return 7 (first 5 index)
 * searchArray([0, 1, 2, 3, 4, 4, 4, 5, 5, 5], 5) return 9
 * searchArray([0, 1, 2, 3, 4, 4, 4, 5, 5, 5], 8) return 9
 *
 * @param arr
 * @param target
 * @returns {number} index
 */
export function searchArray(arr: number[], target: number, firstMatch = false) {
    let index: number = arr.length - 1;
    if (target < 0 || target < arr[0]) {
        return 0;
    }

    // Excluding the special conditions mentioned above, the next return values can only be between 1 and length - 1.
    if (arr.length < 40 || target <= arr[20] || target >= arr[index - 20]) {
        index = orderSearchArray(arr, target);
    } else {
        index = binSearchFirstGreaterThanTarget(arr, target);
    }

    if (firstMatch) {
        const val = arr[index];
        return arr.indexOf(val);
    }

    return index;
}
