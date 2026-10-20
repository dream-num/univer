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

/** English Metric Units per CSS pixel at 96 DPI. */
export const EMU_PER_CSS_PX = 9525;

export function cssPxToEmu(value: number): number {
    return Math.round(value * EMU_PER_CSS_PX);
}

export function emuToCssPx(value: number): number {
    return value / EMU_PER_CSS_PX;
}
