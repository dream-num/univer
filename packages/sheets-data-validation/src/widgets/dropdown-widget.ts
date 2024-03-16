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

import { BooleanNumber, CommandService, DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentDataModel, HorizontalAlign, ICommandService, LocaleService, VerticalAlign, WrapStrategy } from '@univerjs/core';
import type { ICellCustomRender, ICellRenderContext, IDocumentData, ISelectionCellWithCoord, IStyleData, Nullable } from '@univerjs/core';
import { DeviceInputEventType, Documents, DocumentSkeleton, DocumentViewModel, fixLineWidthByScale, IRenderManagerService, Rect, RichText, type Spreadsheet, type SpreadsheetSkeleton, Transform, type UniverRenderingContext2D } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { SetActivateCellEditOperation } from '@univerjs/sheets-ui/commands/operations/activate-cell-edit.operation.js';
import { SelectionManagerService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui/services/editor-bridge.service.js';
import type { type ICurrentEditCellParam, IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui/services/editor-bridge.service.js';
import { SetCellEditVisibleOperation } from '@univerjs/sheets-ui/commands/operations/cell-edit.operation.js';
import { getCellValueOrigin } from '../utils/getCellDataOrigin';
import type { ListValidator } from '../validators';

const PADDING_V = 1;
const PADDING_H = 4;
const ICON_SIZE = 6;
const ICON_PLACE = 14;
const MARGIN_H = 6;
const MARGIN_V = 2;

const downPath = new Path2D('M3.32201 4.84556C3.14417 5.05148 2.85583 5.05148 2.67799 4.84556L0.134292 1.90016C-0.152586 1.56798 0.0505937 1 0.456301 1L5.5437 1C5.94941 1 6.15259 1.56798 5.86571 1.90016L3.32201 4.84556Z');

function convertToDocumentData(text: string, style?: Nullable<IStyleData>) {
    const contentLength = text.length;
    const documentData: IDocumentData = {
        id: 'd',
        body: {
            dataStream: `${text}${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [
                {
                    ts: {
                        fs: 11,
                        ff: undefined,
                        it: BooleanNumber.FALSE,
                        bl: BooleanNumber.FALSE,
                        ul: {
                            s: BooleanNumber.FALSE,
                        },
                        st: {
                            s: BooleanNumber.FALSE,
                        },
                        ol: {
                            s: BooleanNumber.FALSE,
                        },
                        bg: undefined,
                        bd: undefined,
                        cl: undefined,
                        ...style,
                    },
                    st: 0,
                    ed: contentLength,
                },
            ],
        },
        documentStyle: {
            pageSize: {
                width: Number.POSITIVE_INFINITY,
                height: Number.POSITIVE_INFINITY,
            },
        },
    };

    return documentData;
}

function createDocuments(text: string, localeService: LocaleService, style?: Nullable<IStyleData>) {
    const documentData = convertToDocumentData(text, style);

    const docModel = new DocumentDataModel(documentData);
    const docViewModel = new DocumentViewModel(docModel);

    const documentSkeleton = DocumentSkeleton.create(docViewModel, localeService);

    const documents = new Documents('DOCUMENTS', documentSkeleton, {
        pageMarginLeft: 0,
        pageMarginTop: 0,
    });
    return {
        documents,
        documentSkeleton,
        docModel,
        docViewModel,
    };
}

export class DropdownWidget implements ICellCustomRender {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService
    ) {}

    private _calc(cellInfo: ISelectionCellWithCoord, style: Nullable<IStyleData>) {
        // const { vt, ht } = style || {};
        // const width = cellInfo.endX - cellInfo.startX;
        // const height = cellInfo.endY - cellInfo.startY;
        // const size = (style?.fs ?? 10) * 1.6;
        const widgetLeft = 0;
        const widgetTop = 0;
        // switch (vt) {
        //     case VerticalAlign.TOP:
        //         widgetTop = 0;
        //         break;
        //     case VerticalAlign.BOTTOM:
        //         widgetTop = 0 + (height - size);
        //         break;
        //     default:
        //         widgetTop = 0 + (height - size) / 2;
        //         break;
        // }

        // switch (ht) {
        //     case HorizontalAlign.LEFT:
        //         widgetLeft = 0;
        //         break;
        //     case HorizontalAlign.RIGHT:
        //         widgetLeft = 0 + (width - size);
        //         break;

        //     default:
        //         widgetLeft = 0 + (width - size) / 2;
        //         break;
        // }

        return {
            left: cellInfo.startX + widgetLeft,
            top: cellInfo.startY + widgetTop,
            cellWidth: cellInfo.endX - cellInfo.startX,
            cellHeight: cellInfo.endY - cellInfo.startY,
        };
    }

    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderContext, skeleton: SpreadsheetSkeleton, spreadsheets: Spreadsheet): void {
        const { primaryWithCoord, row, col, style, data } = info;
        const validation = data.dataValidation;
        const cellWidth = primaryWithCoord.endX - primaryWithCoord.startX;
        const cellHeight = primaryWithCoord.endY - primaryWithCoord.startY;

        if (!validation) {
            return;
        }
        const { rule, validator: _validator } = validation;
        const validator = _validator as ListValidator;

        const list = validator.getList(rule);
        const isMultiple = validator.isMultiple(rule);
        const value = isMultiple ? (`${getCellValueOrigin(data) ?? ''}`).split(',') : getCellValueOrigin(data);

        ctx.save();
        const layout = this._calc(primaryWithCoord, style);
        ctx.translateWithPrecision(layout.left, layout.top);
        ctx.beginPath();
        ctx.rect(0, 0, cellWidth, cellHeight);
        ctx.clip();

        if (!isMultiple) {
            const valueStr = `${value ?? ''}`;
            const realWidth = cellWidth - (MARGIN_H * 2) - PADDING_H - ICON_PLACE;
            const { documentSkeleton, documents, docModel } = createDocuments(valueStr, this._localeService, style);
            if (
                style?.tb === WrapStrategy.WRAP
            ) {
                docModel.updateDocumentDataPageSize(realWidth);
            }

            documentSkeleton.calculate();
            const layout = documentSkeleton.getActualSize();

            if (!layout) {
                return;
            }
            const {
                actualWidth: fontWidth,
                actualHeight: fontHeight,
            } = layout;

            ctx.translate(MARGIN_H, MARGIN_V);
            Rect.drawWith(ctx, {
                width: cellWidth - MARGIN_H * 2,
                height: fontHeight,
                fill: '#DCDCDC',
                radius: 8,
            });
            ctx.save();
            ctx.translateWithPrecision(PADDING_H, fontHeight);
            ctx.beginPath();
            ctx.rect(0, -fontHeight, realWidth, fontHeight);
            ctx.clip();
            documents.render(ctx);
            ctx.restore();

            ctx.translate(realWidth + PADDING_H + 4, (fontHeight - ICON_SIZE) / 2);
            ctx.fillStyle = '#565656';
            ctx.fill(downPath);
        }

        ctx.restore();
    }

    zIndex?: number | undefined;
    isHit(position: { x: number; y: number }, info: ICellRenderContext) {
        // const { cellHeight, cellWidth, top, left } = this._calc(info.primaryWithCoord, info.style);
        const { data } = info;
        const validation = data.dataValidation;
        if (!validation) {
            return false;
        }

        const { rule, validator: _validator } = validation;
        const validator = _validator as ListValidator;
        const isMultiple = validator.isMultiple(rule);
        if (!isMultiple) {
            return true;
        }
        return false;
    };

    onPointerDown(info: ICellRenderContext) {
        const { data } = info;
        const validation = data.dataValidation;
        if (!validation) {
            return false;
        }

        const { rule, validator: _validator } = validation;
        const validator = _validator as ListValidator;
        const isMultiple = validator.isMultiple(rule);
        if (!isMultiple) {
            const params: IEditorBridgeServiceVisibleParam = {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
            };

            this._commandService.executeCommand(
                SetCellEditVisibleOperation.id,
                params
            );
        }
    };
}
