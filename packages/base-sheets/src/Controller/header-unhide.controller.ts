import { IRenderManagerService } from '@univerjs/base-render';
import {
    Disposable,
    getWorksheetUID,
    ICommandService,
    ICurrentUniverService,
    IKeyValue,
    LifecycleStages,
    OnLifecycle,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getCoordByCell, getSheetObject } from '../Basics/component-tools';
import { SHEET_COMPONENT_UNHIDE_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import {
    ISetSpecificColsVisibleCommandParams,
    SetSpecificColsVisibleCommand,
} from '../commands/commands/set-col-visible.command';
import {
    ISetSpecificRowsVisibleCommandParams,
    SetSpecificRowsVisibleCommand,
} from '../commands/commands/set-row-visible.command';
import { InsertColMutation, InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';
import { SetColHiddenMutation, SetColVisibleMutation } from '../commands/mutations/set-col-visible.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../commands/mutations/set-row-visible.mutation';
import { SetWorksheetColWidthMutation } from '../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightMutation } from '../commands/mutations/set-worksheet-row-height.mutation';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { HeaderUnhideShape, HeaderUnhideShapeType } from '../View/header-unhide-shape';

const HEADER_UNHIDE_CONTROLLER_SHAPE = '__SpreadsheetHeaderUnhideSHAPEControllerShape__';

const RENDER_COMMANDS: string[] = [
    SetRowHiddenMutation.id,
    SetRowVisibleMutation.id,
    SetColHiddenMutation.id,
    SetColVisibleMutation.id,
    InsertRowMutation.id,
    InsertColMutation.id,
    RemoveRowMutation.id,
    RemoveColMutation.id,
    SetWorksheetRowHeightMutation.id,
    SetWorksheetColWidthMutation.id,
];

/**
 * This controller controls rendering of the buttons to unhide hidden rows and columns.
 */
@OnLifecycle(LifecycleStages.Rendered, HeaderUnhideController)
export class HeaderUnhideController extends Disposable {
    private _unhideShape: HeaderUnhideShape;

    private _shapes = new Map<string, { cols: HeaderUnhideShape[]; rows: HeaderUnhideShape[] }>();

    // It should support several workbooks & worksheet.
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _cmdSrv: ICommandService,
        @ICurrentUniverService private readonly _cuSrv: ICurrentUniverService,
        @IRenderManagerService private readonly _rendererManagerService: IRenderManagerService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();
    }

    private _init(): void {
        // First just let me render a unhide button of the column header!.
        const sheetObject = this._getSheetObject();
        if (!sheetObject) {
            return;
        }

        // try to render the unhide button for the current worksheet
        const workbook = this._cuSrv.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        if (worksheet) {
            this._initForWorksheet(workbook, worksheet);
        }

        // re-render hidden rows / cols when specific commands are executed
        this._cmdSrv.onCommandExecuted((command) => {
            // TODO: subscribe skeleton change event instead of some commands here
            if (
                !RENDER_COMMANDS.includes(command.id) ||
                !command.params ||
                !(command.params as IKeyValue).workbookId ||
                !(command.params as IKeyValue).worksheetId
            ) {
                return;
            }

            const workbook = this._cuSrv.getUniverSheetInstance((command.params as IKeyValue).workbookId);
            const worksheet = workbook?.getSheetBySheetId((command.params as IKeyValue).worksheetId);
            if (worksheet) {
                this._updateWorksheet(workbook!, worksheet);
            }
        });
    }

    /** Initialize header unhide render shapes for a specific worksheet.  */
    private _initForWorksheet(workbook: Workbook, worksheet: Worksheet): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (!skeleton) {
            return;
        }

        // steps to render the unhide button for the current worksheet
        // 1. and get hidden rows and columns
        const hiddenRowRanges = worksheet.getHiddenRows();
        const hiddenColRanges = worksheet.getHiddenCols();

        // First just let me render a unhide button of the column header!.
        const sheetObject = this._getSheetObject();
        if (!sheetObject) {
            return;
        }

        // NOTE: for performance consideration we should only get hidden rows & cols in the viewport
        // 2. create shapes and add them to the scene, the position should be calculated from SheetSkeleton
        const { scene } = sheetObject;
        const rowCount = worksheet.getRowCount();
        const rowShapes = hiddenRowRanges.map((r) => {
            const { startRow, endRow } = r;
            const position = getCoordByCell(startRow, 0, scene, skeleton);
            return new HeaderUnhideShape(
                HEADER_UNHIDE_CONTROLLER_SHAPE,
                {
                    type: HeaderUnhideShapeType.ROW,
                    hovered: false,
                    hasPrevious: startRow !== 0,
                    hasNext: endRow !== rowCount - 1,
                    top: position.startY - 12,
                    left: position.startX - 29,
                },
                () =>
                    this._cmdSrv.executeCommand<ISetSpecificRowsVisibleCommandParams>(
                        SetSpecificRowsVisibleCommand.id,
                        {
                            workbookId: workbook.getUnitId(),
                            worksheetId: worksheet.getSheetId(),
                            ranges: [r],
                        }
                    )
            );
        });
        const colCount = worksheet.getColumnCount();
        const colShapes = hiddenColRanges.map((r) => {
            const { startColumn, endColumn } = r;
            const position = getCoordByCell(0, startColumn, scene, skeleton);
            return new HeaderUnhideShape(
                HEADER_UNHIDE_CONTROLLER_SHAPE,
                {
                    type: HeaderUnhideShapeType.COLUMN,
                    hovered: false,
                    hasPrevious: startColumn !== 0,
                    hasNext: endColumn !== colCount - 1,
                    left: position.startX - 28,
                },
                () =>
                    this._cmdSrv.executeCommand<ISetSpecificColsVisibleCommandParams>(
                        SetSpecificColsVisibleCommand.id,
                        {
                            workbookId: workbook.getUnitId(),
                            worksheetId: worksheet.getSheetId(),
                            ranges: [r],
                        }
                    )
            );
        });

        scene.addObjects(colShapes, SHEET_COMPONENT_UNHIDE_LAYER_INDEX);
        scene.addObjects(rowShapes, SHEET_COMPONENT_UNHIDE_LAYER_INDEX);
        this._shapes.set(getWorksheetUID(workbook, worksheet), { cols: colShapes, rows: rowShapes });
    }

    private _updateWorksheet(workbook: Workbook, worksheet: Worksheet): void {
        const shapes = this._shapes.get(getWorksheetUID(workbook, worksheet));
        shapes?.cols.forEach((shape) => shape.dispose());
        shapes?.rows.forEach((shape) => shape.dispose());
        this._initForWorksheet(workbook, worksheet);
    }

    private _getSheetObject() {
        return getSheetObject(this._cuSrv, this._rendererManagerService);
    }
}

// class WorksheetUnhide extends Disposable {}
