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

export * from './clone';
export { getEmptySnapshot as getSheetsEmptySnapshot } from './empty-snapshot';
export { Range } from './range';
export * from './sheet-skeleton';
export {
    DEFAULT_WORKSHEET_COLUMN_COUNT,
    DEFAULT_WORKSHEET_COLUMN_COUNT_KEY,
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT,
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT_KEY,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY,
    DEFAULT_WORKSHEET_ROW_COUNT,
    DEFAULT_WORKSHEET_ROW_COUNT_KEY,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    DEFAULT_WORKSHEET_ROW_HEIGHT_KEY,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH_KEY,
    mergeWorksheetSnapshotWithDefault,
} from './sheet-snapshot-utils';
export { Styles } from './styles';
export * from './typedef';
export {
    addLinkToDocumentModel,
    createDocumentModelWithStyle,
    getEmptyCell,
    isNotNullOrUndefined,
    isRangesEqual,
    isUnitRangesEqual,
} from './util';
export { SheetViewModel } from './view-model';
export { getWorksheetUID, Workbook } from './workbook';
export { extractPureTextFromCell, getDisplayValueFromCell, getOriginCellValue, Worksheet } from './worksheet';
