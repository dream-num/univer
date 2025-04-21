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

import type { ICalculatedOptions, ITableNumberFilterInfo } from '../../types/type';
import { TableNumberCompareTypeEnum } from '../../types/enum';
import { getLargestK, getSmallestK } from './top-n';

/**
 * @description Checks if a value is above the average.
 * @param {number} value - The value to check.
 * @param {number} average - The average value.
 * @returns {boolean} A boolean value indicating whether the value is above the average.
 */
export const above = (value: number, average: number): boolean => {
    return value > average;
};

/**
 * @description Checks if a value is below the average.
 * @param {number} value - The value to check.
 * @param {number} average - The average value.
 * @returns {boolean} A boolean value indicating whether the value is below the average.
 */
export const below = (value: number, average: number): boolean => {
    return value < average;
};

/**
 * @description Gets the largest N values from a list and checks if the expected value is included.
 * @param {number[]} list - The list of numbers.
 * @param {number} top - The number of top values to retrieve.
 * @param {number} expectedValue - The expected value to check for inclusion.
 * @returns {boolean} A boolean value indicating whether the expected value is included in the top N values.
 */
export const getTopN = (list: number[], top: number, expectedValue: number): boolean => {
    const heap = getLargestK(list, top);
    return heap.includes(expectedValue);
};

/**
 * @description Gets the smallest N values from a list and checks if the expected value is included.
 * @param {number[]} list - The list of numbers.
 * @param {number} bottom - The number of bottom values to retrieve.
 * @param {number} expectedValue - The expected value to check for inclusion.
 * @returns {boolean} A boolean value indicating whether the expected value is included in the bottom N values.
 */
export const getBottomN = (list: number[], bottom: number, expectedValue: number): boolean => {
    const heap = getSmallestK(list, bottom);
    return heap.includes(expectedValue);
};

export function getNumberFilterExecuteFunc(filter: ITableNumberFilterInfo, calculatedOptions: ICalculatedOptions | undefined) {
    switch (filter.compareType) {
        case TableNumberCompareTypeEnum.Equal:
        {
            const expectedValue = Number(filter.expectedValue);
            return (value: number) => value === expectedValue;
        }
        case TableNumberCompareTypeEnum.NotEqual:
        {
            const expectedValue = Number(filter.expectedValue);
            return (value: number) => value !== expectedValue;
        }
        case TableNumberCompareTypeEnum.GreaterThan:
        {
            const expectedValue = Number(filter.expectedValue);
            return (value: number) => value > expectedValue;
        }
        case TableNumberCompareTypeEnum.GreaterThanOrEqual:
        {
            const expectedValue = Number(filter.expectedValue);
            return (value: number) => value >= expectedValue;
        }
        case TableNumberCompareTypeEnum.LessThan:
        {
            const expectedValue = Number(filter.expectedValue);
            return (value: number) => value < expectedValue;
        }
        case TableNumberCompareTypeEnum.LessThanOrEqual:
        {
            const expectedValue = Number(filter.expectedValue);
            return (value: number) => value <= expectedValue;
        }
        case TableNumberCompareTypeEnum.Between:
        {
            const [min, max] = filter.expectedValue as [number, number];
            const minValue = Number(min);
            const maxValue = Number(max);
            if (minValue > maxValue) {
                return (value: number) => value >= maxValue && value <= minValue;
            }
            return (value: number) => value >= minValue && value <= maxValue;
        }

        case TableNumberCompareTypeEnum.NotBetween:
        {
            const [min, max] = filter.expectedValue as [number, number];
            const minValue = Number(min);
            const maxValue = Number(max);
            if (minValue > maxValue) {
                return (value: number) => value < maxValue || value > minValue;
            }
            return (value: number) => value < minValue || value > maxValue;
        }

        case TableNumberCompareTypeEnum.Above:
        {
            const average = calculatedOptions!.average as number;
            return (value: number) => above(value, average);
        }

        case TableNumberCompareTypeEnum.Below:
        {
            const average = calculatedOptions!.average as number;
            return (value: number) => below(value, average);
        }

        case TableNumberCompareTypeEnum.TopN:
        {
            const list = calculatedOptions!.list as number[];
            const top = Number(filter.expectedValue);

            return (value: number) => getTopN(list, top, value);
        }
    }
}
