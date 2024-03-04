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

import type { CellValue, Nullable } from '@univerjs/core';
import { CustomFilterOperator } from '@univerjs/core';

/**
 * Extended custom filter operators.
 *
 * These operators are not defined in OOXML,
 * so when exporting these operators we need to fallback to `CustomFilterOperator` and
 * other possible filter types.
 */
export enum ExtendCustomFilterOperator {
    /** Fallback to `<customFilter val="123*" />` */
    STARTS_WITH = 'startsWith',
    /** Fallback to `<customFilter operator="notEqual" val="123*" />` */
    DOES_NOT_START_WITH = 'doesNotStartWith',

    /** Fallback to `<customFilter val="*123" />` */
    ENDS_WITH = 'endsWith',
    /** Fallback to `<customFilter operator="notEqual" val="*123" />` */
    DOES_NOT_END_WITH = 'doesNotEndWith',

    /** Fallback to `<customFilter val="*123*" />` */
    CONTAINS = 'contains',
    /** Fallback to `<customFilter operator="notEqual" val="*123*" />` */
    DOES_NOT_CONTAIN = 'doesNotContain',

    /**
     * Fallbacks to
     *
     * <autoFilter ref="E9:E14" xr:uid="{1F3E5566-0CEC-43B8-BD62-A3D70C54C3B7}">
     *   <filterColumn colId="0">
     *     <filters blank="1"/>
     *   </filterColumn>
     * </autoFilter>
     */
    EQUALS = 'equals',

    /** Fallback to `<customFilter operator="notEqual" val="" />` */
    NOT_EQUALS = 'notEquals',

    /**
     * Fallback to `<filter blank="1" />`.
     *
     * It can also fallback to `<customFilter val="" />`, when with another custom filter.
     */
    EMPTY = 'empty',

    /** Fallback to `<customFilter operator="notEqual" val=" " />` */
    NOT_EMPTY = 'notEmpty',

    /**
     * Falls back to the following XML:
     *
     * ```xml
     * <customFilters and="1">
     *     <customFilter operator="greaterThanOrEqual" val="123"/>
     *     <customFilter operator="lessThanOrEqual" val="456"/>
     * </customFilters>
     * ```
     *
     * Actually in Microsoft Excel, `NOT_BETWEEN` is still `BETWEEN`, as long as the two operators
     * are `greaterThanOrEqual` and `lessThanOrEqual`.
     */
    BETWEEN = 'between',

    /**
     * Falls back to the following XML:
     *
     * ```xml
     * <customFilters> <!-- no `and` means `OR` -->
     *    <customFilter operator="lessThan" val="456"/>
     *   <customFilter operator="greaterThan" val="123"/>
     * </customFilters>
     * ```
     */
    NOT_BETWEEN = 'notBetween',
}

export interface IFilterFn<P extends unknown[]> {
    label?: string;

    /**
     * Description of this operator. Should be an i18n key.
     */
    description?: string;

    fn: (...params: P) => boolean;

}

/**
 * Custom filter functions normally used in "Filter by Conditions".
 */
export interface ICustomFilterFn<P extends unknown[]> extends IFilterFn<P> {
    /**
     * Operator of the custom filter function.
     */
    operator?: CustomFilterOperator;

    /**
     * Group of the custom filter belongs to. It would be rendered in the panel by groups.
     */
    group?: string;

    fn: (...params: P) => boolean;
}

type TwoParameters<C = string> = [value: Nullable<CellValue>, compare: C];

export const greaterThan: ICustomFilterFn<TwoParameters<number>> = {
    operator: CustomFilterOperator.GREATER_THAN,
    fn: (value, compare): boolean => {
        if (!ensureNumber(value)) {
            return false;
        }

        return value > compare;
    },
};

export const greaterThanOrEqualTo: ICustomFilterFn<TwoParameters<number>> = {
    operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
    fn: (value, compare): boolean => {
        if (!ensureNumber(value)) {
            return false;
        }

        return value >= compare;
    },
};

export const lessThan: ICustomFilterFn<TwoParameters<number>> = {
    operator: CustomFilterOperator.LESS_THAN,
    fn: (value, compare): boolean => {
        if (!ensureNumber(value)) {
            return false;
        }

        return value < compare;
    },
};

export const lessThanOrEqualTo: ICustomFilterFn<TwoParameters<number>> = {
    operator: CustomFilterOperator.LESS_THAN_OR_EQUAL,
    fn: (value, compare): boolean => {
        if (!ensureNumber(value)) {
            return false;
        }

        return value <= compare;
    },
};

export const equals: ICustomFilterFn<TwoParameters<number>> = {
    operator: CustomFilterOperator.EQUAL,
    fn: (value, compare): boolean => {
        if (!ensureNumber(value)) {
            return false;
        }

        return value === compare;
    },
};

export const notEquals: ICustomFilterFn<TwoParameters<number | string>> = {
    operator: CustomFilterOperator.NOT_EQUAL,
    fn: (value, compare): boolean => {
        const ensured = ensureString(value);
        if (isWildCardString(compare) && ensured) {
            return !createREGEXFromWildChar(compare as string).test(ensured);
        }

        if (!ensureNumber(value)) {
            return true;
        }

        return value !== compare;
    },
};

// Register the custom filter functions to the registry, making it easier to get them.
export const CustomFilterFnRegistry = new Map<CustomFilterOperator, ICustomFilterFn<TwoParameters<number>>>([]);
[greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo, equals, notEquals].forEach((fn) => {
    CustomFilterFnRegistry.set(fn.operator!, fn);
});

/** This operators matches texts. */
export const textMatch: ICustomFilterFn<TwoParameters<string>> = {
    fn: (value, compare): boolean => {
        const ensured = ensureString(value);
        if (ensured === null) {
            return false;
        }

        return createREGEXFromWildChar(compare).test(ensured);
    },
};

// eslint-disable-next-line ts/no-explicit-any
export function getCustomFilterFn(operator?: CustomFilterOperator): ICustomFilterFn<TwoParameters<any>> {
    if (!operator) {
        return textMatch;
    }

    return CustomFilterFnRegistry.get(operator)!;
}

function ensureNumber(value: Nullable<CellValue>): value is number {
    return typeof value === 'number';
}

function ensureString(value: Nullable<CellValue>): string | null {
    if (typeof value === 'boolean' || value == null) {
        return null;
    }

    return typeof value === 'string' ? value : value.toString();
}

function isWildCardString(str: string | number): boolean {
    if (typeof str === 'number') {
        return false;
    }

    return str.indexOf('*') !== -1 || str.indexOf('?') !== -1;
}

function createREGEXFromWildChar(wildChar: string): RegExp {
    // only '*' and '?' is supported
    const regexpStr = wildChar.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/[*?]/g, '.$&');
    return new RegExp(`^${regexpStr}$`);
}
