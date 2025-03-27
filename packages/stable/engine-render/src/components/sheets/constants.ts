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

import { SHEET_VIEWPORT_KEY } from './interfaces';

export const BORDER_Z_INDEX = 50;
export const FONT_EXTENSION_Z_INDEX = 45;
export const BG_Z_INDEX = 21;
export const PRINTING_BG_Z_INDEX = 21;

export const EXPAND_SIZE_FOR_RENDER_OVERFLOW = 20;

export const sheetContentViewportKeys = [SHEET_VIEWPORT_KEY.VIEW_MAIN, SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT];

export const sheetHeaderViewportKeys = [SHEET_VIEWPORT_KEY.VIEW_ROW_TOP, SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT, SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP];

export const MEASURE_EXTENT = 10000;
export const MEASURE_EXTENT_FOR_PARAGRAPH = MEASURE_EXTENT / 10;
