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

import type { BooleanNumber } from '@univerjs/core';

import type { FUNCTION_NAMES_ARRAY } from '../functions/array/function-names';
import type { FUNCTION_NAMES_COMPATIBILITY } from '../functions/compatibility/function-names';
import type { FUNCTION_NAMES_CUBE } from '../functions/cube/function-names';
import type { FUNCTION_NAMES_DATABASE } from '../functions/database/function-names';
import type { FUNCTION_NAMES_DATE } from '../functions/date/function-names';
import type { FUNCTION_NAMES_ENGINEERING } from '../functions/engineering/function-names';
import type { FUNCTION_NAMES_FINANCIAL } from '../functions/financial/function-names';
import type { FUNCTION_NAMES_INFORMATION } from '../functions/information/function-names';
import type { FUNCTION_NAMES_LOGICAL } from '../functions/logical/function-names';
import type { FUNCTION_NAMES_LOOKUP } from '../functions/lookup/function-names';
import type { FUNCTION_NAMES_MATH } from '../functions/math/function-names';
import type { FUNCTION_NAMES_META } from '../functions/meta/function-names';
import type { FUNCTION_NAMES_STATISTICAL } from '../functions/statistical/function-names';
import type { FUNCTION_NAMES_TEXT } from '../functions/text/function-names';
import type { FUNCTION_NAMES_UNIVER } from '../functions/univer/function-names';
import type { FUNCTION_NAMES_WEB } from '../functions/web/function-names';

/**
 * Function type, refer to https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb
 */
export enum FunctionType {
    /**
     * Financial Functions
     */

    Financial,
    /**
     * Date and Time Functions
     */
    Date,

    /**
     * Math and Trigonometry Functions
     */
    Math,

    /**
     * Statistical Functions
     */
    Statistical,

    /**
     * Lookup and Reference Functions
     */
    Lookup,

    /**
     * Database Functions
     */
    Database,

    /**
     * Text Functions
     */
    Text,

    /**
     * Logical Functions
     */
    Logical,

    /**
     * Information Functions
     */
    Information,

    /**
     * Engineering Functions
     */
    Engineering,

    /**
     * Cube Functions
     */
    Cube,

    /**
     * Compatibility Functions
     */
    Compatibility,

    /**
     * Web Functions
     */
    Web,

    /**
     * Array Functions
     */
    Array,

    /**
     * Univer-specific functions
     */
    Univer,

    /**
     * User-defined functions
     */
    User,

     /**
      * Defined name
      */
    DefinedName,
}

export interface IFunctionParam {
    /**
     * Function name, with internationalization
     */
    name: string;

    /**
     * Detailed description of function, with internationalization
     */
    detail: string;

    /**
     * Function example
     */
    example: string;

    /**
     * Is it optional
     *
     * true: required
     * false: optional
     */
    require: BooleanNumber;

    /**
     * Whether it is repeatable, in the case of repeatability, the maximum parameter of m is generally set to 255, such as [1,255]
     *
     * true: repeatable
     * false: not repeatable
     */
    repeat: BooleanNumber;
}

export interface IFunctionInfo {
    /**
     * Function name
     */
    functionName: string;

    /**
     * Alias function name
     */
    aliasFunctionName?: string;

    /**
     * Function type
     */
    functionType: FunctionType;

    /**
     * Detailed description
     */
    description: string;

    /**
     * Concise abstract
     */
    abstract: string;

    /**
     * Function params
     */
    functionParameter: IFunctionParam[];
}

export type IFunctionNames =
    | string
    | FUNCTION_NAMES_ARRAY
    | FUNCTION_NAMES_COMPATIBILITY
    | FUNCTION_NAMES_CUBE
    | FUNCTION_NAMES_DATABASE
    | FUNCTION_NAMES_DATE
    | FUNCTION_NAMES_ENGINEERING
    | FUNCTION_NAMES_FINANCIAL
    | FUNCTION_NAMES_INFORMATION
    | FUNCTION_NAMES_LOGICAL
    | FUNCTION_NAMES_LOOKUP
    | FUNCTION_NAMES_MATH
    | FUNCTION_NAMES_META
    | FUNCTION_NAMES_STATISTICAL
    | FUNCTION_NAMES_TEXT
    | FUNCTION_NAMES_UNIVER
    | FUNCTION_NAMES_WEB;
