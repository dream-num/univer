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

export function round(number: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.round(number * factor) / factor;
}

export function pow(number: number, precision: number) {
    return number ** precision;
}

export function log10(number: number) {
    return Math.log10(number);
}
