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

import { BooleanNumber, DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentDataModel, ICommandService, LocaleService, VerticalAlign, WrapStrategy } from '@univerjs/core';
import type { ICellCustomRender, ICellRenderContext, IDocumentData, ISelectionCellWithCoord, IStyleData, Nullable } from '@univerjs/core';
import { DeviceInputEventType, Documents, DocumentSkeleton, DocumentViewModel, Rect, type Spreadsheet, type SpreadsheetSkeleton, type UniverRenderingContext2D } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { IEditorBridgeService } from '@univerjs/sheets-ui/services/editor-bridge.service.js';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui/services/editor-bridge.service.js';
import { SetCellEditVisibleOperation } from '@univerjs/sheets-ui/commands/operations/cell-edit.operation.js';
import { getCellValueOrigin } from '../utils/getCellDataOrigin';
import type { ListValidator } from '../validators';

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

export interface IDropdownInfo {
    top: number;
    left: number;
    width: number;
    height: number;
}

export class DropdownWidget implements ICellCustomRender {
    private _dropdownInfoMap: Map<string, Map<string, IDropdownInfo>> = new Map();

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService
    ) { }

    private _ensureMap(subUnitId: string) {
        let map = this._dropdownInfoMap.get(subUnitId);

        if (!map) {
            map = new Map();
            this._dropdownInfoMap.set(subUnitId, map);
        }
        return map;
    }

    private _generateKey(row: number, col: number) {
        return `${row}.${col}`;
    }

    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderContext, skeleton: SpreadsheetSkeleton, spreadsheets: Spreadsheet): void {
        const { primaryWithCoord, row, col, style, data, subUnitId } = info;
        const validation = data.dataValidation;
        const cellWidth = primaryWithCoord.endX - primaryWithCoord.startX;
        const cellHeight = primaryWithCoord.endY - primaryWithCoord.startY;
        const map = this._ensureMap(subUnitId);
        const key = this._generateKey(row, col);

        if (!validation) {
            return;
        }
        const { rule, validator: _validator } = validation;
        const validator = _validator as ListValidator;

        const vt = style?.vt;
        const value = getCellValueOrigin(data);

        ctx.save();
        ctx.translateWithPrecision(primaryWithCoord.startX, primaryWithCoord.startY);
        ctx.beginPath();
        ctx.rect(0, 0, cellWidth, cellHeight);
        ctx.clip();

        const valueStr = `${value ?? ''}`;
        const realWidth = cellWidth - (MARGIN_H * 2) - PADDING_H - ICON_PLACE;
        const { documentSkeleton, documents, docModel } = createDocuments(valueStr, this._localeService, style);
        if (
            style?.tb === WrapStrategy.WRAP
        ) {
            docModel.updateDocumentDataPageSize(realWidth);
        }

        documentSkeleton.calculate();
        const textLayout = documentSkeleton.getActualSize();

        const {
            actualWidth: fontWidth,
            actualHeight: fontHeight,
        } = textLayout;

        let paddingTop = 0;
        switch (vt) {
            case VerticalAlign.BOTTOM:
                paddingTop = (cellHeight - MARGIN_V - fontHeight);
                break;
            case VerticalAlign.MIDDLE:
                paddingTop = (cellHeight - MARGIN_V - fontHeight) / 2;
                break;

            default:
                paddingTop = MARGIN_V;
                break;
        }

        ctx.translate(MARGIN_H, paddingTop);
        const rectWidth = cellWidth - MARGIN_H * 2;
        const rectHeight = fontHeight;
        Rect.drawWith(ctx, {
            width: rectWidth,
            height: rectHeight,
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
        ctx.restore();

        map.set(key, {
            left: primaryWithCoord.startX + MARGIN_H,
            top: primaryWithCoord.startY + paddingTop,
            width: rectWidth,
            height: rectWidth,
        });
    }

    isHit(position: { x: number; y: number }, info: ICellRenderContext) {
        // const { cellHeight, cellWidth, top, left } = this._calc(info.primaryWithCoord, info.style);
        const { data, subUnitId, row, col } = info;
        const map = this._ensureMap(subUnitId);
        const dropdownInfo = map.get(this._generateKey(row, col));
        const validation = data.dataValidation;
        if (!validation || !dropdownInfo) {
            return false;
        }
        const { top, left, width, height } = dropdownInfo;
        const { x, y } = position;

        if (x >= left && x <= left + width && y >= top && y <= top + height) {
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

        const params: IEditorBridgeServiceVisibleParam = {
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
        };

        this._commandService.executeCommand(
            SetCellEditVisibleOperation.id,
            params
        );
    };
}
