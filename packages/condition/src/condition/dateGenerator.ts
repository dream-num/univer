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
 * @descriptionThe first quarter of a year
 * @returns {boolean} return the date is match
 */
export const dateQ1 = (date: Date): boolean => {
    const month = date.getMonth();
    return month <= 2;
};
/**
 * @description	The second quarter of a year
 * @returns {boolean} return the date is match
 */
export const dateQ2 = (date: Date): boolean => {
    const month = date.getMonth();
    return month > 2 && month <= 5;
};
/**
 * @description	The 3'th quarter of a year
 * @returns {boolean} return the date is match
 */
export const dateQ3 = (date: Date): boolean => {
    const month = date.getMonth();
    return month > 5 && month <= 8;
};
/**
 * @description	The last quarter of a year
 * @returns {boolean} return the date is match
 */
export const dateQ4 = (date: Date): boolean => {
    const month = date.getMonth();
    return month > 8 && month <= 11;
};
/**
 * @description	January
 * @returns {boolean} return the date is match
 */
export const dateM1 = (date: Date): boolean => {
    return date.getMonth() === 0;
};
/**
 * @description	February
 * @returns {boolean} return the date is match
 */
export const dateM2 = (date: Date): boolean => {
    return date.getMonth() === 1;
};
/**
 * @description	March
 * @returns {boolean} return the date is match
 */
export const dateM3 = (date: Date): boolean => {
    return date.getMonth() === 2;
};
/**
 * @description	April
 * @returns {boolean} return the date is match
 */
export const dateM4 = (date: Date): boolean => {
    return date.getMonth() === 3;
};
/**
 * @description	May
 * @returns {boolean} return the date is match
 */
export const dateM5 = (date: Date): boolean => {
    return date.getMonth() === 4;
};
/**
 * @description	June
 * @returns {boolean} return the date is match
 */
export const dateM6 = (date: Date): boolean => {
    return date.getMonth() === 5;
};
/**
 * @description	July
 * @returns {boolean} return the date is match
 */
export const dateM7 = (date: Date): boolean => {
    return date.getMonth() === 6;
};
/**
 * @description	August
 * @returns {boolean} return the date is match
 */
export const dateM8 = (date: Date): boolean => {
    return date.getMonth() === 7;
};
/**
 * @description	September
 * @returns {boolean} return the date is match
 */
export const dateM9 = (date: Date): boolean => {
    return date.getMonth() === 8;
};
/**
 * @description	October
 * @returns {boolean} return the date is match
 */
export const dateM10 = (date: Date): boolean => {
    return date.getMonth() === 9;
};
/**
 * @description	November
 * @returns {boolean} return the date is match
 */
export const dateM11 = (date: Date): boolean => {
    return date.getMonth() === 10;
};
/**
 * @description	December
 * @returns {boolean} return the date is match
 */
export const dateM12 = (date: Date): boolean => {
    return date.getMonth() === 11;
};
