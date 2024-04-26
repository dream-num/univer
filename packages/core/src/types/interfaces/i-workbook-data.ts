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

import type { IKeyType, Nullable } from '../../shared/types';
import type { LocaleType } from '../enum';
import type { IExtraModelData } from './i-extra-model-data';
import type { IStyleData } from './i-style-data';
import type { IWorksheetData } from './i-worksheet-data';

/**
 * Properties of a workbook's configuration
 */
export interface IWorkbookData extends IExtraModelData {
    /**
     * unit id
     */
    id: string;

    /**
     * Revision of this spreadsheet. Would be used in collaborated editing. Starts from one.
     */
    rev?: number;

    /**
     * Name of the spreadsheet.
     */
    name: string;

    /**
     * Version of Univer model definition.
     */
    appVersion: string;

    locale: LocaleType;

    /** Style reference. */
    styles: IKeyType<Nullable<IStyleData>>;

    sheetOrder: string[]; // sheet id order list ['xxxx-sheet3', 'xxxx-sheet1','xxxx-sheet2']
    sheets: { [sheetId: string]: Partial<IWorksheetData> };

    // The type of data depends on how the plug-in is defined
    resources?: Array<{ id?: string; name: string; data: string }>;
}
