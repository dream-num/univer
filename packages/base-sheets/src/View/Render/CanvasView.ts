import { Engine, EVENT_TYPE, IScrollObserverParam, IWheelEvent, Layer, Scene, ScrollBar, Viewport } from '@univer/base-render';
import { EventState, Worksheet, Plugin } from '@univer/core';
import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry } from './BaseView';
import { SheetView } from './Views/SheetView';
import './Views';
import { SheetPlugin } from '../..';

// workbook
export class CanvasView {
    private _scene: Scene;

    private _views: BaseView[] = []; // worksheet

    constructor(private _engine: Engine, private _plugin: Plugin) {
        this._initialize();
    }

    private _initialize() {
        const engine = this._engine;
        const context = this._plugin.getContext();
        const workbook = context.getWorkBook();
        let worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            worksheet = workbook.getSheets()[0];
        }
        const config = worksheet.getConfig();
        const rowTitle = config.rowTitle;
        const columnTitle = config.columnTitle;

        const scene = new Scene(CANVAS_VIEW_KEY.MAIN_SCENE, engine, {
            width: 1200,
            height: 1000,
        });
        this._scene = scene;
        const viewMain = new Viewport(CANVAS_VIEW_KEY.VIEW_MAIN, scene, {
            left: rowTitle.width,
            top: columnTitle.height,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewTop = new Viewport(CANVAS_VIEW_KEY.VIEW_TOP, scene, {
            left: rowTitle.width,
            top: 0,
            height: columnTitle.height,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewLeft = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT, scene, {
            left: 0,
            top: columnTitle.height,
            bottom: 0,
            width: rowTitle.width,
            isWheelPreventDefaultX: true,
        });
        const viewLeftTop = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowTitle.width,
            height: columnTitle.height,
            isWheelPreventDefaultX: true,
        });
        // viewMain.linkToViewport(viewLeft, LINK_VIEW_PORT_TYPE.Y);
        // viewMain.linkToViewport(viewTop, LINK_VIEW_PORT_TYPE.X);
        viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
            const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

            viewTop
                .updateScroll({
                    scrollX,
                    actualScrollX,
                })
                .makeDirty(true);

            viewLeft
                .updateScroll({
                    scrollY,
                    actualScrollY,
                })
                .makeDirty(true);
        });

        // sheet zoom [0 ~ 1]
        context.getContextObserver('onZoomRatioSheetObservable').add((value) => {
            const plugin = this._plugin as SheetPlugin;
            this._scene.scale(value.zoomRatio, value.zoomRatio);
            // this._scene.makeDirty();
            // update data TODO 增加action后，会自动刷新，此处需要移除
            plugin.getCanvasView().updateToSheet(this._plugin.getContext().getWorkBook().getActiveSheet()!);
            // update render
            // plugin.getMainComponent().makeDirty(true);
        });

        scene.addViewport(viewMain, viewLeft, viewTop, viewLeftTop).attachControl();
        // 鼠标滚轮缩放
        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    const sheet = context.getWorkBook().getActiveSheet();
                    const value = e.deltaY > 0 ? 0.1 : -0.1;

                    sheet.setZoomRatio(sheet.getZoomRatio() + value);
                    // scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        const scrollbar = new ScrollBar(viewMain);

        scene.addLayer(Layer.create(scene, [], 0), Layer.create(scene, [], 2));

        this._viewLoader(scene, this._plugin);

        engine.runRenderLoop(() => {
            scene.render();
            document.getElementById('app')!.innerText = `fps:${Math.round(engine.getFps()).toString()}`;
        });
    }

    getView(key: string) {
        for (let view of this._views) {
            if (view.viewKey === key) {
                return view;
            }
        }
    }

    getSheetView(): SheetView {
        return this.getView(CANVAS_VIEW_KEY.SHEET_VIEW) as SheetView;
    }

    updateToSheet(worksheet: Worksheet) {
        for (let view of this._views) {
            view.updateToSheet(worksheet);
        }
    }

    private _viewLoader(scene: Scene, plugin: Plugin) {
        CanvasViewRegistry.getData().forEach((view) => {
            this._views.push(view.initialize(scene, plugin));
        });
    }
}
