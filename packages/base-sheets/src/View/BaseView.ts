import { Scene } from '@univerjs/base-render';
import { Registry, SheetContext, Worksheet, Injector } from '@univerjs/core';
import { ISheetContext } from '../Services/tokens';

export class BaseView {
    viewKey = '';

    protected _injector: Injector;

    private _scene: Scene;

    private _context: SheetContext;

    getScene() {
        return this._scene;
    }

    getContext() {
        return this._context;
    }

    updateToSheet(worksheet: Worksheet) {}

    initialize(scene: Scene, injector: Injector) {
        this._injector = injector;
        this._context = injector.get(ISheetContext);
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
}

export const CanvasViewRegistry = Registry.create();
