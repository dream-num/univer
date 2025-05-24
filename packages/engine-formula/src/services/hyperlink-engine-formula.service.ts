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
import { createIdentifier, Disposable, Inject, IUniverInstanceService, LocaleService, RichTextBuilder, UniverInstanceType } from '@univerjs/core';
import { isReferenceString } from '../basics/regex';
import { deserializeRangeWithSheet, serializeRange } from '../engine/utils/reference';
import { IFunctionService } from './function.service';

export interface IHyperlinkEngineFormulaService {
    generateCellValue(url: string, label: string): ICellData;
}

/**
 *
 */
export class HyperlinkEngineFormulaService extends Disposable implements IHyperlinkEngineFormulaService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    generateCellValue(url: string, label: string): ICellData {
        let payload = url;

        if (url.startsWith('#') && isReferenceString(url.slice(1))) {
            const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const info = deserializeRangeWithSheet(url.slice(1));
            const worksheet = workbook.getSheetBySheetName(info.sheetName);

            if (worksheet) {
                payload = `#gid=${worksheet.getSheetId()}&range=${serializeRange(info.range)}`;
            } else {
                payload = `#gid=${workbook.getActiveSheet()?.getSheetId() ?? ''}&range=${serializeRange(info.range)}`;
            }
        }

        return {
            p: RichTextBuilder.create().insertLink(label, payload).getData(),
        };
    }
}

export const IHyperlinkEngineFormulaService = createIdentifier<HyperlinkEngineFormulaService>(
    'univer.formula.hyperlink-engine-formula.service'
);
