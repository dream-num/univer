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

import type { ICellRenderContext, IDocumentData, IPaddingData, IStyleData, Nullable } from '@univerjs/core';
import type { IBaseDataValidationWidget } from '@univerjs/data-validation';
import type { IMouseEvent, IPointerEvent, SpreadsheetSkeleton, UniverRenderingContext, UniverRenderingContext2D } from '@univerjs/engine-render';
import type { ListValidator } from '@univerjs/sheets-data-validation';
import type { IShowDataValidationDropdownParams } from '../../commands/operations/data-validation.operation';
import { BooleanNumber, DataValidationRenderMode, DataValidationType, DEFAULT_EMPTY_DOCUMENT_VALUE, DEFAULT_STYLES, DocumentDataModel, HorizontalAlign, ICommandService, Inject, IUniverInstanceService, LocaleService, Tools, UniverInstanceType, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { CURSOR_TYPE, Documents, DocumentSkeleton, DocumentViewModel, getCurrentTypeOfRenderer, getDocsSkeletonPageSize, IRenderManagerService, Rect } from '@univerjs/engine-render';
import { getCellValueOrigin, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { ShowDataValidationDropdown } from '../../commands/operations/data-validation.operation';
import { DROP_DOWN_DEFAULT_COLOR } from '../../const';

/**
 * padding in Capsule
 */
const PADDING_H = 4;
const ICON_SIZE = 4;
const ICON_PLACE = 14;

/**
 * margin for Capsule, that means distance between capsule and cell border
 */
const MARGIN_H = 6;
const MARGIN_V = 4;
const RADIUS_BG = 8;
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

function calcPadding(cellWidth: number, cellHeight: number, fontWidth: number, fontHeight: number, vt: VerticalAlign, ht: HorizontalAlign, margin = true) {
    let paddingTop = 0;
    const realMargin = margin ? MARGIN_V : 0;
    switch (vt) {
        case VerticalAlign.BOTTOM:
            paddingTop = cellHeight - fontHeight - realMargin;
            break;
        case VerticalAlign.MIDDLE:
            paddingTop = (cellHeight - fontHeight) / 2;
            break;
        default:
            paddingTop = realMargin;
            break;
    }
    paddingTop = Math.max(MARGIN_V, paddingTop);

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
    paddingLeft = Math.max(MARGIN_H, paddingLeft);

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
    private _dropdownInfoMap: Map<string, Map<string, IDropdownInfo>> = new Map();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel
    ) {
        // super
    }

    zIndex?: number | undefined;

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

    private _drawDownIcon(
        ctx: UniverRenderingContext2D,
        cellBounding: { startX: number; startY: number },
        cellWidth: number,
        cellHeight: number,
        fontHeight: number,
        vt: VerticalAlign,
        pd: IPaddingData
    ) {
        const { t = DEFAULT_STYLES.pd.t, b = DEFAULT_STYLES.pd.b } = pd;
        const left = cellWidth - ICON_PLACE;
        let top;
        switch (vt) {
            case VerticalAlign.MIDDLE:
                top = (cellHeight - ICON_SIZE) / 2;
                break;
            case VerticalAlign.BOTTOM:
                top = (cellHeight - b - fontHeight - MARGIN_V) + (fontHeight / 2 - ICON_SIZE / 2);
                break;
            default:
                top = t + MARGIN_V + (fontHeight / 2 - ICON_SIZE / 2);
                break;
        }
        ctx.save();
        ctx.translateWithPrecision(cellBounding.startX + left, cellBounding.startY + top);
        ctx.fillStyle = '#565656';
        ctx.fill(downPath);
        ctx.restore();
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderContext, skeleton: SpreadsheetSkeleton): void {
        const { primaryWithCoord, row, col, style, data, subUnitId } = info;
        const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
        const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
        if (!rule) {
            return;
        }
        const validator = this._dataValidationModel.getValidator(rule.type) as ListValidator;
        if (!validator) {
            return;
        }
        const fontRenderExtension = data?.fontRenderExtension;
        const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};

        if (!rule || !validator || !validator || validator.id.indexOf(DataValidationType.LIST) !== 0) {
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
        let { tb, vt, ht, pd } = style || {};
        tb = tb ?? WrapStrategy.WRAP;
        vt = vt ?? VerticalAlign.BOTTOM;
        ht = ht ?? DEFAULT_STYLES.ht;
        pd = pd ?? DEFAULT_STYLES.pd;

        if (rule.renderMode === DataValidationRenderMode.ARROW) {
            const { l = DEFAULT_STYLES.pd.l, t = DEFAULT_STYLES.pd.t, r = DEFAULT_STYLES.pd.r, b = DEFAULT_STYLES.pd.b } = pd;
            const realWidth = cellWidth - l - r - ICON_PLACE - 4;
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
            const { paddingTop, paddingLeft } = calcPadding(realWidth, cellHeight - t - b, fontWidth, fontHeight, vt, ht, true);

            this._drawDownIcon(ctx, cellBounding, cellWidth, cellHeight, fontHeight, vt, pd);
            ctx.save();
            ctx.translateWithPrecision(cellBounding.startX + l, cellBounding.startY + t);
            ctx.beginPath();
            ctx.rect(0, 0, cellWidth - l - r, cellHeight - t - b);
            ctx.clip();

            ctx.translateWithPrecision(0, paddingTop);
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
                left: cellBounding.endX + l + skeleton.rowHeaderWidth - ICON_PLACE,
                top: cellBounding.startY + t + skeleton.columnHeaderHeight,
                width: ICON_PLACE,
                height: cellHeight - t - b,
            });
        } else {
            ctx.save();
            ctx.translateWithPrecision(cellBounding.startX, cellBounding.startY);
            ctx.beginPath();
            ctx.rect(0, 0, cellWidth, cellHeight);
            ctx.clip();

            const realWidth = cellWidth - (MARGIN_H * 2) - PADDING_H - ICON_PLACE - 4;
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

            ctx.translateWithPrecision(MARGIN_H, paddingTop);
            const rectWidth = Math.max(cellWidth - MARGIN_H * 2, 1);
            const rectHeight = fontHeight;
            Rect.drawWith(ctx as UniverRenderingContext, {
                width: rectWidth,
                height: rectHeight,
                fill: activeItem?.color || DROP_DOWN_DEFAULT_COLOR,
                radius: RADIUS_BG,
            });
            ctx.save();
            ctx.translateWithPrecision(PADDING_H, 0);
            ctx.beginPath();
            ctx.rect(0, 0, realWidth, fontHeight);
            ctx.clip();
            ctx.translateWithPrecision(paddingLeft, 0);
            documents.render(ctx as UniverRenderingContext);
            ctx.restore();
            ctx.translateWithPrecision(realWidth + PADDING_H + 4, (fontHeight - ICON_SIZE) / 2);
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
        const { primaryWithCoord, style, data, row, col } = info;
        const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

        const fontRenderExtension = data?.fontRenderExtension;
        const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};

        const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
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

        let { tb, pd } = style || {};
        const { t = DEFAULT_STYLES.pd.t, b = DEFAULT_STYLES.pd.b } = (pd ?? {});
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

            return fontHeight + t + b + MARGIN_V * 2;
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

    calcCellAutoWidth(info: ICellRenderContext): number | undefined {
        const { primaryWithCoord, style, data, row, col } = info;
        const cellRange = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

        const fontRenderExtension = data?.fontRenderExtension;
        const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};

        const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
        if (!rule) {
            return;
        }

        if (rule.renderMode === DataValidationRenderMode.TEXT) {
            return;
        }

        const cellBounding = {
            startX: cellRange.startX + leftOffset,
            endX: cellRange.endX - rightOffset,
            startY: cellRange.startY + topOffset,
            endY: cellRange.endY - downOffset,
        };
        const cellWidth = cellBounding.endX - cellBounding.startX;
        const value = getCellValueOrigin(data);
        const valueStr = `${value ?? ''}`;

        let { tb, pd } = style || {};
        const { l = DEFAULT_STYLES.pd.l, r = DEFAULT_STYLES.pd.r } = (pd ?? {});
        tb = tb ?? WrapStrategy.WRAP;

        let paddingAll = MARGIN_H * 2 + ICON_PLACE;
        switch (rule.renderMode) {
            case DataValidationRenderMode.ARROW:
                paddingAll = ICON_PLACE + MARGIN_H * 2 + r + l;
                break;
            case DataValidationRenderMode.CUSTOM:
                // + 1 is must, or last character will be cut
                paddingAll = ICON_PLACE + MARGIN_H * 2 + PADDING_H * 2 + r + l + RADIUS_BG / 2 + 1;
                break;
                // default is CUSTOM
            default:
                paddingAll = ICON_PLACE + MARGIN_H * 2 + PADDING_H * 2 + r + l + RADIUS_BG / 2 + 1;
        }
        const widthForTextLayout = cellWidth - paddingAll;
        const { documentSkeleton, docModel } = createDocuments(valueStr, this._localeService, style);
        if (tb === WrapStrategy.WRAP) {
            docModel.updateDocumentDataPageSize(Math.max(widthForTextLayout, 1));
        }

        documentSkeleton.calculate();
        documentSkeleton.getActualSize();
        const textLayout = getDocsSkeletonPageSize(documentSkeleton)!;
        return textLayout.width + paddingAll;
    }

    isHit(position: { x: number; y: number }, info: ICellRenderContext) {
        const { subUnitId, row, col } = info;
        const map = this._ensureMap(subUnitId);
        const dropdownInfo = map.get(this._generateKey(row, col));
        const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
        if (!rule) {
            return false;
        }

        if (!dropdownInfo) {
            return false;
        }
        if (rule.renderMode === DataValidationRenderMode.TEXT) {
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

    onPointerEnter(info: ICellRenderContext, evt: IPointerEvent | IMouseEvent) {
        getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService)
            ?.mainComponent
            ?.setCursor(CURSOR_TYPE.POINTER);
    }

    onPointerLeave(info: ICellRenderContext, evt: IPointerEvent | IMouseEvent) {
        getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService)
            ?.mainComponent
            ?.setCursor(CURSOR_TYPE.DEFAULT);
    }
}
