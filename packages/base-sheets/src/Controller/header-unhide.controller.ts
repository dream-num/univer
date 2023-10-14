import { IRenderManagerService } from '@univerjs/base-render';
import { Disposable, ICurrentUniverService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject } from '../Basics/component-tools';
import { SHEET_COMPONENT_UNHIDE_LAYER_INDEX } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { HeaderUnhideShape, HeaderUnhideShapeType } from '../View/header-unhide-shape';

const HEADER_UNHIDE_CONTROLLER_SHAPE = '__SpreadsheetHeaderUnhideSHAPEControllerShape__';

/**
 * This controller controls rendering of the buttons to unhide hidden rows and columns.
 */
@OnLifecycle(LifecycleStages.Rendered, HeaderUnhideController)
export class HeaderUnhideController extends Disposable {
    private _unhideShape: HeaderUnhideShape;

    // It should support several workbooks & worksheet.
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
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

        const { scene } = sheetObject;

        this._unhideShape = new HeaderUnhideShape(HEADER_UNHIDE_CONTROLLER_SHAPE, {
            type: HeaderUnhideShapeType.COLUMN,
            start: 1,
            end: 2,
            hovered: false,
        });
        scene.addObjects([this._unhideShape], SHEET_COMPONENT_UNHIDE_LAYER_INDEX);
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._rendererManagerService);
    }
}
