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

import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import { ICommandService, isValidRange, IUniverInstanceService, LocaleService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRangeWithSheet } from '@univerjs/engine-formula';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { NORMAL_SELECTION_PLUGIN_NAME, SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { ERROR_RANGE } from '@univerjs/sheets-hyper-link';
import { ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

interface ISheetUrlParams {
    gid?: string;
    range?: string;
    rangeid?: string;
}

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
        @Inject(LocaleService) private _localeService: LocaleService
    ) { }

    private _getURLName(params: ISheetUrlParams) {
        const { gid, range, rangeid } = params;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        const sheet = gid ? workbook.getSheetBySheetId(gid) : workbook.getActiveSheet();
        const sheetName = sheet?.getName() ?? '';

        if (range) {
            const rangeObj = deserializeRangeWithSheet(range).range;
            if (isValidRange(rangeObj) && range !== ERROR_RANGE) {
                return {
                    type: 'range',
                    name: serializeRangeWithSheet(sheetName, rangeObj),
                } as const;
            } else {
                return {
                    type: 'range-error',
                    name: this._localeService.t('hyperLink.message.refError'),
                } as const;
            }
        }

        if (rangeid) {
            const range = this._definedNamesService.getValueById(workbook.getUnitId(), rangeid);
            if (range) {
                return {
                    type: 'defineName',
                    name: range.formulaOrRefString,
                } as const;
            } else {
                return {
                    type: 'range-error',
                    name: this._localeService.t('hyperLink.message.refError'),
                } as const;
            }
        }

        if (gid) {
            const worksheet = workbook.getSheetBySheetId(gid);
            if (worksheet) {
                return {
                    type: 'sheet',
                    name: worksheet.getName(),
                } as const;
            } else {
                return {
                    type: 'sheet-error',
                    name: this._localeService.t('hyperLink.message.refError'),
                } as const;
            }
        }

        return null;
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

    parseHyperLink(urlStr: string) {
        if (urlStr?.startsWith('#')) {
            const search = new URLSearchParams(urlStr.slice(1));
            // range, gid, rangeid
            const searchObj: ISheetUrlParams = {
                gid: search.get('gid') ?? '',
                range: search.get('range') ?? '',
                rangeid: search.get('rangeid') ?? '',
            };
            const urlInfo = this._getURLName(searchObj);
            return {
                type: urlInfo?.type || 'link',
                name: urlInfo?.name || urlStr,
                url: urlStr,
                searchObj,
                handler: () => {
                    this.navigateTo(searchObj);
                },
            } as const;
        } else {
            return {
                type: 'outer',
                name: urlStr,
                url: urlStr,
                handler: () => {
                    this.navigateToOtherWebsite(urlStr);
                },
            } as const;
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
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
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
        window.open(url, '_blank', 'noopener noreferrer');
    }
}
