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

export enum ErrorType {
    /** Division by zero. */
    DIV_BY_ZERO = '#DIV/0!',

    /** Function error. */
    NAME = '#NAME?',
    VALUE = '#VALUE!',
    NUM = '#NUM!',
    NA = '#N/A',

    /** Cyclic dependency. */
    CYCLE = '#CYCLE!',

    /** Wrong reference. */
    REF = '#REF!',

    /** Array spill error. */
    SPILL = '#SPILL!',

    /** Calculation error. */
    CALC = '#CALC!',

    /** Generic error */
    ERROR = '#ERROR!',

    /** connected to remote */
    CONNECT = '#GETTING_DATA',

    /** In the case of SUM(B1 C1), */
    NULL = '#NULL!',
}

export const ERROR_TYPE_SET = new Set(Object.values(ErrorType));

export const ERROR_TYPE_COUNT_ARRAY = [...new Set(Object.values(ErrorType).map((error) => error.length))];
