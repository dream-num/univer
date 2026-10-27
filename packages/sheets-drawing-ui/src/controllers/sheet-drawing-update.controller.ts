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

import type {
    IAccessor,
    IDrawingParam,
    IImageIoServiceParam,
    IRange,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import type { IRender, IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetLocationBase, WorkbookSelectionModel } from '@univerjs/sheets';
import type {
    IInsertSheetDrawingCommandParams,
    ISetDrawingArrangeCommandParams,
    ISetDrawingCommandParams,
    ISheetDrawing,
    ISheetDrawingPosition,
} from '@univerjs/sheets-drawing';
import {
    BooleanNumber,
    BuildTextUtils,
    createDocumentModelWithStyle,
    Disposable,
    DrawingTypeEnum,
    FOCUSING_COMMON_DRAWINGS,
    generateRandomId,
    ICommandService,
    IContextService,
    IImageIoService,
    ILogService,
    ImageSourceType,
    ImageUploadStatusType,
    Inject,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    IURLImageService,
    LocaleService,
    PositionedObjectLayoutType,
    SheetTypes,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { buildDocTransform, docDrawingPositionToTransform } from '@univerjs/docs';
import {
    DRAWING_IMAGE_ALLOW_IMAGE_LIST,
    DRAWING_IMAGE_COUNT_LIMIT,
    DRAWING_IMAGE_HEIGHT_LIMIT,
    DRAWING_IMAGE_WIDTH_LIMIT,
    getDrawingImageAllowSize,
    getDrawingShapeKeyByDrawingSearch,
    getImageSize,
    IDrawingManagerService,
    SetDrawingSelectedOperation,
} from '@univerjs/drawing';
import { IRenderManagerService, Rect } from '@univerjs/engine-render';
import {
    attachRangeWithCoord,
    getSheetCommandTarget,
    SetRangeValuesCommand,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import {
    applySheetDrawingPlacement,
    drawingPositionToTransform,
    getSheetDrawingPlacement,
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    SetDrawingArrangeCommand,
    SetSheetDrawingCommand,
    SetWorksheetBackgroundImageCommand,
    SheetDrawingAnchorType,
    transformToAxisAlignPosition,
    transformToDrawingPosition,
} from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService, SHEET_VIEW_KEY, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';
import { getWorksheetBackgroundImageScale } from '../utils/worksheet-background-image';

/**
 * Calculate the bounding box after rotation
 * @param {number} width  Width
 * @param {number} height Height
 * @param {number} angleDegrees Rotation angle in degrees (0-360)
 * @returns {{ rotatedWidth: number; rotatedHeight: number }} Rotated width and height
 */
function rotatedBoundingBox(width: number, height: number, angleDegrees: number): { rotatedWidth: number; rotatedHeight: number } {
    const angle = angleDegrees * Math.PI / 180; // Convert angle to radians
    const rotatedWidth = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
    const rotatedHeight = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    return { rotatedWidth, rotatedHeight };
}

/**
 * Get the size of the drawing within the cell
 * @param {IAccessor} accessor Accessor
 * @param {ISheetLocationBase} location Cell location
 * @param {number} originImageWidth Original image width
 * @param {number} originImageHeight Original image height
 * @param {number} angle Rotation angle in degrees (0-360)
 * @returns {{ width: number; height: number }} Drawing size
 */
export function getDrawingSizeByCell(
    accessor: IAccessor,
    location: ISheetLocationBase,
    originImageWidth: number,
    originImageHeight: number,
    angle: number
) {
    const { rotatedHeight, rotatedWidth } = rotatedBoundingBox(originImageWidth, originImageHeight, angle);
    const renderManagerService = accessor.get(IRenderManagerService);
    const currentRender = renderManagerService.getRenderUnitById(location.unitId);
    if (!currentRender) {
        return false;
    }
    const skeletonManagerService = currentRender.with(SheetSkeletonManagerService);
    const skeleton = skeletonManagerService.getSkeletonParam(location.subUnitId)?.skeleton;
    if (skeleton == null) {
        return false;
    }
    const cellInfo = skeleton.getCellWithCoordByIndex(location.row, location.col);

    const cellWidth = cellInfo.mergeInfo.endX - cellInfo.mergeInfo.startX - 2;
    const cellHeight = cellInfo.mergeInfo.endY - cellInfo.mergeInfo.startY - 2;
    const imageRatio = rotatedWidth / rotatedHeight;
    const imageWidth = Math.ceil(Math.min(cellWidth, cellHeight * imageRatio));
    const scale = imageWidth / rotatedWidth;
    const realScale = !(scale) || Number.isNaN(scale) ? 0.001 : scale;

    return {
        width: originImageWidth * realScale,
        height: originImageHeight * realScale,
    };
}

interface IImageInsertionTarget {
    workbook: Workbook;
    worksheet: Worksheet;
    render: IRender;
    unitId: string;
    subUnitId: string;
    epoch: number;
    location?: ISheetLocationBase;
    explicit: boolean;
    pageFrame?: Rect;
}

export class SheetDrawingUpdateController extends Disposable implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelectionModel;
    private _imageInsertionEpoch = 0;
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @ILocalFileService private readonly _fileOpenerService: ILocalFileService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @Inject(Injector) private readonly _injector: Injector,
        @IURLImageService private readonly _urlImageService: IURLImageService
    ) {
        super();

        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);

        this.disposeWithMe(this._context.unit.activeSheet$.subscribe(() => {
            this._imageInsertionEpoch++;
        }));
        this.disposeWithMe(this._injector.get(IUniverInstanceService).getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
            this._imageInsertionEpoch++;
        }));
        this.disposeWithMe(this._injector.get(IUniverInstanceService).focused$.subscribe(() => {
            this._imageInsertionEpoch++;
        }));
        this.disposeWithMe(this._injector.get(IPermissionService).permissionPointUpdate$.subscribe((point) => {
            const workbookId = this._context.unitId;
            const sheetId = this._context.unit.getActiveSheet()?.getSheetId();
            if (point.value === false && (point.id === new WorkbookEditablePermission(workbookId).id ||
                (sheetId && point.id === new WorksheetEditPermission(workbookId, sheetId).id))) {
                this._imageInsertionEpoch++;
            }
        }));
        this._constrainDrawingTransformPreview();
        this._updateDrawingListener();
        this._updateOrderListener();
        this._groupDrawingListener();
        this._focusDrawingListener();
    }

    async insertFloatImage(): Promise<boolean> {
        const target = this._captureImageTarget();
        if (!target) {
            return false;
        }
        const files = await this._fileOpenerService.openFile({
            multiple: true,
            accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });

        const fileLength = files.length;
        if (fileLength > DRAWING_IMAGE_COUNT_LIMIT) {
            this._messageService.show({
                type: MessageType.Error,
                content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.exceedMaxCount', String(DRAWING_IMAGE_COUNT_LIMIT)),
            });
            return false;
        } else if (fileLength === 0) {
            return false;
        }

        const results = await Promise.all(files.map((file) => this._insertFloatImage(file, target).catch((error: unknown) => {
            this._injector.get(ILogService).error(error);
            return false;
        })));
        return results.every(Boolean);
    }

    async insertCellImage(): Promise<boolean> {
        const target = this._captureCellImageTarget();
        if (!target) {
            return false;
        }
        const files = await this._fileOpenerService.openFile({
            multiple: false,
            accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });
        const file = files[0];
        if (file) {
            return this._insertCellImage(file, undefined, target);
        }
        return false;
    }

    async setWorksheetBackgroundImage(files?: Nullable<File[]>): Promise<boolean> {
        const selectedFiles = files ?? await this._fileOpenerService.openFile({
            multiple: false,
            accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });
        const file = selectedFiles[0];
        if (!file) {
            return false;
        }

        let imageParam: Nullable<IImageIoServiceParam>;
        try {
            imageParam = await this._imageIoService.saveImage(file);
        } catch (error) {
            const type = (error as Error).message;
            if (type === ImageUploadStatusType.ERROR_EXCEED_SIZE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.exceedMaxSize', String(getDrawingImageAllowSize() / (1024 * 1024))),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE_TYPE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.invalidImageType'),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.invalidImage'),
                });
            }
            return false;
        }

        if (!imageParam) {
            return false;
        }

        const { unitId, subUnitId } = this._getUnitInfo();
        const scale = getWorksheetBackgroundImageScale(imageParam.base64Cache || imageParam.source);
        return this._commandService.executeCommand(SetWorksheetBackgroundImageCommand.id, {
            unitId,
            subUnitId,
            backgroundImage: {
                source: imageParam.source,
                imageSourceType: imageParam.imageSourceType,
                ...scale,
            },
        });
    }

    insertCellImageByFile(file: File, location?: ISheetLocationBase) {
        return this._insertCellImage(file, location);
    }

    async insertFloatImageByFile(file: File) {
        const target = this._captureImageTarget();
        if (!target) {
            return false;
        }
        return this._insertFloatImage(file, target).catch((error: unknown) => {
            this._injector.get(ILogService).error(error);
            return false;
        });
    }

    private async _insertFloatImage(file: File, target: IImageInsertionTarget): Promise<boolean> {
        if (!this._isImageTargetValid(target)) {
            return false;
        }
        let imageParam: Nullable<IImageIoServiceParam>;

        try {
            imageParam = await this._imageIoService.saveImage(file);
        } catch (error) {
            const type = (error as Error).message;
            if (type === ImageUploadStatusType.ERROR_EXCEED_SIZE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.exceedMaxSize', String(getDrawingImageAllowSize() / (1024 * 1024))),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE_TYPE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.invalidImageType'),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.invalidImage'),
                });
            }
        }

        if (imageParam == null || !this._isImageTargetValid(target)) {
            return false;
        }

        const { unitId, subUnitId } = target;
        const { imageId, imageSourceType, source, base64Cache } = imageParam;
        const imageSize = await getImageSize(base64Cache || '').catch(() => null);
        if (!imageSize) {
            return false;
        }
        const { width, height, image } = imageSize;
        if (!this._isImageTargetValid(target) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return false;
        }
        const { width: sceneWidth, height: sceneHeight } = target.render.scene;

        this._imageIoService.addImageSourceCache(source, imageSourceType, image);

        let scale = 1;
        if (width > DRAWING_IMAGE_WIDTH_LIMIT || height > DRAWING_IMAGE_HEIGHT_LIMIT) {
            const scaleWidth = DRAWING_IMAGE_WIDTH_LIMIT / width;
            const scaleHeight = DRAWING_IMAGE_HEIGHT_LIMIT / height;
            scale = Math.min(scaleWidth, scaleHeight);
        }

        if (target.worksheet.getConfig().type === SheetTypes.CHART) {
            const bounds = this._getChartImageBounds(target.render);
            if (!bounds) {
                return false;
            }
            scale = Math.min(scale, bounds.width / width, bounds.height / height);
            const marker = { row: 0, column: 0, rowOffset: 0, columnOffset: 0 };
            const drawing = applySheetDrawingPlacement({
                unitId,
                subUnitId,
                drawingId: imageId,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                imageSourceType,
                source,
                sheetTransform: { from: marker, to: marker },
                axisAlignSheetTransform: { from: marker, to: marker },
            }, {
                kind: SheetDrawingAnchorType.None,
                left: bounds.left + (bounds.width - width * scale) / 2,
                top: bounds.top + (bounds.height - height * scale) / 2,
                width: width * scale,
                height: height * scale,
            });
            return this._commandService.executeCommand<IInsertSheetDrawingCommandParams>(InsertSheetDrawingCommand.id, { unitId, drawings: [drawing] });
        }

        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!sheetSkeletonParam) {
            return false;
        }

        const { skeleton } = sheetSkeletonParam;
        const sheetTransform = this._getImagePosition(width * scale, height * scale, sceneWidth, sceneHeight, skeleton);
        if (!sheetTransform) {
            return false;
        }

        const newTransform = drawingPositionToTransform(sheetTransform, sheetSkeletonParam);
        if (!newTransform) {
            return false;
        }

        const sheetDrawingParam: ISheetDrawing = {
            unitId,
            subUnitId,
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType,
            source,
            transform: newTransform,
            sheetTransform,
            axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, skeleton) ?? sheetTransform,
        };

        return this._commandService.executeCommand<IInsertSheetDrawingCommandParams>(InsertSheetDrawingCommand.id, {
            unitId,
            drawings: [sheetDrawingParam],
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private async _insertCellImage(file: File, location?: ISheetLocationBase, capturedTarget?: IImageInsertionTarget) {
        const target = capturedTarget ?? this._captureCellImageTarget(location);
        if (!target || !this._isImageTargetValid(target)) {
            return false;
        }
        let imageParam: Nullable<IImageIoServiceParam>;
        try {
            imageParam = await this._imageIoService.saveImage(file);
        } catch (error) {
            const type = (error as Error).message;
            if (type === ImageUploadStatusType.ERROR_EXCEED_SIZE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.exceedMaxSize', String(getDrawingImageAllowSize() / (1024 * 1024))),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE_TYPE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.invalidImageType'),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t<LocaleKey>('sheets-drawing-ui.update-status.invalidImage'),
                });
            }
        }

        if (imageParam == null) {
            return false;
        }

        const { imageId, imageSourceType, source, base64Cache } = imageParam;
        const { width, height, image } = await getImageSize(base64Cache || '');
        this._imageIoService.addImageSourceCache(source, imageSourceType, image);
        if (!this._isImageTargetValid(target)) {
            return false;
        }
        const cellLocation = target.location!;
        const { row, col } = cellLocation;
        const docDataModel = createDocumentModelWithStyle('', {});

        const imageSize = getDrawingSizeByCell(
            this._injector,
            cellLocation,
            width,
            height,
            0
        );
        if (!imageSize) {
            return false;
        }
        const docTransform = buildDocTransform(imageSize.width, imageSize.height);
        const docDrawingParam = {
            unitId: docDataModel.getUnitId(),
            subUnitId: docDataModel.getUnitId(),
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType,
            source,
            transform: docDrawingPositionToTransform(docTransform),
            docTransform,
            behindDoc: BooleanNumber.FALSE,
            title: '',
            description: '',
            layoutType: PositionedObjectLayoutType.INLINE, // Insert inline drawing by default.
            wrapText: WrapTextType.BOTH_SIDES,
            distB: 0,
            distL: 0,
            distR: 0,
            distT: 0,
        };

        const jsonXActions = BuildTextUtils.drawing.add({
            documentDataModel: docDataModel,
            drawings: [docDrawingParam],
            selection: {
                collapsed: true,
                startOffset: 0,
                endOffset: 0,
            },
        });

        if (jsonXActions) {
            docDataModel.apply(jsonXActions);

            return this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
                value: {
                    [row]: {
                        [col]: {
                            p: (docDataModel.getSnapshot()),
                            t: 1,
                        },
                    },
                },
                unitId: target.unitId,
                subUnitId: target.subUnitId,
                range: { startRow: row, endRow: row, startColumn: col, endColumn: col },
            });
        }

        return false;
    }

    async insertCellImageByUrl(url: string, location?: ISheetLocationBase) {
        const target = this._captureCellImageTarget(location);
        if (!target) {
            return false;
        }
        let src = url;
        try {
            src = await this._urlImageService.getImage(url);
        } catch (error) {
            console.error(`Failed to get image from URLImageService: ${url}`, error);
        }
        const { width, height, image } = await getImageSize(src || '');
        this._imageIoService.addImageSourceCache(url, ImageSourceType.URL, image);
        if (!this._isImageTargetValid(target)) {
            return false;
        }
        const cellLocation = target.location!;
        const docDataModel = createDocumentModelWithStyle('', {});

        const imageSize = getDrawingSizeByCell(
            this._injector,
            cellLocation,
            width,
            height,
            0
        );
        if (!imageSize) {
            return false;
        }
        const docTransform = buildDocTransform(imageSize.width, imageSize.height);
        const docDrawingParam = {
            unitId: docDataModel.getUnitId(),
            subUnitId: docDataModel.getUnitId(),
            drawingId: generateRandomId(),
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: url,
            transform: docDrawingPositionToTransform(docTransform),
            docTransform,
            behindDoc: BooleanNumber.FALSE,
            title: '',
            description: '',
            layoutType: PositionedObjectLayoutType.INLINE, // Insert inline drawing by default.
            wrapText: WrapTextType.BOTH_SIDES,
            distB: 0,
            distL: 0,
            distR: 0,
            distT: 0,
        };

        const jsonXActions = BuildTextUtils.drawing.add({
            documentDataModel: docDataModel,
            drawings: [docDrawingParam],
            selection: {
                collapsed: true,
                startOffset: 0,
                endOffset: 0,
            },
        });

        if (jsonXActions) {
            docDataModel.apply(jsonXActions);
            return this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
                value: {
                    [cellLocation.row]: {
                        [cellLocation.col]: {
                            p: (docDataModel.getSnapshot()),
                            t: 1,
                        },
                    },
                },
                unitId: target.unitId,
                subUnitId: target.subUnitId,
                range: { startRow: cellLocation.row, endRow: cellLocation.row, startColumn: cellLocation.col, endColumn: cellLocation.col },
            });
        }

        return false;
    }

    private _captureImageTarget(location?: ISheetLocationBase): IImageInsertionTarget | null {
        if (this._disposed) {
            return null;
        }
        const instances = this._injector.get(IUniverInstanceService);
        const host = getSheetCommandTarget(instances, location ?? { unitId: this._context.unitId });
        const render = host && this._injector.get(IRenderManagerService).getRenderUnitById(host.unitId);
        if (!host || !render || (host.worksheet.getConfig().type !== SheetTypes.GRID && host.worksheet.getConfig().type !== SheetTypes.CHART)) {
            return null;
        }
        const frame = render.components.get(SHEET_VIEW_KEY.CHART_PAGE);
        const pageFrame = frame instanceof Rect ? frame : undefined;
        const target = { ...host, render, epoch: this._imageInsertionEpoch, location, explicit: Boolean(location), pageFrame };
        return this._isImageTargetValid(target) ? target : null;
    }

    private _captureCellImageTarget(location?: ISheetLocationBase): IImageInsertionTarget | null {
        const target = this._captureImageTarget(location);
        if (!target || target.worksheet.getConfig().type !== SheetTypes.GRID) {
            return null;
        }
        if (!location) {
            const selection = this._workbookSelections.getCurrentLastSelection();
            if (!selection) {
                return null;
            }
            const { primary } = selection;
            target.location = {
                unitId: target.unitId,
                subUnitId: target.subUnitId,
                row: primary.isMerged ? primary.startRow : primary.actualRow,
                col: primary.isMerged ? primary.startColumn : primary.actualColumn,
            };
        }
        return target;
    }

    private _isImageTargetValid(target: IImageInsertionTarget): boolean {
        if (this._disposed) {
            return false;
        }
        const instances = this._injector.get(IUniverInstanceService);
        const { workbook, worksheet, unitId, subUnitId, render } = target;
        if (instances.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET) !== workbook ||
            workbook.getSheetBySheetId(subUnitId) !== worksheet || render.isDisposed() ||
            this._injector.get(IRenderManagerService).getRenderUnitById(unitId) !== render) {
            return false;
        }
        if (!target.explicit && (target.epoch !== this._imageInsertionEpoch ||
            instances.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET) !== workbook ||
            instances.getFocusedUnit() !== workbook || workbook.getActiveSheet() !== worksheet)) {
            return false;
        }
        const permissions = this._injector.get(IPermissionService);
        if (permissions.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value !== true ||
            permissions.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value !== true) {
            return false;
        }
        return worksheet.getConfig().type !== SheetTypes.CHART ||
            (target.pageFrame === render.components.get(SHEET_VIEW_KEY.CHART_PAGE) && Boolean(this._getChartImageBounds(render)));
    }

    private _getChartImageBounds(render: IRender) {
        const frame = render.components.get(SHEET_VIEW_KEY.CHART_PAGE);
        if (!frame || ![frame.left, frame.top, frame.width, frame.height].every(Number.isFinite) || frame.width <= 0 || frame.height <= 0) {
            return null;
        }
        const view = render.scene.getMainViewport().calcViewportInfo().viewBound;
        const left = Math.max(frame.left, view.left);
        const top = Math.max(frame.top, view.top);
        const right = Math.min(frame.left + frame.width, view.right);
        const bottom = Math.min(frame.top + frame.height, view.bottom);
        return [left, top, right, bottom].every(Number.isFinite) && right > left && bottom > top
            ? { left, top, width: right - left, height: bottom - top }
            : null;
    }

    private _getUnitInfo() {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        return {
            unitId,
            subUnitId,
        };
    }

    private _getImagePosition(imageWidth: number, imageHeight: number, sceneWidth: number, sceneHeight: number, skeleton: SpreadsheetSkeleton): Nullable<ISheetDrawingPosition> {
        const selections = this._workbookSelections.getCurrentSelections();
        let range: IRange = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        };
        if (selections && selections.length > 0) {
            range = selections[selections.length - 1].range;
        }

        const rangeWithCoord = attachRangeWithCoord(skeleton, range);
        if (rangeWithCoord == null) {
            return;
        }

        let { startColumn, startRow, startX, startY } = rangeWithCoord;

        let isChangeStart = false;
        if (startX + imageWidth > sceneWidth) {
            startX = sceneWidth - imageWidth;

            if (startX < 0) {
                startX = 0;
                imageWidth = sceneWidth;
            }

            isChangeStart = true;
        }

        if (startY + imageHeight > sceneHeight) {
            startY = sceneHeight - imageHeight;

            if (startY < 0) {
                startY = 0;
                imageHeight = sceneHeight;
            }

            isChangeStart = true;
        }

        if (isChangeStart) {
            const newCoord = this._selectionRenderService.getCellWithCoordByOffset(startX, startY);
            if (newCoord == null) {
                return;
            }
            startX = newCoord.startX;
            startY = newCoord.startY;
            startColumn = newCoord.actualColumn;
            startRow = newCoord.actualRow;
        }

        const from = {
            column: startColumn,
            columnOffset: 0,
            row: startRow,
            rowOffset: 0,
        };

        const endSelectionCell = this._selectionRenderService.getCellWithCoordByOffset(startX + imageWidth, startY + imageHeight);

        if (endSelectionCell == null) {
            return;
        }

        const to = {
            column: endSelectionCell.actualColumn,
            columnOffset: startX + imageWidth - endSelectionCell.startX,
            row: endSelectionCell.actualRow,
            rowOffset: startY + imageHeight - endSelectionCell.startY,
        };

        return {
            from,
            to,
        };
    }

    private _updateOrderListener() {
        this.disposeWithMe(this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
            const { unitId, subUnitId, drawingIds, arrangeType } = params;

            this._commandService.executeCommand(SetDrawingArrangeCommand.id, {
                unitId,
                subUnitId,
                drawingIds,
                arrangeType,
            } as ISetDrawingArrangeCommandParams);
        }));
    }

    private _constrainDrawingTransformPreview(): void {
        this.disposeWithMe(this._context.scene.getTransformerByCreate().changing$.subscribe(({ objects }) => {
            const subUnitId = this._context.unit.getActiveSheet()?.getSheetId();
            if (!subUnitId) {
                return;
            }
            const drawings = this._sheetDrawingService.getDrawingData(this._context.unitId, subUnitId);
            const processing = new Set<string>();
            const previewDrawing = (drawing: ISheetDrawing): ISheetDrawing => {
                if (processing.has(drawing.drawingId)) {
                    return drawing;
                }
                processing.add(drawing.drawingId);
                const key = getDrawingShapeKeyByDrawingSearch(drawing);
                const selectedRect = objects.get(key);
                const rect = selectedRect ?? this._context.scene.getObjectIncludeInGroup(key);
                let preview = drawing;
                if (rect) {
                    preview = {
                        ...drawing,
                        transform: {
                            ...drawing.transform,
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height,
                        },
                    };
                }
                const parent = drawing.chartParent && drawings[drawing.chartParent.drawingId];
                if (parent && drawing.anchorType === SheetDrawingAnchorType.None) {
                    const liveParent = previewDrawing(parent);
                    if (selectedRect) {
                        preview = applySheetDrawingPlacement(drawing, getSheetDrawingPlacement(preview), undefined, liveParent, true);
                        const next = preview.transform!;
                        if (next.left !== selectedRect.left || next.top !== selectedRect.top
                            || next.width !== selectedRect.width || next.height !== selectedRect.height) {
                            selectedRect.transformByState(next);
                        }
                    } else if (parent.transform && liveParent.transform && drawing.transform) {
                        const oldBounds = parent.transform;
                        const nextBounds = liveParent.transform;
                        const changed = nextBounds.left !== oldBounds.left || nextBounds.top !== oldBounds.top
                            || nextBounds.width !== oldBounds.width || nextBounds.height !== oldBounds.height;
                        if (changed) {
                            const childBounds = drawing.transform;
                            const widthRatio = nextBounds.width! / oldBounds.width!;
                            const heightRatio = nextBounds.height! / oldBounds.height!;
                            // An unselected intermediate parent follows its selected ancestor only in this calculation.
                            // Its render object remains unchanged until the command updates the drawing graph.
                            preview = applySheetDrawingPlacement(drawing, {
                                kind: SheetDrawingAnchorType.None,
                                left: nextBounds.left! + (childBounds.left! - oldBounds.left!) * widthRatio,
                                top: nextBounds.top! + (childBounds.top! - oldBounds.top!) * heightRatio,
                                width: drawing.chartParent!.resizeWithParent ? childBounds.width! * widthRatio : childBounds.width!,
                                height: drawing.chartParent!.resizeWithParent ? childBounds.height! * heightRatio : childBounds.height!,
                            }, undefined, liveParent);
                        }
                    }
                }
                processing.delete(drawing.drawingId);
                return preview;
            };
            for (const drawing of Object.values(drawings)) {
                if (objects.has(getDrawingShapeKeyByDrawingSearch(drawing))) {
                    previewDrawing(drawing);
                }
            }
        }));
    }

    private _updateDrawingListener() {
        this.disposeWithMe(this._drawingManagerService.featurePluginUpdate$.subscribe((params) => {
            const drawings: Partial<ISheetDrawing>[] = [];

            if (params.length === 0) {
                return;
            }

            (params as IImageData[]).forEach((param) => {
                const { unitId, subUnitId, drawingId, transform } = param;
                const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
                if (!transform) {
                    return;
                }

                const sheetDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });
                if (sheetDrawing == null || sheetDrawing.unitId !== this._context.unitId) {
                    return;
                }

                if (sheetDrawing.anchorType === SheetDrawingAnchorType.None) {
                    const next = { ...sheetDrawing, ...param, transform: { ...sheetDrawing.transform, ...transform } } as ISheetDrawing;
                    drawings.push(applySheetDrawingPlacement(next, getSheetDrawingPlacement(next)));
                    return;
                }
                if (!sheetSkeletonParam) {
                    return;
                }
                const { skeleton } = sheetSkeletonParam;
                const sheetTransform = transformToDrawingPosition({ ...sheetDrawing.transform, ...transform }, skeleton);
                const axisAlignSheetTransform = transformToAxisAlignPosition({ ...sheetDrawing.transform, ...transform }, skeleton);

                if (sheetTransform == null || axisAlignSheetTransform == null) {
                    return;
                }

                const newDrawing: Partial<ISheetDrawing> = {
                    ...param,
                    transform: { ...sheetDrawing.transform, ...transform, ...drawingPositionToTransform(sheetTransform, sheetSkeletonParam) },
                    sheetTransform: { ...sheetTransform },
                    axisAlignSheetTransform: { ...axisAlignSheetTransform },
                };

                drawings.push(newDrawing);
            });

            if (drawings.length > 0) {
                this._commandService.executeCommand(SetSheetDrawingCommand.id, {
                    unitId: params[0].unitId,
                    drawings,
                } as ISetDrawingCommandParams);
            }
        }));
    }

    private _getSheetTransformByParam(param: IDrawingParam, isCreate: boolean): Nullable<{
        sheetTransform: ISheetDrawingPosition;
        axisAlignSheetTransform: ISheetDrawingPosition;
    }> {
        const { unitId, subUnitId, drawingId, transform } = param;
        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!transform || !skeleton) {
            return null;
        }

        const sheetDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });

        let sheetDrawingTransform = sheetDrawing?.transform;
        if (isCreate) {
            sheetDrawingTransform = {};
        }

        if (!isCreate && (!sheetDrawing || sheetDrawing.unitId !== this._context.unitId)) {
            return null;
        }

        const sheetTransform = transformToDrawingPosition({ ...sheetDrawingTransform, ...transform }, skeleton);
        const axisAlignSheetTransform = transformToAxisAlignPosition({ ...sheetDrawingTransform, ...transform }, skeleton);

        if (!sheetTransform || !axisAlignSheetTransform) {
            return null;
        }

        return { sheetTransform, axisAlignSheetTransform };
    }

    private _groupDrawingListener() {
        this.disposeWithMe(this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
            const grpParams = [];
            for (const param of params) {
                const parent = param.parent;
                const grpSheetTransform = this._getSheetTransformByParam(parent, true);

                const children = [];
                for (const child of param.children) {
                    const childSheetTransformInfo = this._getSheetTransformByParam(child, false);
                    if (childSheetTransformInfo != null) {
                        children.push({
                            ...child,
                            sheetTransform: childSheetTransformInfo.sheetTransform,
                            axisAlignSheetTransform: childSheetTransformInfo.axisAlignSheetTransform,
                        });
                    }
                }

                const grpParam = {
                    parent: { ...parent, sheetTransform: grpSheetTransform?.sheetTransform, axisAlignSheetTransform: grpSheetTransform?.axisAlignSheetTransform },
                    children,

                };
                grpParams.push(grpParam);
            }
            if (grpParams.length > 0) {
                this._commandService.executeCommand(GroupSheetDrawingCommand.id, grpParams);
                const { unitId, subUnitId, drawingId } = params[0].parent;
                this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{ unitId, subUnitId, drawingId }]);
            }
        }));

        this.disposeWithMe(this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            const unGroupParams = [];
            for (const param of params) {
                const { children } = param;
                const childParams = [];
                for (const child of children) {
                    const childSheetTransform = this._getSheetTransformByParam(child, false);
                    if (childSheetTransform != null) {
                        childParams.push({
                            ...child,
                            sheetTransform: childSheetTransform.sheetTransform,
                            axisAlignSheetTransform: childSheetTransform.axisAlignSheetTransform,
                        });
                    }
                }
                unGroupParams.push({
                    ...param,
                    children: childParams,
                });
            }
            this._commandService.executeCommand(UngroupSheetDrawingCommand.id, unGroupParams);
        }));
    }

    private _focusDrawingListener() {
        this.disposeWithMe(
            this._drawingManagerService.focus$.subscribe((params) => {
                if (params == null || params.length === 0) {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                    this._sheetDrawingService.focusDrawing([]);
                } else {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
                    this._sheetDrawingService.focusDrawing(params);
                }
            })
        );
    }
}
