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

export const SHEET_ZOOM_RANGE = [10, 400];

export enum SHEET_VIEW_KEY {
    MAIN = '__SpreadsheetRender__',
    ROW = '__SpreadsheetRowHeader__',
    COLUMN = '__SpreadsheetColumnHeader__',
    LEFT_TOP = '__SpreadsheetLeftTopPlaceholder__',
}

/**
 * @deprecated. use SHEET_VIEWPORT_KEY from engine-render instead.
 */
export enum SHEET_VIEWPORT_KEY {
    VIEW_MAIN = 'viewMain',
    VIEW_MAIN_LEFT_TOP = 'viewMainLeftTop',
    VIEW_MAIN_TOP = 'viewMainTop',
    VIEW_MAIN_LEFT = 'viewMainLeft',

    VIEW_ROW_TOP = 'viewRowTop',
    VIEW_ROW_BOTTOM = 'viewRowBottom',
    VIEW_COLUMN_LEFT = 'viewColumnLeft',
    VIEW_COLUMN_RIGHT = 'viewColumnRight',
    VIEW_LEFT_TOP = 'viewLeftTop',
}

export const SHEET_COMPONENT_MAIN_LAYER_INDEX = 0;

export const SHEET_COMPONENT_SELECTION_LAYER_INDEX = 1;

export const SHEET_COMPONENT_HEADER_LAYER_INDEX = 10;

export const SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX = 11;

export const SHEET_COMPONENT_UNHIDE_LAYER_INDEX = 12;

// TODO@wzhudev: there should be a global zIndex layer fo sheet selections // And global zIndex for extension
