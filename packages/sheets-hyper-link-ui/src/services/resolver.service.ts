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

import { ICommandService, IConfigService, Inject, isValidRange, IUniverInstanceService, LocaleService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { ERROR_RANGE, SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { PLUGIN_CONFIG_KEY } from '../controllers/config.schema';
import type { IUniverSheetsHyperLinkUIConfig } from '../controllers/config.schema';
import type { ISheetHyperLinkInfo } from '../types/interfaces/i-sheet-hyper-link-info';
import type { ISheetUrlParams } from '../types/interfaces/i-sheet-url-params';

function getContainRange(range: IRange, worksheet: Worksheet) {
    const mergedCells = worksheet.getMergeData();
    const maxCol = worksheet.getMaxColumns() - 1;
    const maxRow = worksheet.getMaxRows() - 1;
    if (maxCol < range.endColumn) {
        range.endColumn = maxCol;
    }

    if (maxRow < range.endRow) {
        range.endRow = maxRow;
    }

    if (range.rangeType === RANGE_TYPE.COLUMN || RANGE_TYPE.ROW) {
        return range;
    }

    const relativeCells: IRange[] = [];
    mergedCells.forEach((cell) => {
        if (Rectangle.intersects(range, cell)) {
            relativeCells.push(cell);
        }
    });

    return Rectangle.realUnion(range, ...relativeCells);
}

export class SheetsHyperLinkResolverService {
    constructor(
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @ICommandService private _commandService: ICommandService,
        @IDefinedNamesService private _definedNamesService: IDefinedNamesService,
        @IMessageService private _messageService: IMessageService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @IConfigService private _configService: IConfigService
    ) { }

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

    navigateTo(params: ISheetUrlParams) {
        const { gid, range, rangeid } = params;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }
        const unitId = workbook.getUnitId();
        if (rangeid) {
            this.navigateToDefineName(unitId, rangeid);
        }

        if (!gid) {
            return;
        }

        if (range) {
            const rangeInfo = deserializeRangeWithSheet(range);
            if (isValidRange(rangeInfo.range) && range !== ERROR_RANGE) {
                this.navigateToRange(unitId, gid, rangeInfo.range);
            }
            return;
        }

        this.navigateToSheetById(unitId, gid);
    }

    buildHyperLink(unitId: string, sheetId: string, range?: string | IRange): string {
        return `#${SheetHyperLinkType.SHEET}=${sheetId}${range ? `&${typeof range === 'string' ? SheetHyperLinkType.DEFINE_NAME : SheetHyperLinkType.RANGE}=${typeof range === 'string' ? range : serializeRange(range)}` : ''}`;
    }

    parseHyperLink(urlStr: string): ISheetHyperLinkInfo {
        if (urlStr.startsWith('#')) {
            const search = new URLSearchParams(urlStr.slice(1));
            // range, gid, rangeid
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
                handler: () => {
                    this.navigateTo(searchObj);
                },
            };
        } else {
            return {
                type: SheetHyperLinkType.URL,
                name: urlStr,
                url: urlStr,
                handler: () => {
                    this.navigateToOtherWebsite(urlStr);
                },
                searchObj: null,
            };
        }
    }

    async navigateToRange(unitId: string, subUnitId: string, range: IRange) {
        const worksheet = await this.navigateToSheetById(unitId, subUnitId);
        if (worksheet) {
            const realRange = getContainRange(range, worksheet);
            await this._commandService.executeCommand(
                SetSelectionsOperation.id,
                {
                    unitId,
                    subUnitId,

                    selections: [{
                        range: realRange,
                    }],
                } as ISetSelectionsOperationParams
            );
            await this._commandService.executeCommand(ScrollToRangeOperation.id, {
                range: realRange,
            });
        }
    }

    async navigateToSheet(unitId: string, sheetName: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();

        if (worksheet?.getName() === sheetName) {
            return true;
        }
        const targetSheet = workbook.getSheetBySheetName(sheetName);

        if (!targetSheet) {
            this._messageService.show({
                content: this._localeService.t('hyperLink.message.noSheet'),
                type: MessageType.Error,
            });
            return;
        }

        const sheetId = targetSheet.getSheetId();
        if (workbook.getHiddenWorksheets().indexOf(sheetId) > -1) {
            this._messageService.show({
                content: this._localeService.t('hyperLink.message.hiddenSheet'),
                type: MessageType.Error,
            });
        }

        return await this._commandService.executeCommand(SetWorksheetActiveOperation.id, { unitId, subUnitId: sheetId });
    }

    async navigateToSheetById(unitId: string, subUnitId: string) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        if (worksheet.getSheetId() === subUnitId) {
            return worksheet;
        }

        const targetSheet = workbook.getSheetBySheetId(subUnitId);

        if (!targetSheet) {
            this._messageService.show({
                content: this._localeService.t('hyperLink.message.noSheet'),
                type: MessageType.Error,
            });
            return false;
        }

        if (workbook.getHiddenWorksheets().indexOf(subUnitId) > -1) {
            this._messageService.show({
                content: this._localeService.t('hyperLink.message.hiddenSheet'),
                type: MessageType.Error,
            });
            return false;
        }

        if (await this._commandService.executeCommand(SetWorksheetActiveOperation.id, { unitId, subUnitId })) {
            return targetSheet;
        }
        return false;
    }

    async navigateToDefineName(unitId: string, rangeid: string) {
        this._definedNamesService.focusRange(unitId, rangeid);
        return true;
    }

    async navigateToOtherWebsite(url: string) {
        const config = this._configService.getConfig<IUniverSheetsHyperLinkUIConfig>(PLUGIN_CONFIG_KEY);

        if (config?.urlHandler?.navigateToOtherWebsite) {
            return config.urlHandler.navigateToOtherWebsite(url);
        }

        window.open(url, '_blank', 'noopener noreferrer');
    }
}
