import { DeviceInputEventType, getCanvasOffsetByEngine, IRenderManagerService } from '@univerjs/base-render';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    SelectionManagerService,
    SetWorksheetActivateMutation,
} from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    makeCellToSelection,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetActivateCellEditOperation } from '../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../services/editor-bridge.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { getSheetObject } from './utils/component-tools';

interface ISetWorksheetMutationParams {
    workbookId: string;
    worksheetId: string;
}

@OnLifecycle(LifecycleStages.Rendered, EditorBridgeController)
export class EditorBridgeController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
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

            const { scene, engine } = sheetObject;

            if (params == null || params.length === 0 || skeleton == null || params[params.length - 1] == null) {
                return;
            }

            const { primary } = params[params.length - 1];

            if (primary == null) {
                return;
            }

            const { startRow, startColumn } = primary;

            const primaryWithCoord = this._selectionRenderService.convertCellRangeToInfo(primary);

            if (primaryWithCoord == null) {
                return;
            }

            const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);

            if (actualRangeWithCoord == null) {
                return;
            }

            const canvasOffset = getCanvasOffsetByEngine(engine);

            let { startX, startY, endX, endY } = actualRangeWithCoord;

            const { scaleX, scaleY } = scene.getAncestorScale();
            const scrollXY = scene.getScrollXY(this._selectionRenderService.getViewPort());

            startX = skeleton.convertTransformToOffsetX(startX, scaleX, scrollXY);

            startY = skeleton.convertTransformToOffsetY(startY, scaleY, scrollXY);

            endX = skeleton.convertTransformToOffsetX(endX, scaleX, scrollXY);

            endY = skeleton.convertTransformToOffsetY(endY, scaleY, scrollXY);

            let documentLayoutObject = skeleton.getCellDocumentModel(startRow, startColumn, true, true);

            if (documentLayoutObject == null || documentLayoutObject.documentModel == null) {
                documentLayoutObject = skeleton.getBlankCellDocumentModel(startRow, startColumn, true);
            }

            documentLayoutObject.documentModel?.setZoomRatio(Math.max(scaleX, scaleY));

            this._commandService.executeCommand(SetActivateCellEditOperation.id, {
                position: {
                    startX,
                    startY,
                    endX,
                    endY,
                },
                scaleX,
                scaleY,
                canvasOffset,
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

        const { spreadsheet, spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } =
            sheetObject;

        spreadsheet.onDblclickObserver.add(() => {
            // this._editorBridgeService.show(DeviceInputEventType.Dblclick);
            this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
            });
        });

        spreadsheet.onPointerDownObserver.add(this._KeepVisibleHideEditor.bind(this));
        spreadsheetColumnHeader.onPointerDownObserver.add(this._KeepVisibleHideEditor.bind(this));
        spreadsheetLeftTopPlaceholder.onPointerDownObserver.add(this._KeepVisibleHideEditor.bind(this));
        spreadsheetRowHeader.onPointerDownObserver.add(this._KeepVisibleHideEditor.bind(this));
    }

    /**
     * In the activated state of formula editing,
     * prohibit closing the editor according to the state to facilitate generating selection reference text.
     */
    private _KeepVisibleHideEditor() {
        if (this._editorBridgeService.isForceKeepVisible()) {
            return;
        }
        this._hideEditor();
    }

    private _hideEditor() {
        if (this._editorBridgeService.isVisible().visible !== true) {
            return;
        }

        this._selectionManagerService.makeDirty(false);
        this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
        });

        /**
         * Hiding the editor triggers a SetRangeValuesMutation which saves the content.
         * This mutation, in turn, triggers a refresh of the skeleton,
         * causing the selection to update. In most scenarios,
         * this update is reasonable. However, when clicking on another cell and exiting the edit,
         * this causes the selection to be reset. Therefore,
         * a makeDirty method has been added here to block the refresh of selection.
         * The reason for using setTimeout is that it needs to wait for the process
         * to finish before allowing the refresh of the selection.
         */
        setTimeout(() => {
            this._selectionManagerService.makeDirty(true);
        }, 0);
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {
        const updateCommandList = COMMAND_LISTENER_SKELETON_CHANGE;

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetActivateMutation.id) {
                    this._KeepVisibleHideEditor();
                } else if (updateCommandList.includes(command.id)) {
                    this._hideEditor();
                }
            })
        );
    }
}
