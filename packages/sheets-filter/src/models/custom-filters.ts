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

import type { CellValue, Nullable } from '@univerjs/core';
import { isNumeric } from '@univerjs/core';
import { CustomFilterOperator } from './types';

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
    operator: CustomFilterOperator.NOT_EQUALS,
    fn: (value, compare): boolean => {
        // As text match.
        if (typeof compare === 'string') {
            if (compare === ' ') {
                if (value !== undefined && value !== null) return true;
                return false;
            };

            const ensuredString = ensureString(value);
            if (ensuredString && isWildCardString(compare)) return !createREGEXFromWildChar(compare as string).test(ensuredString);
            return ensuredString !== compare;
        }

        // As numeric match.
        if (!ensureNumber(value)) return true;
        return value !== compare;
    },
};

// Register the custom filter functions to the registry, making it easier to get them.
export const CustomFilterFnRegistry = new Map<CustomFilterOperator, ICustomFilterFn<TwoParameters<number>>>([]);

const ALL_CUSTOM_FILTER_FUNCTIONS = [greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo, equals, notEquals];
ALL_CUSTOM_FILTER_FUNCTIONS.forEach((fn) => {
    CustomFilterFnRegistry.set(fn.operator!, fn);
});

export function isNumericFilterFn(operator?: CustomFilterOperator): boolean {
    return !!operator;
}

/** This operators matches texts. */
export const textMatch: ICustomFilterFn<TwoParameters<string>> = {
    fn: (value, compare): boolean => {
        const ensured = ensureString(value);
        if (ensured === null) {
            if (compare === '') return true;
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

export function ensureNumeric(value: Nullable<CellValue>): boolean {
    if (typeof value === 'number') {
        return true;
    };

    if (typeof value === 'string' && isNumeric(value)) {
        return true;
    }

    return false;
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
    const regexpStr = wildChar.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('?', '.').replace(/[*]/g, '.$&');
    return new RegExp(`^${regexpStr}$`);
}
