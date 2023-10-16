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
    ITextRotation,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    makeCellToSelection,
    OnLifecycle,
    WrapStrategy,
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
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
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

            const primaryWithCoord = this._selectionTransformerShapeManager.convertCellRangeToInfo(primary);

            if (primaryWithCoord == null) {
                return;
            }

            const documentModelObject = skeleton.getCellDocumentModel(startRow, startColumn);

            const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);

            if (actualRangeWithCoord == null || documentModelObject == null) {
                return;
            }

            let documentModel = documentModelObject?.documentModel;

            const { startX, endX } = actualRangeWithCoord;

            const { textRotation, verticalAlign, horizontalAlign, wrapStrategy } = documentModelObject;

            const { a: angle } = textRotation as ITextRotation;

            if (documentModel == null) {
                documentModel = skeleton.getBlankCellDocumentModel(startRow, startColumn).documentModel;
            }

            const documentSkeleton = DocumentSkeleton.create(documentModel!, this._localService);

            if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                documentSkeleton.getModel().updateDocumentDataPageSize(endX - startX);
            }

            documentSkeleton.calculate();

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
