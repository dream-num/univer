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

// import type { IRangeThemeStyleJSON } from '../range-theme-util';
// import { BooleanNumber, HorizontalAlign } from '@univerjs/core';
// import { RangeThemeStyle } from '../range-theme-util';
import { darkBlueRangeThemeStyle, lightBlueRangeThemeStyle, middleBlueRangeThemeStyle } from './blue';
import { darkGreenRangeThemeStyle, lightGreenRangeThemeStyle, middleGreenRangeThemeStyle } from './green';
import { darkPurpleRangeThemeStyle, lightPurpleRangeThemeStyle, middlePurpleRangeThemeStyle } from './purple';
import { darkRedRangeThemeStyle, lightRedRangeThemeStyle, middleRedRangeThemeStyle } from './red';
import { darkYellowRangeThemeStyle, lightYellowRangeThemeStyle, middleYellowRangeThemeStyle } from './yellow';

// export const rangeThemeBuilder = (baseName: string, header: string, firstColor: string, secondColor: string) => {
//     const columnRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {
//         firstColumnStyle: {
//             bg: {
//                 rgb: firstColor,
//             },
//         },
//         secondColumnStyle: {
//             bg: {
//                 rgb: secondColor,
//             },
//         },
//     };
//     const rowRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {
//         firstRowStyle: {
//             bg: {
//                 rgb: firstColor,
//             },
//         },
//         secondRowStyle: {
//             bg: {
//                 rgb: secondColor,
//             },
//         },
//     };
//     const rowHeaderStyle = {
//         headerRowStyle: {
//             bg: {
//                 rgb: header,
//             },
//             ht: HorizontalAlign.CENTER,
//             bl: BooleanNumber.TRUE,
//         },
//         lastRowStyle: {
//             bg: {
//                 rgb: header,
//             },
//             ht: HorizontalAlign.CENTER,
//             bl: BooleanNumber.TRUE,
//         },
//     };
//     const columnHeaderStyle = {
//         headerColumnStyle: {
//             bg: {
//                 rgb: header,
//             },
//             ht: HorizontalAlign.CENTER,
//             bl: BooleanNumber.TRUE,
//         },
//         lastColumnStyle: {
//             bg: {
//                 rgb: header,
//             },
//             ht: HorizontalAlign.CENTER,
//             bl: BooleanNumber.TRUE,
//         },
//     };
//     const baseRangeThemeStyle = new RangeThemeStyle(baseName, rowRangeThemeStyleJSON);
//     const withHeaderRangeThemeStyle = new RangeThemeStyle(`row-${baseName}`, { ...rowHeaderStyle, ...rowRangeThemeStyleJSON });
//     const withColumnHeaderRangeThemeStyle = new RangeThemeStyle(`column-${baseName}`, { ...columnHeaderStyle, ...columnRangeThemeStyleJSON });
//     return [baseRangeThemeStyle, withHeaderRangeThemeStyle, withColumnHeaderRangeThemeStyle];
// };

// export const buildInThemes = [
//     ...rangeThemeBuilder('blue', 'rgb(119,159,205)', 'rgb(184,216,235)', 'rgb(119,159,205)'),
//     ...rangeThemeBuilder('yellow', 'rgb(254,202,73)', 'rgb(254,251,218)', 'rgb(255,236,158)'),
//     ...rangeThemeBuilder('green', 'rgb(155,187,89)', 'rgb(194,214,155)', 'rgb(155,187,89)'),
//     ...rangeThemeBuilder('pink', 'rgb(255,197,207)', 'rgb(255,242,242)', 'rgb(247,222,223)'),
// ];
export const buildInThemes = [
    lightBlueRangeThemeStyle,
    middleBlueRangeThemeStyle,
    darkBlueRangeThemeStyle,
    lightRedRangeThemeStyle,
    middleRedRangeThemeStyle,
    darkRedRangeThemeStyle,
    lightGreenRangeThemeStyle,
    middleGreenRangeThemeStyle,
    darkGreenRangeThemeStyle,
    lightPurpleRangeThemeStyle,
    middlePurpleRangeThemeStyle,
    darkPurpleRangeThemeStyle,
    lightYellowRangeThemeStyle,
    middleYellowRangeThemeStyle,
    darkYellowRangeThemeStyle,
];
