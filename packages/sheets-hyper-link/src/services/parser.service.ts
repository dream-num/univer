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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import { Inject, isValidRange, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { ERROR_RANGE } from '../types/const';
import { SheetHyperLinkType } from '../types/enums/hyper-link-type';

export interface ISheetUrlParams {
    gid?: string;
    range?: string;
    rangeid?: string;
    unitid?: string;
}

export interface ISheetHyperLinkInfo {
    type: SheetHyperLinkType;
    name: string;
    url: string;
    searchObj: Nullable<ISheetUrlParams>;
}

export class SheetsHyperLinkParserService {
    constructor(
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @IDefinedNamesService private _definedNamesService: IDefinedNamesService
    ) {}

    buildHyperLink(unitId: string, sheetId: string, range?: string | IRange): string {
        return `#${SheetHyperLinkType.SHEET}=${sheetId}${range ? `&${typeof range === 'string' ? SheetHyperLinkType.DEFINE_NAME : SheetHyperLinkType.RANGE}=${typeof range === 'string' ? range : serializeRange(range)}` : ''}`;
    }

    parseHyperLink(urlStr: string): ISheetHyperLinkInfo {
        if (urlStr.startsWith('#')) {
            const search = new URLSearchParams(urlStr.slice(1));
            const searchObj: ISheetUrlParams = {
                gid: search.get('gid') ?? '',
                range: search.get('range') ?? '',
                rangeid: search.get('rangeid') ?? '',
                unitid: search.get('unitid') ?? '',
            };
            const urlInfo = this._getURLName(searchObj);

            return {
                type: urlInfo.type,
                name: urlInfo.name,
                url: urlStr,
                searchObj,
            };
        } else {
            return {
                type: SheetHyperLinkType.URL,
                name: urlStr,
                url: urlStr,
                searchObj: null,
            };
        }
    }

    private _getURLName(params: ISheetUrlParams) {
        const { gid, range, rangeid, unitid } = params;
        const workbook = unitid ?
            this._univerInstanceService.getUnit<Workbook>(unitid, UniverInstanceType.UNIVER_SHEET)
            : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const invalidLink = {
            type: SheetHyperLinkType.INVALID,
            name: this._localeService.t('hyperLink.message.refError'),
        };

        if (!workbook) {
            return invalidLink;
        }

        const sheet = gid ? workbook.getSheetBySheetId(gid) : workbook.getActiveSheet();
        const sheetName = sheet?.getName() ?? '';

        if (range) {
            if (!sheet) return invalidLink;
            const rangeObj = deserializeRangeWithSheet(range).range;
            if (isValidRange(rangeObj, sheet) && range !== ERROR_RANGE) {
                return {
                    type: SheetHyperLinkType.RANGE,
                    name: serializeRangeWithSheet(sheetName, rangeObj),
                };
            }
            return invalidLink;
        }

        if (rangeid) {
            const range = this._definedNamesService.getValueById(workbook.getUnitId(), rangeid);
            if (range) {
                return {
                    type: SheetHyperLinkType.DEFINE_NAME,
                    name: range.formulaOrRefString,
                };
            }
            return invalidLink;
        }

        if (gid) {
            const worksheet = workbook.getSheetBySheetId(gid);
            if (worksheet) {
                return {
                    type: SheetHyperLinkType.SHEET,
                    name: worksheet.getName(),
                };
            }
            return invalidLink;
        }

        return invalidLink;
    }
}
