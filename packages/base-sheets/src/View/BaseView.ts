import { Scene } from '@univerjs/base-render';
import { Registry, Worksheet } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';

export class BaseView {
    viewKey = '';

    zIndex = 0;

    protected _injector: Injector;

    private _scene: Scene;

    getScene() {
        return this._scene;
    }

    onSheetChange(worksheet: Worksheet) {}

    initialize(scene: Scene) {
        this._scene = scene;
        this._initialize();
        return this;
    }

    protected _initialize() {
        // TODO
    }
}

export enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene',
    VIEW_MAIN = 'viewMain',
    VIEW_TOP = 'viewTop',
    VIEW_LEFT = 'viewLeft',
    VIEW_LEFT_TOP = 'viewLeftTop',
    SHEET_VIEW = 'sheetView',
    DRAG_LINE_VIEW = 'dragLineView',
    CELL_EDITOR = 'cellEditor',
    SELECTION_VIEW = 'selectionView',
}

export enum SHEET_VIEW_KEY {
    MAIN = '__SpreadsheetRender__',
    ROW = '__SpreadsheetRowTitle__',
    COLUMN = '__SpreadsheetColumnTitle__',
    LEFT_TOP = '__SpreadsheetLeftTopPlaceholder__',
}

export const CanvasViewRegistry = Registry.create();
