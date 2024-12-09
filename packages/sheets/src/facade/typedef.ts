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

/**
 * @typedef StyleDataInfo - The style of the worksheet.
 * @property {string} [ff] The font family.
 * @property {number} [fs] The font size.
 * @property {boolean|number} [it] The italic.
 * @property {boolean|number} [bl] The bold.
 * @property {ITextDecoration} [ul] The underline.
 * @property {ITextDecoration} [bbl] The bottom border line.
 * @property {ITextDecoration} [st] The strikethrough.
 * @property {ITextDecoration} [ol] The overline.
 * @property {IColorStyle} [bg] The background color.
 * @property {IBorderData} [bd] The border.
 * @property {string} [cl] The foreground.
 * @property {BaselineOffset} [va] The subscript/superscript text base line.
 * @property {Record<string, string>} [n] The custom properties.
 * @property {ITextRotation} [tr] The text rotation.
 * @property {number} [td] The textDirection.
 * @property {HorizontalAlign} ht The horizontalAlignment.
 * @property {VerticalAlign} [vt] The verticalAlignment.
 * @property {WrapStrategy} [tb] The wrapStrategy.
 * @property {IPaddingData} [pd] The padding.
 */

/**
 * @typedef {object} PrimaryInfo -Represents the current select cell info.Please consider of the cell maybe a merged cell.
 * @property {number} actualColumn The actual column index of the cell.
 * @property {number} actualRow The actual row index of the cell.
 * @property {number} endColumn The end column index of the cell.
 * @property {number} endRow The end row index of the cell.
 * @property {boolean} isMerged Whether the cell is a merged cell.
 * @property {boolean} isMergedMainCell Whether the cell is a main cell of a merged cell. Only the cell row and col is the start row and col of the merged cell, this value is true.
 * @property {number} startColumn The start column index of the cell.
 * @property {number} startRow The start row index of the cell.
 */

