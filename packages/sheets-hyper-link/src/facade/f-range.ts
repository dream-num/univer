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

import type { IAddHyperLinkCommandParams, ICancelHyperLinkCommandParams, IUpdateHyperLinkCommandParams } from '@univerjs/sheets-hyper-link';
import { CustomRangeType, DataStreamTreeTokenType, generateRandomId } from '@univerjs/core';
import { AddHyperLinkCommand, CancelHyperLinkCommand, SheetsHyperLinkParserService, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link';
import { FRange } from '@univerjs/sheets/facade';

export interface ICellHyperLink {
    id: string;
    row: number;
    column: number;
    url: string;
    label: string;
}

/**
 * @ignore
 */
export interface IFRangeSheetsHyperlinkMixin {
    /**
     * Set a hyperlink for this range top left cell.
     * The hyperlink can be a URL, a range link, or a sheet link.
     * When the hyperlink is a range link or a sheet link, the url should be the url of the target range or sheet.
     * @param {string} url - The hyperlink url, can be a URL, a range link, or a sheet link.
     * @param {string} [label] - The display text of the hyperlink. If not provided, the url will be used as the display text.
     * @return {Promise<boolean>} A promise that resolves to true if the hyperlink is set successfully, otherwise false.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Create a hyperlink to Univer on cell A1
     * const fRange = fWorksheet.getRange('A1');
     * await fRange.setHyperLink('https://univer.ai/', 'Univer');
     *
     * // Create a hyperlink to Sheet1 range B2:D4 on cell A2
     * const fRange2 = fWorksheet.getRange('A2');
     * const rangeUrl = fWorksheet.getRange('B2:D4').getUrl();
     * await fRange2.setHyperLink(rangeUrl, 'Link to B2:D4');
     *
     * // Create a hyperlink to another sheet range on cell A3
     * const anotherSheet = fWorkbook.getSheetByName('Another Sheet');
     * if (anotherSheet) {
     *   const anotherSheetUrl = anotherSheet.getUrl();
     *   const fRange3 = fWorksheet.getRange('A3');
     *   await fRange3.setHyperLink(anotherSheetUrl, 'Link to Another Sheet');
     * }
     *
     * // Create a hyperlink to a defined name on cell A4
     * const fRange4 = fWorksheet.getRange('A4');
     * const definedNameHyperlinkUrl = fWorkbook.getUrlOfDefineName('MyDefinedName');
     * await fRange4.setHyperLink(definedNameHyperlinkUrl, 'Link to MyDefinedName');
     * ```
     */
    setHyperLink(url: string, label?: string): Promise<boolean>;

    /**
     * Get all hyperlinks in this range.
     * @return {ICellHyperLink[]} An array of hyperlinks in this range.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * console.log(fWorksheet.getRange('A1:T100').getHyperLinks());
     * ```
     */
    getHyperLinks(): ICellHyperLink[];

    /**
     * Update the hyperlink of this range top left cell.
     * @param {string} url - The new hyperlink url, can be a URL, a range link, or a sheet link.
     * @param {string} [label] - The new display text of the hyperlink. If not provided, the url will be used as the display text.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Create a hyperlink to Univer on cell A1
     * const fRange = fWorksheet.getRange('A1');
     * await fRange.setHyperLink('https://univer.ai/', 'Univer');
     *
     * // Update hyperlink after 3 seconds
     * await new Promise((resolve) => setTimeout(resolve, 3000));
     *
     * const rangeUrl = fWorksheet.getRange('B2:D4').getUrl();
     * await fRange.updateHyperLink(rangeUrl, 'Link to B2:D4');
     * ```
     */
    updateHyperLink(url: string, label?: string): Promise<boolean>;

    /**
     * Cancel all hyperlinks in this range. If a hyperlink is provided, only cancel the specified hyperlink.
     * @param {ICellHyperLink} [hyperlink] - The hyperlink to be cancelled. If not provided, all hyperlinks in this range will be cancelled.
     * @return {boolean} True if the hyperlink(s) is cancelled successfully, otherwise false.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Cancel the hyperlink in cell A1
     * const fRange = fWorksheet.getRange('A1');
     * fRange.cancelHyperLink();
     *
     * // Cancel all hyperlinks in range A2:B4
     * const fRange2 = fWorksheet.getRange('A2:B4');
     * fRange2.cancelHyperLink();
     *
     * // Cancel a specific hyperlink in range A1:T100
     * const fRange3 = fWorksheet.getRange('A1:T100');
     * const hyperlinks = fRange3.getHyperLinks();
     * if (hyperlinks.length > 1) {
     *   fRange3.cancelHyperLink(hyperlinks[1]);
     * }
     * ```
     */
    cancelHyperLink(hyperlink?: ICellHyperLink): boolean;

    /**
     * Create a hyperlink url to this range
     * @returns {string} The hyperlink url of this range
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1');
     * const url = fRange.getUrl();
     * console.log(url);
     * ```
     */
    getUrl(): string;
}

export class FRangeSheetsHyperlinkMixin extends FRange implements IFRangeSheetsHyperlinkMixin {
    override setHyperLink(url: string, label?: string): Promise<boolean> {
        return this._commandService.executeCommand<IAddHyperLinkCommandParams>(AddHyperLinkCommand.id, {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            link: {
                id: generateRandomId(),
                row: this._range.startRow,
                column: this._range.startColumn,
                payload: url,
                display: label,
            },
        });
    }

    override getHyperLinks(): ICellHyperLink[] {
        const hyperlinks: ICellHyperLink[] = [];

        this.forEach((row, column, cell) => {
            if (!cell.p) {
                return;
            }

            const ranges = cell.p.body?.customRanges?.filter((range) => range.rangeType === CustomRangeType.HYPERLINK) ?? [];

            if (ranges.length > 0) {
                const dataStream = cell.p?.body?.dataStream;
                const { rangeId, properties, startIndex, endIndex } = ranges[0];
                const url = properties?.url ?? '';
                const label = dataStream?.slice(startIndex, endIndex + 1).replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '').replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, '') ?? '';

                hyperlinks.push({
                    id: `${rangeId}`,
                    row,
                    column,
                    url,
                    label,
                });
            }
        });

        return hyperlinks;
    }

    override updateHyperLink(url: string, label?: string): Promise<boolean> {
        const hyperlink = this.getHyperLinks().find((link) => link.row === this._range.startRow && link.column === this._range.startColumn);

        if (!hyperlink) {
            return Promise.reject(new Error('No hyperlink found in the top left cell of the range'));
        }

        const { id, row, column } = hyperlink;

        return this._commandService.executeCommand<IUpdateHyperLinkCommandParams>(UpdateHyperLinkCommand.id, {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            id,
            row,
            column,
            payload: {
                payload: url,
                display: label,
            },
        });
    }

    override cancelHyperLink(hyperlink?: ICellHyperLink): boolean {
        if (hyperlink) {
            const { id, row, column } = hyperlink;

            return this._commandService.syncExecuteCommand<ICancelHyperLinkCommandParams>(CancelHyperLinkCommand.id, {
                unitId: this.getUnitId(),
                subUnitId: this._worksheet.getSheetId(),
                id,
                row,
                column,
            });
        } else {
            const hyperlinks = this.getHyperLinks();

            if (hyperlinks.length === 0) {
                return true;
            }

            return hyperlinks.every((link) => {
                const { id, row, column } = link;

                return this._commandService.syncExecuteCommand<ICancelHyperLinkCommandParams>(CancelHyperLinkCommand.id, {
                    unitId: this.getUnitId(),
                    subUnitId: this._worksheet.getSheetId(),
                    id,
                    row,
                    column,
                });
            });
        }
    }

    override getUrl(): string {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        return parserService.buildHyperLink(this.getRange(), this.getSheetId());
    }
}

FRange.extend(FRangeSheetsHyperlinkMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetsHyperlinkMixin {}
}
