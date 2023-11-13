import { IRenderManagerService } from '@univerjs/base-render';
import { SelectionManagerService } from '@univerjs/base-sheets';
import { IContextMenuService, MenuPosition } from '@univerjs/base-ui';
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SheetMenuPosition } from '../menu/menu';
import { getSheetObject } from '../utils/component-tools';

/**
 * This controller subscribe to context menu events in
 * sheet rendering views and invoke context menu at a correct position
 * and with correct menu type.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetContextMenuController)
export class SheetContextMenuController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SelectionManagerService)
        private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._currentUniverService.currentSheet$.subscribe((workbook) => {
            if (workbook == null) {
                throw new Error('workbook is null');
            }
            this._addListeners();
        });
    }

    private _addListeners(): void {
        const objects = getSheetObject(this._currentUniverService, this._renderManagerService);
        if (!objects) {
            return;
            // throw new Error('Rendering should be done when SheetContextMenuController initialized.');
        }

        // const scene = objects.scene;

        // const sceneObserver = scene.onPointerDownObserver.add((event) => {
        //     if (event.button !== 2) {
        //         return;
        //     }

        //     const { offsetX, offsetY } = event;

        //     const object = scene.pick(Vector2.FromArray([offsetX, offsetY])) as BaseObject;

        //     if (object.oKey === SHEET_VIEW_KEY.MAIN) {
        //         this._contextMenuService.triggerContextMenu(event, MenuPosition.CONTEXT_MENU);
        //     } else if (object.oKey === SHEET_VIEW_KEY.ROW) {
        //         this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU);
        //     } else if (object.oKey === SHEET_VIEW_KEY.COLUMN) {
        //         this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.COL_HEADER_CONTEXT_MENU);
        //     }
        // });

        // this.disposeWithMe(toDisposable(() => scene.onPointerDownObserver.remove(sceneObserver)));

        const spreadsheetPointerDownObserver = objects.spreadsheet.onPointerDownObserver;
        const spreadsheetObserver = spreadsheetPointerDownObserver.add((event) => {
            if (event.button === 2) {
                const selections = this._selectionManagerService.getSelections();
                if (selections) {
                    const currentSelection = selections[0];
                    if (currentSelection.range.rangeType === RANGE_TYPE.COLUMN) {
                        this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.COL_HEADER_CONTEXT_MENU);
                    } else if (currentSelection.range.rangeType === RANGE_TYPE.ROW) {
                        this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU);
                    } else {
                        this._contextMenuService.triggerContextMenu(event, MenuPosition.CONTEXT_MENU);
                    }
                }
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(spreadsheetObserver)));

        const rowHeaderPointerDownObserver = objects.spreadsheetRowHeader.onPointerDownObserver;
        const rowHeaderObserver = rowHeaderPointerDownObserver.add((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU);
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(rowHeaderObserver)));

        const colHeaderPointerDownObserver = objects.spreadsheetColumnHeader.onPointerDownObserver;
        const colHeaderObserver = colHeaderPointerDownObserver.add((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.COL_HEADER_CONTEXT_MENU);
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(colHeaderObserver)));
    }
}
