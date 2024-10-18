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

export const textEqual = (compareValue: string, expectedValue: string) => {
    return compareValue === expectedValue;
};

export const textNotEqual = (compareValue: string, expectedValue: string) => {
    return compareValue !== expectedValue;
};

export const textContain = (compareValue: string, expectedValue: string) => {
    return compareValue.includes(expectedValue);
};

export const textNotContain = (compareValue: string, expectedValue: string) => {
    return !compareValue.includes(expectedValue);
};

export const textStartWith = (compareValue: string, expectedValue: string) => {
    return compareValue.startsWith(expectedValue);
};

export const textEndWith = (compareValue: string, expectedValue: string) => {
    return compareValue.endsWith(expectedValue);
};

export const textMatch = (compareValue: string, expectedValue: string) => {
    return new RegExp(expectedValue).test(compareValue);
};

export const textNotMatch = (compareValue: string, expectedValue: string) => {
    return !new RegExp(expectedValue).test(compareValue);
};

export const textEmpty = (compareValue: string) => {
    return compareValue === '';
};

export const textNotEmpty = (compareValue: string) => {
    return compareValue !== '';
};

