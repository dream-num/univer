import {
    EVENT_TYPE,
    getColor,
    IScrollObserverParam,
    IWheelEvent,
    Rect,
    Scene,
    SceneViewer,
    ScrollBar,
    Spreadsheet,
    SpreadsheetColumnTitle,
    SpreadsheetRowTitle,
    SpreadsheetSkeleton,
    Viewport,
} from '@univerjs/base-render';
import { EventState, ICellData, IPageElement, ObjectMatrix, PageElementType, Styles, Injector, LocaleService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { ObjectAdaptor, CanvasObjectProviderRegistry } from '../Adaptor';

enum SHEET_VIEW_KEY {
    MAIN = 'spreadInSlide',
    SCENE = 'spreadInSlideScene',
    SCENE_VIEWER = 'spreadInSlideSceneViewer',
    ROW = 'spreadInSlideRow',
    COLUMN = 'spreadInSlideColumn',
    LEFT_TOP = 'spreadInSlideLeftTop',
    VIEW_MAIN = 'spreadInSlideViewMain',
    VIEW_TOP = 'spreadInSlideViewTop',
    VIEW_LEFT = 'spreadInSlideViewLeft',
    VIEW_LEFT_TOP = 'spreadInSlideViewLeftTop',
}

export class SpreadsheetAdaptor extends ObjectAdaptor {
    override zIndex = 4;

    override viewKey = PageElementType.SPREADSHEET;

    constructor(@Inject(LocaleService) private readonly _localeService: LocaleService) {
        super();
    }

    override check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    override convert(pageElement: IPageElement, mainScene: Scene) {
        const { id, zIndex, left = 0, top = 0, width, height, angle, scaleX, scaleY, skewX, skewY, flipX, flipY, title, description, spreadsheet: spreadsheetModel } = pageElement;

        if (spreadsheetModel == null) {
            return;
        }

        const { worksheet, styles } = spreadsheetModel;

        const { columnData, rowData, cellData } = worksheet;

        const cellDataMatrix = new ObjectMatrix<ICellData>(cellData);

        const spreadsheetSkeleton = SpreadsheetSkeleton.create(worksheet, cellDataMatrix, new Styles(styles), this._localeService);

        const { rowTotalHeight, columnTotalWidth, rowTitleWidth, columnTitleHeight } = spreadsheetSkeleton;

        const allWidth = columnTotalWidth + worksheet.rowTitle.width || 0;

        const allHeight = rowTotalHeight + worksheet.columnTitle.height || 0;

        const sv = new SceneViewer(SHEET_VIEW_KEY.SCENE_VIEWER + id, {
            top,
            left,
            width,
            height,
            zIndex,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            isTransformer: true,
            forceRender: true,
        });
        const scene = new Scene(SHEET_VIEW_KEY.SCENE + id, sv, {
            width: allWidth,
            height: allHeight,
        });

        this._updateViewport(id, rowTitleWidth, columnTitleHeight, scene, mainScene);

        const spreadsheet = new Spreadsheet('testSheetViewer', spreadsheetSkeleton, false);
        const spreadsheetRowTitle = new SpreadsheetRowTitle(SHEET_VIEW_KEY.ROW, spreadsheetSkeleton);
        const spreadsheetColumnTitle = new SpreadsheetColumnTitle(SHEET_VIEW_KEY.COLUMN, spreadsheetSkeleton);
        const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
            zIndex: 2,
            left: -1,
            top: -1,
            width: rowTitleWidth,
            height: columnTitleHeight,
            fill: getColor([248, 249, 250]),
            stroke: getColor([217, 217, 217]),
            strokeWidth: 1,
        });

        spreadsheet.zIndex = 10;
        scene.addObjects([spreadsheet], 1);
        scene.addObjects([spreadsheetRowTitle, spreadsheetColumnTitle, SpreadsheetLeftTopPlaceholder], 2);
        spreadsheet.enableSelection();
        return sv;
    }

    private _updateViewport(id: string, rowTitleWidth: number, columnTitleHeight: number, scene: Scene, mainScene: Scene) {
        if (mainScene == null) {
            return;
        }
        const rowTitleWidthScale = rowTitleWidth * scene.scaleX;
        const columnTitleHeightScale = columnTitleHeight * scene.scaleY;

        const viewMain = new Viewport(SHEET_VIEW_KEY.VIEW_MAIN + id, scene, {
            left: rowTitleWidthScale,
            top: columnTitleHeightScale,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewTop = new Viewport(SHEET_VIEW_KEY.VIEW_TOP + id, scene, {
            left: rowTitleWidthScale,
            height: columnTitleHeightScale,
            top: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewLeft = new Viewport(SHEET_VIEW_KEY.VIEW_LEFT + id, scene, {
            left: 0,
            bottom: 0,
            top: columnTitleHeightScale,
            width: rowTitleWidthScale,
            isWheelPreventDefaultX: true,
        });
        const viewLeftTop = new Viewport(SHEET_VIEW_KEY.VIEW_LEFT_TOP + id, scene, {
            left: 0,
            top: 0,
            width: rowTitleWidthScale,
            height: columnTitleHeightScale,
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

        scene.addViewport(viewMain, viewLeft, viewTop, viewLeftTop).attachControl();

        const scrollbar = new ScrollBar(viewMain, {
            mainScene,
        });

        // 鼠标滚轮缩放
        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.05 : deltaFactor < 80 ? 0.02 : 0.01;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });
    }
}

export class SpreadsheetAdaptorFactory {
    readonly zIndex = 4;

    create(injector: Injector): SpreadsheetAdaptor {
        const spreadsheetAdaptor = injector.createInstance(SpreadsheetAdaptor);
        return spreadsheetAdaptor;
    }
}

CanvasObjectProviderRegistry.add(new SpreadsheetAdaptorFactory());
