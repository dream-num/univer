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

/**
 * OOXML ST_Border w:val → Univer DashStyleType.
 *
 *   1 = SOLID, 2 = DOT, 3 = DASH, 4 = DOT_DASH, 5 = DOT_DOT_DASH.
 *
 * Styles Univer can't express (double/triple, wave, 3D, thinThick variants)
 * collapse to SOLID. See IMPORT_NOTES.md for the full list of unsupported
 * border styles.
 */
export const DOCX_BORDER_TO_UNIVER_DASH: Record<string, number> = {
    single: 1,
    thick: 1,
    double: 1,
    triple: 1,
    thinThickSmallGap: 1,
    thickThinSmallGap: 1,
    thinThickThinSmallGap: 1,
    thinThickMediumGap: 1,
    thickThinMediumGap: 1,
    thinThickThinMediumGap: 1,
    thinThickLargeGap: 1,
    thickThinLargeGap: 1,
    thinThickThinLargeGap: 1,
    wave: 1,
    doubleWave: 1,
    dashSmallGap: 3,
    dashed: 3,
    dotDash: 4,
    dotDotDash: 5,
    dotted: 2,
};
