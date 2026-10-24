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

import type { IDisposable, IMutationInfo, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { IDiscreteRange } from '@univerjs/sheets';
import type { IRemoveSheetDrawingCommandParams, ISheetDrawing, ISheetImage } from '@univerjs/sheets-drawing';
import type { IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import {
    CustomCommandExecutionError,
    DrawingTypeEnum,
    generateRandomId,
    ICommandService,
    ImageSourceType,
    Inject,
    IUniverInstanceService,
    RxDisposable,
    SheetTypes,
    toDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { createDrawingCopyPlan, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    attachRangeWithCoord,
    discreteRangeToRange,
    SheetPermissionCheckController,
    SheetSkeletonService,
    WorkbookCopyPermission,
    WorksheetCopyPermission,
} from '@univerjs/sheets';
import {
    applySheetDrawingPlacement,
    DrawingApplyType,
    ISheetDrawingService,
    RemoveSheetDrawingCommand,
    SetDrawingApplyMutation,
    SheetDrawingAnchorType,
    transformToAxisAlignPosition,
    transformToDrawingPosition,
} from '@univerjs/sheets-drawing';
import {
    COPY_TYPE,
    ISheetClipboardService,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetPasteCommand,
    virtualizeDiscreteRanges,
} from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { takeUntil, timer } from 'rxjs';
import { InsertFloatImageCommand } from '../commands/commands/insert-image.command';

const IMAGE_PNG_MIME_TYPE = 'image/png';

function base64ToBlob(base64: string) {
    const arr = base64.split(',');
    const binStr = atob(arr[1]);
    const len = binStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
    }

    return new Blob([bytes], { type: IMAGE_PNG_MIME_TYPE });
}

function copyBase64ToClipboard(base64: string) {
    const item = new ClipboardItem({ [IMAGE_PNG_MIME_TYPE]: base64ToBlob(base64) });
    navigator.clipboard.write([item]).catch((err) => {
        console.error('Could not copy image using clipboard API: ', err);
    });
}

function focusDocument() {
    function createInputElement() {
        const input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.height = '1px';
        input.style.width = '1px';
        input.style.opacity = '0';

        return input;
    }

    const activeElement = document.activeElement;
    const input = createInputElement();
    document.body.appendChild(input);
    input.focus();

    return () => {
        input.blur();
        document.body.removeChild(input);
        if (activeElement instanceof HTMLElement) {
            activeElement.focus();
        }
    };
}

const specialPastes: IPasteHookValueType[] = [
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA,
];

interface IDrawingClipboardFeatureCopyParams {
    fromUnitId: string;
    fromSubUnitId: string;
    toUnitId: string;
    toSubUnitId: string;
    rootDrawingId: string;
    idMap: ReadonlyMap<string, string>;
    originals: readonly ISheetDrawing[];
    /** Feature owners may adapt their own binding data before Drawing mutations are prepared. */
    copies: ISheetDrawing[];
}

/** COPY planning only. null rejects the whole paste; callbacks never mutate live models. */
type DrawingClipboardFeatureCopyHook = (params: IDrawingClipboardFeatureCopyParams) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
} | null;

export class SheetsDrawingCopyPasteController extends RxDisposable {
    private readonly _featureCopyHooks = new Map<DrawingTypeEnum, DrawingClipboardFeatureCopyHook>();
    private _multipleFocusedCopy = false;
    private _chartCopyInfo: { unitId: string; subUnitId: string; rootDrawingId: string; drawings: ISheetDrawing[] } | null = null;

    public registerFeatureCopyHook(drawingType: DrawingTypeEnum, hook: DrawingClipboardFeatureCopyHook): IDisposable {
        if (this._featureCopyHooks.has(drawingType)) {
            throw new Error(`Drawing clipboard copy hook already registered for ${drawingType}`);
        }
        this._featureCopyHooks.set(drawingType, hook);
        return toDisposable(() => {
            if (this._featureCopyHooks.get(drawingType) === hook) {
                this._featureCopyHooks.delete(drawingType);
            }
        });
    }

    override dispose(): void {
        this._featureCopyHooks.clear();
        this._chartCopyInfo = null;
        this._multipleFocusedCopy = false;
        this._copyInfo = null;
        super.dispose();
    }

    private _copyInfo: Nullable<{
        drawings: ISheetDrawing[];
        copyRange?: IRange;
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @IDrawingManagerService private readonly _drawingService: IDrawingManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @ISheetDrawingService private readonly _sheetDrawings: ISheetDrawingService,
        @Inject(SheetPermissionCheckController) private readonly _permissions: SheetPermissionCheckController
    ) {
        super();
        this._initCopyPaste();
    }

    private get _focusedDrawings() {
        return this._drawingService.getFocusDrawings() as ISheetDrawing[];
    }

    private _initCopyPaste() {
        this.disposeWithMe(this._sheetClipboardService.addClipboardHook({
            id: 'SHEET_IMAGE_UI_PLUGIN',

            onBeforeCopyFocusedObject: (unitId, subUnitId, copyType) => {
                this._copyInfo = null;
                this._chartCopyInfo = null;
                this._multipleFocusedCopy = false;
                const focused = this._focusedDrawings;
                if (focused.length > 1) {
                    const sheet = this._instanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
                        ?.getSheetBySheetId(subUnitId);
                    const current = this._sheetDrawings.getDrawingData(unitId, subUnitId);
                    const managed = this._drawingService.getDrawingData(unitId, subUnitId) as Record<string, ISheetDrawing>;
                    const needsParentGraph = focused.some((drawing) => drawing.chartParent
                        || Object.values(current).some((child) => child.chartParent?.drawingId === drawing.drawingId)
                        || Object.values(managed).some((child) => child.chartParent?.drawingId === drawing.drawingId));
                    if (sheet?.getConfig().type === SheetTypes.CHART || needsParentGraph) {
                        throw new CustomCommandExecutionError(SheetPasteCommand.id);
                    }
                }
                this._multipleFocusedCopy = copyType === COPY_TYPE.COPY && focused.length > 1;
                if (copyType === COPY_TYPE.COPY && focused.length === 1
                    && focused[0].drawingType === DrawingTypeEnum.DRAWING_CHART && !focused[0].groupId
                    && this._featureCopyHooks.has(DrawingTypeEnum.DRAWING_CHART)) {
                    const root = focused[0];
                    if (root.unitId !== unitId || root.subUnitId !== subUnitId) {
                        throw new CustomCommandExecutionError(SheetPasteCommand.id);
                    }
                    this._chartCopyInfo = {
                        unitId,
                        subUnitId,
                        rootDrawingId: root.drawingId,
                        drawings: Tools.deepClone(this._collectChartSubtree(unitId, subUnitId, root.drawingId)),
                    };
                    return true;
                }

                const drawings = this._focusedDrawings.filter((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE);
                if (drawings.length === 0) {
                    return false;
                }

                const [drawing] = drawings;

                if (copyType === COPY_TYPE.CUT) {
                    const params: IRemoveSheetDrawingCommandParams = {
                        unitId,
                        drawings,
                    };
                    // Delete the drawing when it is cut
                    this._commandService.executeCommand<IRemoveSheetDrawingCommandParams>(RemoveSheetDrawingCommand.id, params);
                }

                timer(200).pipe(takeUntil(this.dispose$)).subscribe(() => {
                    // Rewrite the clipboard content to prevent the default copy behavior, prevent to call the 'onPasteCells'
                    const dispose = focusDocument();
                    if (drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE
                        && (drawing as ISheetImage).imageSourceType === ImageSourceType.BASE64) {
                        copyBase64ToClipboard((drawing as ISheetImage).source);
                    } else {
                        this._clipboardInterfaceService.writeText('');
                    }
                    dispose();
                });

                this._copyInfo = {
                    unitId: drawing.unitId,
                    subUnitId: drawing.subUnitId,
                    drawings,
                };
                return true;
            },

            onBeforeCopy: (unitId, subUnitId, range) => {
                this._chartCopyInfo = null;
                this._multipleFocusedCopy = false;
                this._copyInfo = this._createDrawingsCopyInfoByRange(unitId, subUnitId, range);
            },

            onPasteCells: (pasteFrom, pasteTo, _data, payload) => {
                if (!payload.copyId) {
                    this._chartCopyInfo = null;
                    this._multipleFocusedCopy = false;
                    this._copyInfo = null;
                    return { redos: [], undos: [] };
                }

                if (pasteFrom && this._multipleFocusedCopy
                    && this._instanceService.getUnit<Workbook>(pasteTo.unitId, UniverInstanceType.UNIVER_SHEET)
                        ?.getSheetBySheetId(pasteTo.subUnitId)
                        ?.getConfig()
                        .type === SheetTypes.CHART) {
                    throw new CustomCommandExecutionError(SheetPasteCommand.id);
                }

                if (pasteFrom && this._chartCopyInfo) {
                    if (payload.copyType !== COPY_TYPE.COPY || payload.pasteType !== PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE
                        || pasteFrom.unitId !== this._chartCopyInfo.unitId || pasteFrom.subUnitId !== this._chartCopyInfo.subUnitId) {
                        throw new CustomCommandExecutionError(SheetPasteCommand.id);
                    }
                    return this._generateChartSubtreeCopy(pasteTo);
                }

                if (!pasteFrom || !this._copyInfo) {
                    return { redos: [], undos: [] };
                }

                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange, unitId: fromUnitId, subUnitId: fromSubUnitId } = pasteFrom;
                const { range: pasteRange, unitId: toUnitId, subUnitId: toSubUnitId } = pasteTo;

                const mutations = this._copyInfo.copyRange
                    ? this._generateRangeDrawingsPasteMutations(
                        { unitId: toUnitId, subUnitId: toSubUnitId, pasteRange, pasteType },
                        { unitId: fromUnitId, subUnitId: fromSubUnitId, copyType, copyRange }
                    )
                    : this._generateSingleDrawingPasteMutations({ pasteTo, pasteType }, COPY_TYPE.COPY);

                return mutations;
            },

            onPastePlainText: (_pasteTo: ISheetDiscreteRangeLocation, _clipText: string) => {
                this._chartCopyInfo = null;
                this._multipleFocusedCopy = false;
                this._copyInfo = null;
                return { undos: [], redos: [] };
            },

            onPasteUnrecognized: (pasteTo: ISheetDiscreteRangeLocation) => {
                this._chartCopyInfo = null;
                this._multipleFocusedCopy = false;
                if (!this._copyInfo || this._copyInfo.copyRange) {
                    return { undos: [], redos: [] };
                }

                const mutations = this._generateSingleDrawingPasteMutations({ pasteTo, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }, COPY_TYPE.COPY);
                this._copyInfo = null;
                return mutations;
            },

            onPasteFiles: (pasteTo: ISheetDiscreteRangeLocation, files) => {
                this._chartCopyInfo = null;
                this._multipleFocusedCopy = false;
                if (this._copyInfo && !this._copyInfo.copyRange) {
                    const mutations = this._generateSingleDrawingPasteMutations({ pasteTo, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }, COPY_TYPE.COPY);
                    this._copyInfo = null;
                    return mutations;
                }

                const images = files.filter((file) => file.type.includes('image'));
                if (images.length) {
                    this._copyInfo = null;
                    return {
                        undos: [],
                        redos: [
                            {
                                id: InsertFloatImageCommand.id,
                                params: { files: images },
                            },
                        ],
                    };
                }

                return { undos: [], redos: [] };
            },
        }));
    }

    private _collectChartSubtree(unitId: string, subUnitId: string, rootDrawingId: string): ISheetDrawing[] {
        const current = this._sheetDrawings.getDrawingData(unitId, subUnitId);
        const managed = this._drawingService.getDrawingData(unitId, subUnitId) as Record<string, ISheetDrawing>;
        const result: ISheetDrawing[] = [];
        const visited = new Set<string>();
        const ancestors = new Set<string>();
        let ancestorId: string | undefined = rootDrawingId;
        while (ancestorId) {
            const ancestor: ISheetDrawing | undefined = current[ancestorId];
            if (!ancestor || ancestors.has(ancestorId) || !Tools.diffValue(ancestor, managed[ancestorId])
                || ancestor.unitId !== unitId || ancestor.subUnitId !== subUnitId
                || ancestor.drawingType !== DrawingTypeEnum.DRAWING_CHART
                || (ancestor.chartParent && typeof ancestor.chartParent.resizeWithParent !== 'boolean')) {
                throw new CustomCommandExecutionError(SheetPasteCommand.id);
            }
            ancestors.add(ancestorId);
            ancestorId = ancestor.chartParent?.drawingId;
        }
        const visit = (id: string) => {
            const drawing = current[id];
            if (!drawing || visited.has(id) || drawing.groupId || !Tools.diffValue(drawing, managed[id])
                || drawing.unitId !== unitId || drawing.subUnitId !== subUnitId
                || ![DrawingTypeEnum.DRAWING_CHART, DrawingTypeEnum.DRAWING_SHAPE, DrawingTypeEnum.DRAWING_IMAGE].includes(drawing.drawingType)
                || (drawing.chartParent && (current[drawing.chartParent.drawingId]?.drawingType !== DrawingTypeEnum.DRAWING_CHART
                    || typeof drawing.chartParent.resizeWithParent !== 'boolean'))) {
                throw new CustomCommandExecutionError(SheetPasteCommand.id);
            }
            const bounds = drawing.transform;
            if (!bounds || ![bounds.left, bounds.top, bounds.width, bounds.height]
                .every((value) => typeof value === 'number' && Number.isFinite(value)) || bounds.width! <= 0 || bounds.height! <= 0) {
                throw new CustomCommandExecutionError(SheetPasteCommand.id);
            }
            const children = Object.values(current).filter((candidate) => candidate.chartParent?.drawingId === id);
            const managedChildren = Object.values(managed).filter((candidate) => candidate.chartParent?.drawingId === id);
            if (children.length !== managedChildren.length
                || (children.length > 0 && drawing.drawingType !== DrawingTypeEnum.DRAWING_CHART)) {
                throw new CustomCommandExecutionError(SheetPasteCommand.id);
            }
            visited.add(id);
            result.push(drawing);
            children.forEach((child) => visit(child.drawingId));
        };
        visit(rootDrawingId);
        const order = this._sheetDrawings.getDrawingOrder(unitId, subUnitId).filter((id) => visited.has(id));
        if (order.length !== result.length || new Set(order).size !== result.length) {
            throw new CustomCommandExecutionError(SheetPasteCommand.id);
        }
        return order.map((id) => current[id]);
    }

    private _generateChartSubtreeCopy(pasteTo: ISheetDiscreteRangeLocation) {
        const info = this._chartCopyInfo!;
        const originals = this._collectChartSubtree(info.unitId, info.subUnitId, info.rootDrawingId);
        if (!Tools.diffValue(originals, info.drawings)) {
            throw new CustomCommandExecutionError(SheetPasteCommand.id);
        }
        const sourceSheet = this._instanceService.getUnit<Workbook>(info.unitId, UniverInstanceType.UNIVER_SHEET)
            ?.getSheetBySheetId(info.subUnitId);
        const targetSheet = this._instanceService.getUnit<Workbook>(pasteTo.unitId, UniverInstanceType.UNIVER_SHEET)
            ?.getSheetBySheetId(pasteTo.subUnitId);
        const sourceType = sourceSheet?.getConfig().type ?? SheetTypes.GRID;
        const targetType = targetSheet?.getConfig().type ?? SheetTypes.GRID;
        if (!sourceSheet || !targetSheet || ![SheetTypes.GRID, SheetTypes.CHART].includes(sourceType)
            || ![SheetTypes.GRID, SheetTypes.CHART].includes(targetType)
            || !this._permissions.permissionCheckWithoutRange({
                workbookTypes: [WorkbookCopyPermission],
                worksheetTypes: [WorksheetCopyPermission],
            }, info.unitId, info.subUnitId)) {
            throw new CustomCommandExecutionError(SheetPasteCommand.id);
        }
        this._permissions.assertWorksheetEditable(pasteTo.unitId, pasteTo.subUnitId);
        const root = originals.find((drawing) => drawing.drawingId === info.rootDrawingId)!;
        const skeleton = this._sheetSkeletonService.getSkeleton(pasteTo.unitId, pasteTo.subUnitId);
        const pasteRect = skeleton && attachRangeWithCoord(skeleton, discreteRangeToRange(pasteTo.range));
        if (targetType === SheetTypes.GRID && !pasteRect) {
            throw new CustomCommandExecutionError(SheetPasteCommand.id);
        }
        const deltaX = targetType === SheetTypes.GRID ? pasteRect!.startX - root.transform!.left! : 0;
        const deltaY = targetType === SheetTypes.GRID ? pasteRect!.startY - root.transform!.top! : 0;
        const plan = createDrawingCopyPlan(originals, {
            unitId: pasteTo.unitId,
            sourceSubUnitId: info.subUnitId,
            targetSubUnitId: pasteTo.subUnitId,
        });
        if (new Set(plan.idMap.values()).size !== originals.length || plan.drawings.some((drawing) =>
            this._sheetDrawings.getDrawingByParam(drawing) || this._drawingService.getDrawingByParam(drawing))) {
            throw new CustomCommandExecutionError(SheetPasteCommand.id);
        }
        const copies = plan.drawings.map((drawing) => {
            const parentId = drawing.chartParent && plan.idMap.get(drawing.chartParent.drawingId);
            if (parentId) {
                drawing.chartParent = { ...drawing.chartParent!, drawingId: parentId };
            } else {
                delete drawing.chartParent;
            }
            const bounds = drawing.transform!;
            const nextBounds = {
                left: bounds.left! + deltaX,
                top: bounds.top! + deltaY,
                width: bounds.width!,
                height: bounds.height!,
            };
            const original = originals.find((entry) => plan.idMap.get(entry.drawingId) === drawing.drawingId)!;
            const preserveGridPlacement = sourceType === SheetTypes.GRID && targetType === SheetTypes.GRID
                && !original.chartParent;
            const kind = preserveGridPlacement ? original.anchorType ?? SheetDrawingAnchorType.Position : SheetDrawingAnchorType.None;
            if (kind === SheetDrawingAnchorType.None) {
                return applySheetDrawingPlacement(drawing, { kind, ...nextBounds });
            }
            if (kind !== SheetDrawingAnchorType.Both && kind !== SheetDrawingAnchorType.Position) {
                throw new CustomCommandExecutionError(SheetPasteCommand.id);
            }
            const markers = transformToDrawingPosition(nextBounds, skeleton!);
            const placed = kind === SheetDrawingAnchorType.Both
                ? applySheetDrawingPlacement(drawing, { kind, from: markers.from, to: markers.to }, skeleton!)
                : applySheetDrawingPlacement(drawing, { kind, from: markers.from, width: nextBounds.width, height: nextBounds.height }, skeleton!);
            if (preserveGridPlacement && original.anchorType === undefined) {
                // Historical omission means Position; retain that persisted distinction when cloning it.
                delete placed.anchorType;
            }
            return placed;
        });
        const modelRedos: IMutationInfo[] = [];
        const modelUndos: IMutationInfo[] = [];
        const modelTypes = new Set(originals.filter((drawing) => drawing.drawingType !== DrawingTypeEnum.DRAWING_IMAGE)
            .map((drawing) => drawing.drawingType));
        for (const drawingType of modelTypes) {
            const hook = this._featureCopyHooks.get(drawingType);
            const modelPlan = hook?.({
                fromUnitId: info.unitId,
                fromSubUnitId: info.subUnitId,
                toUnitId: pasteTo.unitId,
                toSubUnitId: pasteTo.subUnitId,
                rootDrawingId: info.rootDrawingId,
                idMap: plan.idMap,
                originals,
                copies,
            });
            if (!modelPlan) {
                throw new CustomCommandExecutionError(SheetPasteCommand.id);
            }
            modelRedos.push(...modelPlan.redos);
            modelUndos.unshift(...modelPlan.undos);
        }
        // Only after every required model owner accepts do we ask Drawing to prepare its target batch.
        // Drawing batch-add inserts each item at the same index; reverse only its input to retain source stacking order.
        const { redo, undo, objects } = this._sheetDrawings.getBatchAddOp([...copies].reverse()) as IDrawingJsonUndo1;
        const { unitId, subUnitId } = pasteTo;
        return {
            redos: [{ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.INSERT } }, ...modelRedos],
            undos: [...modelUndos, { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.REMOVE } }],
        };
    }

    private _createDrawingsCopyInfoByRange(unitId: string, subUnitId: string, range: IRange) {
        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!skeleton) return;

        const selectionRect = attachRangeWithCoord(skeleton, range);
        if (!selectionRect) return;

        const { startX, endX, startY, endY } = selectionRect;
        const drawings = this._drawingService.getDrawingData(unitId, subUnitId);

        const containedDrawings: ISheetDrawing[] = [];

        Object.keys(drawings).forEach((drawingId) => {
            const drawing = drawings[drawingId];
            if (drawing.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                return;
            }
            const anchorType = (drawing as ISheetDrawing).anchorType ?? SheetDrawingAnchorType.Position;
            if (anchorType === SheetDrawingAnchorType.None) {
                return;
            }
            const { transform } = drawing;
            if (!transform) {
                return;
            }
            const { left = 0, top = 0, width = 0, height = 0 } = transform;
            const { drawingStartX, drawingEndX, drawingStartY, drawingEndY } = {
                drawingStartX: left,
                drawingEndX: left + width,
                drawingStartY: top,
                drawingEndY: top + height,
            };

            if (startX <= drawingStartX && drawingEndX <= endX && startY <= drawingStartY && drawingEndY <= endY) {
                containedDrawings.push(drawing as ISheetDrawing);
            }
        });

        if (containedDrawings.length) {
            return {
                copyRange: range,
                drawings: containedDrawings,
                unitId,
                subUnitId,
            };
        }
    }

    private _generateSingleDrawingPasteMutations(pasteContext: {
        pasteTo: ISheetDiscreteRangeLocation;
        pasteType: IPasteHookValueType;
    }, copyType: COPY_TYPE) {
        const { pasteType, pasteTo } = pasteContext;

        if (specialPastes.includes(pasteType)) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId, range } = pasteTo;
        const pasteToSkeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!pasteToSkeleton) {
            return { redos: [], undos: [] };
        }

        const copyInfo = this._copyInfo!;
        const { drawings } = copyInfo;
        const pasteRange = discreteRangeToRange(range);
        let drawingAnchor: { left: number; top: number } | undefined;
        if (drawings.length > 1) {
            let anchorLeft = Infinity;
            let anchorTop = Infinity;
            for (const drawing of drawings) {
                const { left = 0, top = 0 } = drawing.transform ?? {};
                anchorLeft = Math.min(anchorLeft, left);
                anchorTop = Math.min(anchorTop, top);
            }
            drawingAnchor = { left: anchorLeft, top: anchorTop };
        }

        return this._generateMutations(drawings, {
            unitId,
            subUnitId,
            isCut: copyType === COPY_TYPE.CUT,
            getTransform: (transform, sheetTransform) => {
                const pasteRect = attachRangeWithCoord(pasteToSkeleton, {
                    startRow: pasteRange.startRow,
                    endRow: pasteRange.endRow,
                    startColumn: pasteRange.startColumn,
                    endColumn: pasteRange.endColumn,
                });

                const newTransform = {
                    ...transform,
                    left: drawingAnchor && pasteRect
                        ? pasteRect.startX + (transform?.left ?? 0) - drawingAnchor.left
                        : pasteRect?.startX,
                    top: drawingAnchor && pasteRect
                        ? pasteRect.startY + (transform?.top ?? 0) - drawingAnchor.top
                        : pasteRect?.startY,
                };

                return {
                    transform: newTransform,
                    sheetTransform: transformToDrawingPosition(newTransform, pasteToSkeleton) ?? sheetTransform,
                    axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, pasteToSkeleton) ?? sheetTransform,
                };
            },
        });
    }

    private _generateMutations(drawings: ISheetDrawing[], payload: {
        unitId: string;
        subUnitId: string;
        getTransform: (transform: ISheetDrawing['transform'], sheetTransform: ISheetDrawing['sheetTransform']) => {
            transform: ISheetDrawing['transform'];
            sheetTransform: ISheetDrawing['sheetTransform'];
            axisAlignSheetTransform: ISheetDrawing['sheetTransform'];
        };
        isCut: boolean;
    }) {
        const {
            unitId,
            subUnitId,
            getTransform,
            isCut,
        } = payload;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const { _drawingService } = this;

        drawings.forEach((drawing) => {
            const { transform, sheetTransform } = drawing;
            if (!transform) {
                return;
            }
            const transformContext = getTransform(transform, sheetTransform);
            const drawingObject: Partial<ISheetDrawing> = {
                ...drawing,
                unitId,
                subUnitId,
                drawingId: isCut ? drawing.drawingId : generateRandomId(),
                transform: transformContext.transform,
                sheetTransform: transformContext.sheetTransform,
                axisAlignSheetTransform: transformContext.axisAlignSheetTransform,
            };

            if (isCut) {
                const { undo, redo, objects } = _drawingService.getBatchUpdateOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({
                    id: SetDrawingApplyMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        type: DrawingApplyType.UPDATE,
                        op: redo,
                        objects,
                    },
                });
                undos.push({
                    id: SetDrawingApplyMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        type: DrawingApplyType.UPDATE,
                        op: undo,
                        objects,
                    },
                });
            } else {
                const { undo, redo, objects } = _drawingService.getBatchAddOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({ id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.INSERT } });
                undos.push({ id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DrawingApplyType.REMOVE } });
            }
        });

        return { redos, undos };
    }

    private _generateRangeDrawingsPasteMutations(
        pasteContext: {
            unitId: string;
            subUnitId: string;
            pasteRange: IDiscreteRange;
            pasteType: IPasteHookValueType;
        },
        copyContext: {
            unitId?: string;
            subUnitId?: string;
            copyRange?: IDiscreteRange;
            copyType: COPY_TYPE;
        }
    ) {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }

        const { unitId: toUnitId, subUnitId: toSubUnitId, pasteRange, pasteType } = pasteContext;
        const { unitId: fromUnitId, subUnitId: fromSubUnitId, copyRange, copyType } = copyContext;

        if (specialPastes.includes(pasteType)) {
            return { redos: [], undos: [] };
        }

        const toSkeleton = this._sheetSkeletonService.getSkeleton(toUnitId, toSubUnitId);
        if (!toSkeleton) {
            return { redos: [], undos: [] };
        }

        const { drawings } = this._copyInfo;

        if (!copyRange) {
            return this._generateSingleDrawingPasteMutations({
                pasteTo: { unitId: toUnitId, subUnitId: toSubUnitId, range: discreteRangeToRange(pasteRange) as unknown as IDiscreteRange },
                pasteType,
            }, copyType);
        }

        const fromSkeleton = this._sheetSkeletonService.getSkeleton(fromUnitId!, fromSubUnitId!);
        if (!fromSkeleton) {
            return { redos: [], undos: [] };
        }

        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pasteRange]);
        const { row: copyRow, col: copyCol } = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
        const { row: pasteRow, col: pasteCol } = mapFunc(vPastedRange.startRow, vPastedRange.startColumn);

        const copyRect = attachRangeWithCoord(fromSkeleton, {
            startRow: copyRow,
            endRow: copyRow,
            startColumn: copyCol,
            endColumn: copyCol,
        });
        const pasteRect = attachRangeWithCoord(toSkeleton, {
            startRow: pasteRow,
            endRow: pasteRow,
            startColumn: pasteCol,
            endColumn: pasteCol,
        });

        if (!copyRect || !pasteRect) {
            return { redos: [], undos: [] };
        }

        const leftOffset = pasteRect.startX - copyRect.startX;
        const topOffset = pasteRect.startY - copyRect.startY;
        const rowOffset = pasteRow - copyRow;
        const columnOffset = pasteCol - copyCol;

        return this._generateMutations(drawings, {
            unitId: toUnitId,
            subUnitId: toSubUnitId,
            getTransform: (transform, sheetTransform) => {
                const newTransform = {
                    ...transform,
                    left: (transform?.left ?? 0) + leftOffset,
                    top: (transform?.top ?? 0) + topOffset,
                };

                return {
                    transform: newTransform,
                    sheetTransform: {
                        ...sheetTransform,
                        to: {
                            ...sheetTransform.to,
                            row: sheetTransform.to.row + rowOffset,
                            column: sheetTransform.to.column + columnOffset,
                        },
                        from: {
                            ...sheetTransform.from,
                            row: sheetTransform.from.row + rowOffset,
                            column: sheetTransform.from.column + columnOffset,
                        },
                    },
                    axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, toSkeleton) ?? sheetTransform,
                };
            },
            isCut: copyType === COPY_TYPE.CUT,
        });
    }
}
