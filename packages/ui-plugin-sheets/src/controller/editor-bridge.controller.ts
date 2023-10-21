import { DeviceInputEventType, IRenderManagerService, ISelectionTransformerShapeManager } from '@univerjs/base-render';
import { getSheetObject, SelectionManagerService, SheetSkeletonManagerService } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    makeCellToSelection,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetActivateCellEditOperation } from '../commands/operations/activate-cell-edit.operation';
import { SetCellEditOperation } from '../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../services/editor-bridge.service';

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
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {}

    private _initialize() {
        this._initialSelectionListener();

        this._initialEventListener();
    }

    private _initialSelectionListener() {
        this._selectionManagerService.selectionInfo$.subscribe((params) => {
            const currentSkeletonManager = this._sheetSkeletonManagerService.getCurrent();

            const sheetObject = this._getSheetObject();

            if (currentSkeletonManager == null || sheetObject == null) {
                return;
            }

            const { skeleton, unitId, sheetId } = currentSkeletonManager;

            const { scene } = sheetObject;

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

            const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);

            if (actualRangeWithCoord == null) {
                return;
            }

            let { startX, startY, endX, endY } = actualRangeWithCoord;

            const { scaleX, scaleY } = scene.getAncestorScale();
            const scrollXY = scene.getScrollXY(this._selectionTransformerShapeManager.getViewPort());

            startX = skeleton.convertTransformToOffsetX(startX, scaleX, scrollXY) - scrollXY.x * scaleX;

            startY = skeleton.convertTransformToOffsetY(startY, scaleY, scrollXY) - scrollXY.y * scaleY;

            endX = skeleton.convertTransformToOffsetX(endX, scaleX, scrollXY) - scrollXY.x * scaleX;

            endY = skeleton.convertTransformToOffsetY(endY, scaleY, scrollXY) - scrollXY.y * scaleY;

            let documentLayoutObject = skeleton.getCellDocumentModel(startRow, startColumn, true, true);

            if (documentLayoutObject == null || documentLayoutObject.documentModel == null) {
                documentLayoutObject = skeleton.getBlankCellDocumentModel(startRow, startColumn, true);
            }

            // let documentModel = documentModelObject?.documentModel;

            // if (documentModel == null) {
            //     documentModel = skeleton.getBlankCellDocumentModel(startRow, startColumn).documentModel;
            // }

            // documentModelObject.documentModel = documentModel;

            // this._editorBridgeService.setState({
            //     position: {
            //         startX,
            //         startY,
            //         endX,
            //         endY,
            //     },
            //     unitId,
            //     sheetId,
            //     documentLayoutObject,
            // });

            this._commandService.executeCommand(SetActivateCellEditOperation.id, {
                position: {
                    startX,
                    startY,
                    endX,
                    endY,
                },
                row: startRow,
                column: startColumn,
                unitId,
                sheetId,
                documentLayoutObject,
            });
        });
    }

    private _initialEventListener() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheet, scene, spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } =
            sheetObject;

        spreadsheet.onDblclickObserver.add(() => {
            // this._editorBridgeService.show(DeviceInputEventType.Dblclick);

            this._commandService.executeCommand(SetCellEditOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
            });
        });

        spreadsheet.onPointerDownObserver.add(this._hideEditor.bind(this));
        spreadsheetColumnHeader.onPointerDownObserver.add(this._hideEditor.bind(this));
        spreadsheetLeftTopPlaceholder.onPointerDownObserver.add(this._hideEditor.bind(this));
        spreadsheetRowHeader.onPointerDownObserver.add(this._hideEditor.bind(this));
    }

    private _hideEditor() {
        if (this._editorBridgeService.isVisible().visible === true) {
            this._commandService.executeCommand(SetCellEditOperation.id, {
                visible: false,
            });
        }
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {}
}
