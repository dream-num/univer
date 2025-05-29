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

import type { ICellData, Workbook } from '@univerjs/core';
import { createIdentifier, Disposable, IUniverInstanceService, RichTextBuilder, Tools, UniverInstanceType } from '@univerjs/core';
import { isReferenceString } from '../basics/regex';
import { deserializeRangeWithSheet, serializeRange } from '../engine/utils/reference';

export interface IHyperlinkEngineFormulaService {
    generateCellValue(url: string, label: string): ICellData;
}

/**
 *
 */
export class HyperlinkEngineFormulaService extends Disposable implements IHyperlinkEngineFormulaService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    generateCellValue(url: string, label: string): ICellData {
        if (label.trim() === '') {
            return {
                v: '',
            };
        }

        let payload = url;

        // # indicates that the url is a reference to a range within a workbook.
        if (url.startsWith('#') && isReferenceString(url.slice(1))) {
            const { unitId, sheetName, range } = deserializeRangeWithSheet(url.slice(1));
            const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

            // range reference only works in the current workbook
            if (unitId === '' || unitId === workbook.getUnitId()) {
                if (sheetName === '') {
                    // range reference without sheet name, use the active sheet
                    payload = `#gid=${workbook.getActiveSheet().getSheetId()}&range=${serializeRange(range)}`;
                } else {
                    // range reference with sheet name
                    const worksheet = workbook.getSheetBySheetName(sheetName);

                    if (worksheet) {
                        payload = `#gid=${worksheet.getSheetId()}&range=${serializeRange(range)}`;
                    }
                }
            }
        }
        // if the url is a valid url, normalize it.
        else if (Tools.isLegalUrl(url)) {
            payload = Tools.normalizeUrl(url);
        }

        return {
            p: RichTextBuilder.create().insertLink(label, payload).getData(),
        };
    }
}

export const IHyperlinkEngineFormulaService = createIdentifier<HyperlinkEngineFormulaService>(
    'univer.formula.hyperlink-engine-formula.service'
);
