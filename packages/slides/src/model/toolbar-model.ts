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

// export interface IShowToolbarConfig {
//     undoRedo?: boolean; // Undo redo
//     paintFormat?: boolean; // Format brush
//     currencyFormat?: boolean; // currency format
//     percentageFormat?: boolean; // Percentage format
//     numberDecrease?: boolean; // 'Decrease the number of decimal places'
//     numberIncrease?: boolean; // 'Increase the number of decimal places
//     moreFormats?: boolean; // 'More Formats'
//     font?: boolean; // 'font'
//     fontSize?: boolean; // 'Font size'
//     bold?: boolean; // 'Bold (Ctrl+B)'
//     italic?: boolean; // 'Italic (Ctrl+I)'
//     strikethrough?: boolean; // 'Strikethrough (Alt+Shift+5)'
//     underline?: boolean; // 'Underline (Alt+Shift+6)'
//     textColor?: boolean; // 'Text color'
//     fillColor?: boolean; // 'Cell color'
//     border?: boolean; // 'border'
//     mergeCell?: boolean; // 'Merge cells'
//     horizontalAlignMode?: boolean; // 'Horizontal alignment'
//     verticalAlignMode?: boolean; // 'Vertical alignment'
//     textWrapMode?: boolean; // 'Wrap mode'
//     textRotateMode?: boolean; // 'Text Rotation Mode'

//     image?: boolean; // 'Insert picture'
//     link?: boolean; // 'Insert link'
//     chart?: boolean; // 'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
//     comment?: boolean; // 'comment'
//     pivotTable?: boolean; // 'PivotTable'
//     function?: boolean; // 'formula'
//     frozenMode?: boolean; // 'freeze mode'
//     sortAndFilter?: boolean; // 'Sort and filter'
//     conditionalFormatting?: boolean; // 'Conditional Formatting'
//     dataValidation?: boolean; // 'Data Validation'
//     splitColumn?: boolean; // 'Split column'
//     screenshot?: boolean; // 'screenshot'
//     findAndReplace?: boolean; // 'Find and Replace'
//     protection?: boolean; // 'Worksheet protection'
//     print?: boolean; // 'Print'
// }

// enum ToolbarType {
//     SELECT,
//     BUTTON,
// }

// // 继承基础下拉属性,添加国际化
// export interface BaseToolbarSelectChildrenProps extends BaseSelectChildrenProps {
//     locale?: string;
//     suffixLocale?: string;
//     children?: BaseToolbarSelectChildrenProps[];
// }

// interface BaseToolbarSelectProps extends IBaseSelectProps {
//     locale?: string;
//     suffixLocale?: string;
//     children?: BaseToolbarSelectChildrenProps[];
// }

// export interface IToolbarItemProps extends BaseToolbarSelectProps, BaseTextButtonProps {
//     show?: boolean; //是否显示按钮
//     toolbarType?: ToolbarType;
//     locale?: string; //label国际化
//     tooltipLocale?: string; //tooltip国际化
//     tooltip?: string; //tooltip文字
//     border?: boolean;
// }

// export class ToolbarModel {
//     private _config: IShowToolbarConfig[];

//     private _toolList: IToolbarItemProps[];

//     get config(): IShowToolbarConfig[] {
//         return this._config;
//     }

//     get toolList(): IToolbarItemProps[] {
//         return this._toolList;
//     }

//     set config(value: IShowToolbarConfig[]) {
//         this._config = value;
//     }

//     set toolList(value: IToolbarItemProps[]) {
//         this._toolList = value;
//     }
// }
