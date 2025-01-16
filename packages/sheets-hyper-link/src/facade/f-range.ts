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

import type { IAddHyperLinkCommandParams, ICancelHyperLinkCommandParams, IUpdateHyperLinkCommandParams } from '@univerjs/sheets-hyper-link';
import { CustomRangeType, DataStreamTreeTokenType, generateRandomId } from '@univerjs/core';
import { AddHyperLinkCommand, CancelHyperLinkCommand, SheetsHyperLinkParserService, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link';
import { FRange } from '@univerjs/sheets/facade';

export interface ICellHyperLink {
    id: string;
    startIndex: number;
    endIndex: number;
    url: string;
    label: string;
}

export interface IFRangeHyperlinkMixin {
    /**
     * @deprecated use `range.setRichTextValueForCell(univerAPI.newRichText().insertLink(label, url))` instead
     */
    setHyperLink(url: string, label?: string): Promise<boolean>;
    /**
     * @deprecated use `range.setRichTextValueForCell(range.getRichTextValue().getLinks())` instead
     */
    getHyperLinks(): ICellHyperLink[];
    /**
     * @deprecated use `range.setRichTextValueForCell(range.getRichTextValue().copy().updateLink(id, url))` instead
     */
    updateHyperLink(id: string, url: string, label?: string): Promise<boolean>;
    /**
     * @deprecated use `range.setRichTextValueForCell(range.getRichTextValue().copy().cancelLink(id))` instead
     */
    cancelHyperLink(id: string): boolean;

    /**
     * Get the url of this range.
     */
    getUrl(): string;
}

export class FRangeHyperlinkMixin extends FRange implements IFRangeHyperlinkMixin {
    // #region hyperlink

    override setHyperLink(url: string, label?: string): Promise<boolean> {
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
                id: `${range.rangeId}`,
                startIndex: range.startIndex,
                endIndex: range.endIndex,
                url: range.properties?.url ?? '',
                label: cellValue.p?.body?.dataStream.slice(range.startIndex, range.endIndex + 1).replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '').replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, '') ?? '',
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

    override cancelHyperLink(id: string): boolean {
        const params: ICancelHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this._range.startRow,
            column: this._range.startColumn,
            id,
        };

        return this._commandService.syncExecuteCommand(CancelHyperLinkCommand.id, params);
    }

    override getUrl(): string {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        return parserService.buildHyperLink(this.getUnitId(), this.getSheetId(), this.getRange());
    }

    // #endregion
}

FRange.extend(FRangeHyperlinkMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeHyperlinkMixin {}
}
