import {
    DeviceInputEventType,
    DocumentSkeleton,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ISelectionTransformerShapeManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject } from '../Basics/component-tools';
import { IEditorBridgeService } from '../services/editor-bridge.service';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, EditorBridgeController)
export class EditorBridgeController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,
        @Inject(LocaleService) protected readonly _localService: LocaleService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {}

    private _initialize() {
        this._initialSelectionListener();

        this._initialDblclickListener();
    }

    private _initialSelectionListener() {
        this._selectionManagerService.selectionInfo$.subscribe((params) => {
            const currentSkeletonManager = this._sheetSkeletonManagerService.getCurrent();
            this._editorBridgeService.hide();
            if (currentSkeletonManager == null) {
                return;
            }

            const { skeleton, unitId, sheetId } = currentSkeletonManager;

            if (params == null || params.length === 0 || skeleton == null) {
                return;
            }

            const { primary } = params[params.length - 1];

            if (primary == null) {
                return;
            }

            const { startRow, startColumn } = primary;

            const cell = skeleton.getCellData().getValue(startRow, startColumn);

            const primaryWithCoord = this._selectionTransformerShapeManager.convertCellRangeToInfo(primary);

            if (cell == null || primaryWithCoord == null) {
                return;
            }

            const documentModel = skeleton.getCellModel(startRow, startColumn)?.documentModel;

            if (documentModel == null) {
                return;
            }

            const documentSkeleton = DocumentSkeleton.create(documentModel, this._localService);

            this._editorBridgeService.setState({
                primaryWithCoord,
                unitId,
                sheetId,
                docSkeleton: documentSkeleton,
            });
        });
    }

    private _initialDblclickListener() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheet } = sheetObject;

        spreadsheet.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._editorBridgeService.show(DeviceInputEventType.Dblclick);
            // const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            // const scene = this._getSheetObject()?.scene;
            // if (scene == null || skeleton == null) {
            //     return;
            // }
            // const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            // const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));
            // const scrollXY = scene.getScrollXYByRelativeCoords(relativeCoords);
            // const { scaleX, scaleY } = scene.getAncestorScale();
            // const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;
            // const selectionData = this._getSelectedRangeWithMerge(
            //     newEvtOffsetX,
            //     newEvtOffsetY,
            //     scaleX,
            //     scaleY,
            //     scrollXY
            // );
            // if (!selectionData) {
            //     return false;
            // }
            // const { rangeWithCoord: actualRangeWithCoord, primaryWithCoord } = selectionData;
            // const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = actualRangeWithCoord;
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {}
}
