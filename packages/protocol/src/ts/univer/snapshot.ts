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

import type { IBoardMeta } from './board';
import type { UniverType } from './constants/univer';
import type { IDocumentMeta } from './doc';
import type { IPdfMeta } from './pdf';
import type { ISlideMeta } from './slide';
import type { IWorkbookMeta } from './workbook';

export interface ISnapshot {
    /** unitID of the Univer document */
    unitID: string;
    type: UniverType;
    rev: number;
    workbook: IWorkbookMeta | undefined;
    doc: IDocumentMeta | undefined;
    slide: ISlideMeta | undefined;
    board: IBoardMeta | undefined;
    pdf?: IPdfMeta | undefined;
}

export interface ITableInfo {
    /** json:ITableInfo */
    meta: Uint8Array;
    dataPath: string;
    /** A matrix of values in JSON format. use in IGetPreprocessRangesResponse */
    data?: string | undefined;
}
