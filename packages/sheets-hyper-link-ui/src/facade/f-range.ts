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

import type { IAddHyperLinkCommandParams } from '../commands/commands/add-hyper-link.command';
import type { ICancelHyperLinkCommandParams } from '../commands/commands/remove-hyper-link.command';
import type { IUpdateHyperLinkCommandParams } from '../commands/commands/update-hyper-link.command';
import { CustomRangeType, generateRandomId } from '@univerjs/core';
import { FRange } from '@univerjs/sheets/facade';
import { AddHyperLinkCommand } from '../commands/commands/add-hyper-link.command';
import { CancelHyperLinkCommand } from '../commands/commands/remove-hyper-link.command';
import { UpdateHyperLinkCommand } from '../commands/commands/update-hyper-link.command';

// TODO@weird94: related methods should be moved from sheets-hyperlink-ui to sheets-hyperlink
export interface ICellHyperLink {
    id: string;
    startIndex: number;
    endIndex: number;
    url: string;
    label: string;
}

interface IFRangeHyperlinkMixin {
    /**
     * Get all hyperlinks in the cell in the range.
     * @returns hyperlinks
     */
    getHyperLinks(): ICellHyperLink[];
    /**
     * Update hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @param url url
     * @param label optional, label of the url
     * @returns success or not
     */
    updateHyperLink(id: string, url: string, label?: string): Promise<boolean>;
    /**
     * Cancel hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @returns success or not
     */
    cancelHyperLink(id: string): Promise<boolean>;
}

class FRangeHyperlinkMixin extends FRange implements IFRangeHyperlinkMixin {
    // #region hyperlink

    setHyperLink(url: string, label?: string): Promise<boolean> {
        const params: IAddHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            link: {
                row: this._range.startRow,
                column: this._range.startColumn,
                payload: url,
                display: label,
                id: generateRandomId(),
            },
        };

        return this._commandService.executeCommand(AddHyperLinkCommand.id, params);
    }

    override getHyperLinks(): ICellHyperLink[] {
        const cellValue = this._worksheet.getCellRaw(this._range.startRow, this._range.startColumn);
        if (!cellValue?.p) {
            return [];
        }

        return cellValue.p.body?.customRanges
            ?.filter((range) => range.rangeType === CustomRangeType.HYPERLINK)
            .map((range) => ({
                id: range.rangeId,
                startIndex: range.startIndex,
                endIndex: range.endIndex,
                url: range.properties?.url ?? '',
                label: cellValue.p?.body?.dataStream.slice(range.startIndex + 1, range.endIndex) ?? '',
            })) ?? [];
    }

    override updateHyperLink(id: string, url: string, label?: string): Promise<boolean> {
        const params: IUpdateHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this._range.startRow,
            column: this._range.startColumn,
            id,
            payload: {
                payload: url,
                display: label,
            },
        };

        return this._commandService.executeCommand(UpdateHyperLinkCommand.id, params);
    }

    /**
     * Cancel hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @returns success or not
     */
    override cancelHyperLink(id: string): Promise<boolean> {
        const params: ICancelHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this._range.startRow,
            column: this._range.startColumn,
            id,
        };

        return this._commandService.executeCommand(CancelHyperLinkCommand.id, params);
    }

    // #endregion
}

FRange.extend(FRangeHyperlinkMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeHyperlinkMixin {}
}
