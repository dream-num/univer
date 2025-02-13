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

import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import type { ISheetHyperLinkInfo, ISheetUrlParams } from '@univerjs/sheets-hyper-link';
import type { IUniverSheetsHyperLinkUIConfig } from '../controllers/config.schema';
import { ICommandService, IConfigService, Inject, isValidRange, IUniverInstanceService, LocaleService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { deserializeRangeWithSheet, IDefinedNamesService } from '@univerjs/engine-formula';
import { SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { ERROR_RANGE, SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import { SHEETS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';

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

    navigate(info: ISheetHyperLinkInfo): void {
        switch (info.type) {
            case SheetHyperLinkType.URL:
                this.navigateToOtherWebsite(info.url);
                break;
            default:
                this._navigateToUniver(info.searchObj!);
        }
    }

    private _navigateToUniver(params: ISheetUrlParams) {
        // NOTE: should we always use current unit and active worksheet?

        const { gid, range, rangeid } = params;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const unitId = workbook.getUnitId();
        if (rangeid) {
            const item = this._definedNamesService.getValueById(unitId, rangeid);
            if (!item) {
                return;
            }

            const { formulaOrRefString } = item;
            const worksheet = this._definedNamesService.getWorksheetByRef(unitId, formulaOrRefString);

            if (!worksheet) {
                this._messageService.show({
                    content: this._localeService.t('hyperLink.message.refError'),
                    type: MessageType.Error,
                });
                return;
            }

            const isHidden = worksheet.isSheetHidden();

            // The worksheet may be hidden
            if (isHidden) {
                this._messageService.show({
                    content: this._localeService.t('hyperLink.message.hiddenSheet'),
                    type: MessageType.Error,
                });
                return;
            }

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

    async navigateToRange(unitId: string, subUnitId: string, range: IRange, forceTop?: boolean) {
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
                        primary: null,
                    }],
                } as ISetSelectionsOperationParams
            );
            await this._commandService.executeCommand(ScrollToRangeOperation.id, {
                range: realRange,
                forceTop,
            });
        }
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

    async navigateToDefineName(unitId: string, rangeId: string) {
        this._definedNamesService.focusRange(unitId, rangeId);
        return true;
    }

    async navigateToOtherWebsite(url: string) {
        const config = this._configService.getConfig<IUniverSheetsHyperLinkUIConfig>(SHEETS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY);

        if (config?.urlHandler?.navigateToOtherWebsite) {
            return config.urlHandler.navigateToOtherWebsite(url);
        }

        window.open(url, '_blank', 'noopener noreferrer');
    }
}
