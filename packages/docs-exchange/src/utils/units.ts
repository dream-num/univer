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

/** Points per CSS pixel at 96 DPI. */
const PT_PER_PX = 0.75;

/** OOXML dxa (1/20 pt) → pt. */
export function dxaToPt(dxa: number): number {
    return dxa / 20;
}

/** OOXML dxa → CSS px. Equivalent to dxa / 20 / 0.75 = dxa / 15. */
export function dxaToPx(dxa: number): number {
    return dxa / 15;
}

/** OOXML half-point (w:sz, w:szCs) → pt. */
export function hpToPt(hp: number): number {
    return hp / 2;
}

/** OOXML half-point → CSS px. */
export function hpToPx(hp: number): number {
    return hp / 2 / PT_PER_PX;
}

/** pt → CSS px. Use only when you already have a pt value (e.g. mid-pipeline). */
export function ptToPx(pt: number): number {
    return pt / PT_PER_PX;
}
