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

import { BooleanNumber, DataValidationRenderMode, DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentDataModel, HorizontalAlign, ICommandService, LocaleService, Tools, VerticalAlign, WrapStrategy } from '@univerjs/core';
import type { ICellRenderContext, IDocumentData, IPaddingData, IStyleData, Nullable } from '@univerjs/core';
import { Documents, DocumentSkeleton, DocumentViewModel, getDocsSkeletonPageSize, Rect } from '@univerjs/engine-render';
import type { IMouseEvent, IPointerEvent, ISheetFontRenderExtension, SpreadsheetSkeleton, UniverRenderingContext, UniverRenderingContext2D } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import type { IBaseDataValidationWidget } from '@univerjs/data-validation';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';
import { type IShowDataValidationDropdownParams, ShowDataValidationDropdown } from '../commands/operations/data-validation.operation';
import { DROP_DOWN_DEFAULT_COLOR } from '../common/const';
import type { ListValidator } from '../validators';

const PADDING_H = 4;
const ICON_SIZE = 6;
const ICON_PLACE = 14;
const MARGIN_H = 6;
const MARGIN_V = 2;
const DROP_DOWN_ICON_COLOR = '#565656';

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
                        cl: undefined,
                        ...style,
                        bg: undefined,
                        bd: undefined,
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

function createDocSkeleton(text: string, localeService: LocaleService, style?: Nullable<IStyleData>) {
    const documentData = convertToDocumentData(text, style);

    const docModel = new DocumentDataModel(documentData);
    const docViewModel = new DocumentViewModel(docModel);

    const documentSkeleton = DocumentSkeleton.create(docViewModel, localeService);

    return {
        documentSkeleton,
        docModel,
        docViewModel,
    };
}

function createDocuments(text: string, localeService: LocaleService, style?: Nullable<IStyleData>) {
    const {
        documentSkeleton,
        docModel,
        docViewModel,
    } = createDocSkeleton(text, localeService, style);

    const documents = new Documents(`DOCUMENTS_${Tools.generateRandomId()}`, documentSkeleton, {
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

function calcPadding(cellWidth: number, cellHeight: number, fontWidth: number, fontHeight: number, vt: VerticalAlign, ht: HorizontalAlign) {
    let paddingTop = 0;
    switch (vt) {
        case VerticalAlign.BOTTOM:
            paddingTop = (cellHeight - (MARGIN_V * 2) - fontHeight) + MARGIN_V;
            break;
        case VerticalAlign.MIDDLE:
            paddingTop = ((cellHeight - (MARGIN_V * 2) - fontHeight) / 2) + MARGIN_V;
            break;

        default:
            paddingTop = MARGIN_V;
            break;
    }

    let paddingLeft = 0;
    switch (ht) {
        case HorizontalAlign.CENTER:
            paddingLeft = (cellWidth - fontWidth) / 2;
            break;
        case HorizontalAlign.RIGHT:
            paddingLeft = (cellWidth - fontWidth);
            break;

        default:
            break;
    }

    return {
        paddingLeft,
        paddingTop,
    };
}

export interface IDropdownInfo {
    top: number;
    left: number;
    width: number;
    height: number;
}

export class DropdownWidget implements IBaseDataValidationWidget {
    static padding: IPaddingData = {
        l: MARGIN_H + PADDING_H,
        r: ICON_PLACE + MARGIN_H,
        t: MARGIN_V,
        b: MARGIN_V,
    };

    private _dropdownInfoMap: Map<string, Map<string, IDropdownInfo>> = new Map();

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        // super
    }

    zIndex?: number | undefined;
    onPointerEnter?: ((info: ICellRenderContext) => void) | undefined;
    onPointerLeave?: ((info: ICellRenderContext) => void) | undefined;

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

    private _drawDownIcon(ctx: UniverRenderingContext2D, cellBounding: { startX: number; startY: number }, cellWidth: number, cellHeight: number, vt: VerticalAlign) {
        const left = cellWidth - ICON_PLACE + 4;
        let top = 4;

        switch (vt) {
            case VerticalAlign.MIDDLE:
                top = (cellHeight - ICON_PLACE) / 2 + 4;
                break;
            case VerticalAlign.BOTTOM:
                top = (cellHeight - ICON_PLACE) + 4;
                break;
            default:
                break;
        }

        ctx.save();
        ctx.translateWithPrecision(cellBounding.startX + left, cellBounding.startY + top);
        ctx.fillStyle = '#565656';
        ctx.fill(downPath);
        ctx.restore();
    }

    // eslint-disable-next-line max-lines-per-function
    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderContext, skeleton: SpreadsheetSkeleton): void {
        const { primaryWithCoord, row, col, style, data, subUnitId } = info;
        const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
        const rule = data.dataValidation?.rule;
        const validator = data.dataValidation?.validator as ListValidator;
        // @ts-ignore
        const fontRenderExtension = data.fontRenderExtension as ISheetFontRenderExtension['fontRenderExtension'];
        const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};

        if (!rule || !validator) {
            return;
        }

        if (!validator.skipDefaultFontRender(rule)) {
            return;
        }

        const cellBounding = {
            startX: _cellBounding.startX + leftOffset,
            endX: _cellBounding.endX - rightOffset,
            startY: _cellBounding.startY + topOffset,
            endY: _cellBounding.endY - downOffset,

        };
        const cellWidth = cellBounding.endX - cellBounding.startX;
        const cellHeight = cellBounding.endY - cellBounding.startY;
        const map = this._ensureMap(subUnitId);
        const key = this._generateKey(row, col);

        const list = validator.getListWithColor(rule);
        const value = getCellValueOrigin(data);
        const valueStr = `${value ?? ''}`;
        const activeItem = list.find((i) => i.label === valueStr);
        let { tb, vt, ht } = style || {};
        tb = tb ?? WrapStrategy.WRAP;
        vt = vt ?? VerticalAlign.BOTTOM;
        ht = ht ?? HorizontalAlign.LEFT;
        if (rule.renderMode === DataValidationRenderMode.ARROW) {
            this._drawDownIcon(ctx, cellBounding, cellWidth, cellHeight, vt);
            ctx.save();
            ctx.translateWithPrecision(cellBounding.startX, cellBounding.startY);
            ctx.beginPath();
            ctx.rect(0, 0, cellWidth, cellHeight);
            ctx.clip();

            const realWidth = cellWidth - ICON_PLACE;
            const { documentSkeleton, documents, docModel } = createDocuments(valueStr, this._localeService, style);

            if (
                tb === WrapStrategy.WRAP
            ) {
                docModel.updateDocumentDataPageSize(Math.max(realWidth, 1));
            }

            documentSkeleton.calculate();
            documentSkeleton.getActualSize();
            const textLayout = getDocsSkeletonPageSize(documentSkeleton)!;

            const { height: fontHeight, width: fontWidth } = textLayout;
            const { paddingTop, paddingLeft } = calcPadding(realWidth, cellHeight, fontWidth, fontHeight, vt, ht);

            ctx.translate(0, paddingTop);
            ctx.save();
            ctx.translateWithPrecision(PADDING_H, 0);
            ctx.beginPath();
            ctx.rect(0, 0, realWidth, fontHeight);
            ctx.clip();
            documents.render(ctx as UniverRenderingContext);
            ctx.translateWithPrecision(paddingLeft, 0);
            ctx.restore();

            ctx.restore();

            map.set(key, {
                left: cellBounding.endX + skeleton.rowHeaderWidth - ICON_PLACE,
                top: cellBounding.startY + skeleton.columnHeaderHeight,
                width: ICON_PLACE,
                height: cellHeight,
            });
        } else {
            ctx.save();
            ctx.translateWithPrecision(cellBounding.startX, cellBounding.startY);
            ctx.beginPath();
            ctx.rect(0, 0, cellWidth, cellHeight);
            ctx.clip();

            const realWidth = cellWidth - (MARGIN_H * 2) - PADDING_H - ICON_PLACE;
            const { documentSkeleton, documents, docModel } = createDocuments(valueStr, this._localeService, style);
            if (
                tb === WrapStrategy.WRAP
            ) {
                docModel.updateDocumentDataPageSize(Math.max(realWidth, 1));
            }
            documentSkeleton.calculate();
            const textLayout = getDocsSkeletonPageSize(documentSkeleton)!;
            const { height: fontHeight, width: fontWidth } = textLayout;
            const { paddingTop, paddingLeft } = calcPadding(realWidth, cellHeight, fontWidth, fontHeight, vt, ht);

            ctx.translate(MARGIN_H, paddingTop);
            const rectWidth = Math.max(cellWidth - MARGIN_H * 2, 1);
            const rectHeight = fontHeight;
            Rect.drawWith(ctx as UniverRenderingContext, {
                width: rectWidth,
                height: rectHeight,
                fill: activeItem?.color || DROP_DOWN_DEFAULT_COLOR,
                radius: 8,
            });
            ctx.save();
            ctx.translateWithPrecision(PADDING_H, 0);
            ctx.beginPath();
            ctx.rect(0, 0, realWidth, fontHeight);
            ctx.clip();
            ctx.translateWithPrecision(paddingLeft, 0);
            documents.render(ctx as UniverRenderingContext);
            ctx.restore();
            ctx.translate(realWidth + PADDING_H + 4, (fontHeight - ICON_SIZE) / 2);
            ctx.fillStyle = DROP_DOWN_ICON_COLOR;
            ctx.fill(downPath);
            ctx.restore();

            map.set(key, {
                left: cellBounding.startX + MARGIN_H + skeleton.rowHeaderWidth,
                top: cellBounding.startY + paddingTop + skeleton.columnHeaderHeight,
                width: rectWidth,
                height: rectHeight,
            });
        }
    }

    calcCellAutoHeight(info: ICellRenderContext): number | undefined {
        const { primaryWithCoord, style, data } = info;
        const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

        // @ts-ignore
        const fontRenderExtension = data.fontRenderExtension as ISheetFontRenderExtension['fontRenderExtension'];
        const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};

        const rule = data.dataValidation?.rule;

        if (!rule) {
            return;
        }

        if (rule.renderMode === DataValidationRenderMode.TEXT) {
            return undefined;
        }

        const cellBounding = {
            startX: _cellBounding.startX + leftOffset,
            endX: _cellBounding.endX - rightOffset,
            startY: _cellBounding.startY + topOffset,
            endY: _cellBounding.endY - downOffset,

        };
        const cellWidth = cellBounding.endX - cellBounding.startX;
        const value = getCellValueOrigin(data);
        const valueStr = `${value ?? ''}`;

        let { tb } = style || {};

        tb = tb ?? WrapStrategy.WRAP;

        if (rule.renderMode === DataValidationRenderMode.ARROW) {
            const realWidth = cellWidth - ICON_PLACE;
            const { documentSkeleton, docModel } = createDocuments(valueStr, this._localeService, style);
            if (
                tb === WrapStrategy.WRAP
            ) {
                docModel.updateDocumentDataPageSize(Math.max(realWidth, 1));
            }

            documentSkeleton.calculate();
            documentSkeleton.getActualSize();
            const textLayout = getDocsSkeletonPageSize(documentSkeleton)!;

            const { height: fontHeight } = textLayout;

            return fontHeight;
        } else {
            const realWidth = cellWidth - (MARGIN_H * 2) - PADDING_H - ICON_PLACE;
            const { documentSkeleton, docModel } = createDocSkeleton(valueStr, this._localeService, style);
            if (
                tb === WrapStrategy.WRAP
            ) {
                docModel.updateDocumentDataPageSize(Math.max(realWidth, 1));
            }

            documentSkeleton.calculate();
            const textLayout = getDocsSkeletonPageSize(documentSkeleton)!;

            const {
                height: fontHeight,
            } = textLayout;

            return fontHeight + (MARGIN_V * 2);
        }
    }

    isHit(position: { x: number; y: number }, info: ICellRenderContext) {
        const { data, subUnitId, row, col } = info;
        const map = this._ensureMap(subUnitId);
        const dropdownInfo = map.get(this._generateKey(row, col));
        const validation = data.dataValidation;

        if (!validation || !dropdownInfo) {
            return false;
        }
        if (validation.rule.renderMode === DataValidationRenderMode.TEXT) {
            return false;
        }
        const { top, left, width, height } = dropdownInfo;
        const { x, y } = position;

        if (x >= left && (x <= (left + width)) && y >= top && (y <= (top + height))) {
            return true;
        }

        return false;
    };

    onPointerDown(info: ICellRenderContext, evt: IPointerEvent | IMouseEvent) {
        if (evt.button === 2) {
            return;
        }

        const { unitId, subUnitId, row, col } = info;

        const params: IShowDataValidationDropdownParams = {
            unitId: unitId!,
            subUnitId,
            row,
            column: col,
        };

        this._commandService.executeCommand(ShowDataValidationDropdown.id, params);
    };
}
