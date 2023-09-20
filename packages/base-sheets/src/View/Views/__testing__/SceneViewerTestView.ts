enum SHEET_VIEW_KEY {
    MAIN = '__SpreadsheetRender__Test',
    ROW = '__SpreadsheetRowHeader__Test',
    COLUMN = '__SpreadsheetColumnHeader__Test',
    LEFT_TOP = '__SpreadsheetLeftTopPlaceholder__Test',
}

enum CANVAS_VIEW_KEY {
    MAIN_SCENE = 'mainScene_Test',
    VIEW_MAIN = 'viewMain_Test',
    VIEW_TOP = 'viewTop_Test',
    VIEW_LEFT = 'viewLeft_Test',
    VIEW_LEFT_TOP = 'viewLeftTop_Test',
    SHEET_VIEW = 'sheetView_Test',
    DRAG_LINE_VIEW = 'dragLineView_Test',
}

// export class SceneViewerTestView extends BaseView {
//     protected _initialize() {
//         const mainScene = this.getScene();

//         const context = this.getContext();
//         const workbook = context.getWorkBook();
//         const worksheet = workbook.getActiveSheet();

//         const sv = new SceneViewer('sceneViewer1', {
//             left: 200,
//             top: 200,
//             width: 500,
//             height: 300,
//             zIndex: 10,
//             isTransformer: true,
//         });
//         const scene = new Scene('testSceneViewer', sv, {
//             width: 800,
//             height: 800,
//         });

//         const spreadsheetSkeleton = this._buildSkeleton();
//         const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

//         this._updateViewport(rowHeaderWidth, columnHeaderHeight, scene);

//         const spreadsheet = new Spreadsheet('testSheetViewer', spreadsheetSkeleton, false);
//         const spreadsheetRowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW, spreadsheetSkeleton);
//         const spreadsheetColumnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN, spreadsheetSkeleton);
//         const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
//             zIndex: 2,
//             left: -1,
//             top: -1,
//             width: rowHeaderWidth,
//             height: columnHeaderHeight,
//             fill: getColor([248, 249, 250]),
//             stroke: getColor([217, 217, 217]),
//             strokeWidth: 1,
//         });

//         spreadsheet.zIndex = 10;

//         const allWidth = this._columnWidthByTitle(worksheet) + columnTotalWidth + 100;

//         const allHeight = this._rowHeightByTitle(worksheet) + rowTotalHeight + 500;

//         const rect3 = new Rect('purple1', {
//             top: 0,
//             left: 0,
//             width: allWidth + 100,
//             height: allHeight,
//             fill: 'rgba(255,255,255, 1)',
//             zIndex: 1,
//         });
//         // rect3.on(EVENT_TYPE.PointerEnter, () => {
//         //     // this.fill = 'rgba(220,11,19, 0.8)';
//         //     console.log('PointerEnter11112312313123132');
//         //     rect3.setProps({
//         //         fill: 'rgba(220,11,19, 0.8)',
//         //     });
//         //     rect3.makeDirty(true);
//         // });
//         // rect3.on(EVENT_TYPE.PointerLeave, () => {
//         //     console.log('PointerLeave11112312313123132');
//         //     // this.fill = 'rgba(100,110,99, 0.8)';
//         //     rect3.setProps({
//         //         fill: 'rgba(100,110,99, 0.8)',
//         //     });
//         //     rect3.makeDirty(true);
//         // });

//         scene.addLayer(new Layer(scene, [spreadsheet, rect3]));

//         // scene.addLayer(new Layer(scene, [spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder], 2);

//         scene.addObjects([spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder], 2);
//         scene.transformByState({
//             width: allWidth,
//             height: allHeight,
//         });

//         // spreadsheet.enableSelection();

//         mainScene.addObject(sv);
//     }

//     private _updateViewport(rowHeaderWidth: number, columnHeaderHeight: number, scene: Scene) {
//         const mainScene = this.getScene();
//         const rowHeaderWidthScale = rowHeaderWidth * scene.scaleX;
//         const columnHeaderHeightScale = columnHeaderHeight * scene.scaleY;

//         const viewMain = new Viewport(CANVAS_VIEW_KEY.VIEW_MAIN, scene, {
//             left: rowHeaderWidthScale,
//             top: columnHeaderHeightScale,
//             bottom: 0,
//             right: 0,
//             isWheelPreventDefaultX: true,
//         });
//         const viewTop = new Viewport(CANVAS_VIEW_KEY.VIEW_TOP, scene, {
//             left: rowHeaderWidthScale,
//             height: columnHeaderHeightScale,
//             top: 0,
//             right: 0,
//             isWheelPreventDefaultX: true,
//         });
//         const viewLeft = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT, scene, {
//             left: 0,
//             bottom: 0,
//             top: columnHeaderHeightScale,
//             width: rowHeaderWidthScale,
//             isWheelPreventDefaultX: true,
//         });
//         const viewLeftTop = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP, scene, {
//             left: 0,
//             top: 0,
//             width: rowHeaderWidthScale,
//             height: columnHeaderHeightScale,
//             isWheelPreventDefaultX: true,
//         });
//         // viewMain.linkToViewport(viewLeft, LINK_VIEW_PORT_TYPE.Y);
//         // viewMain.linkToViewport(viewTop, LINK_VIEW_PORT_TYPE.X);
//         viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
//             const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

//             viewTop
//                 .updateScroll({
//                     scrollX,
//                     actualScrollX,
//                 })
//                 .makeDirty(true);

//             viewLeft
//                 .updateScroll({
//                     scrollY,
//                     actualScrollY,
//                 })
//                 .makeDirty(true);
//         });

//         scene.addViewport(viewMain, viewLeft, viewTop, viewLeftTop).attachControl();

//         const scrollbar = new ScrollBar(viewMain, {
//             mainScene,
//         });

//         // 鼠标滚轮缩放
//         scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
//             const e = evt as IWheelEvent;
//             if (e.ctrlKey) {
//                 const deltaFactor = Math.abs(e.deltaX);
//                 let scrollNum = deltaFactor < 40 ? 0.05 : deltaFactor < 80 ? 0.02 : 0.01;
//                 scrollNum *= e.deltaY > 0 ? -1 : 1;
//                 if (scene.scaleX < 1) {
//                     scrollNum /= 2;
//                 }

//                 if (scene.scaleX + scrollNum > 4) {
//                     scene.scale(4, 4);
//                 } else if (scene.scaleX + scrollNum < 0.1) {
//                     scene.scale(0.1, 0.1);
//                 } else {
//                     scene.scaleBy(scrollNum, scrollNum);
//                     e.preventDefault();
//                 }
//             } else {
//                 viewMain.onMouseWheel(e, state);
//             }
//         });
//     }

//     private _buildSkeleton() {
//         const context = this.getContext();
//         const workbook = context.getWorkBook();
//         let worksheet = workbook.getActiveSheet();
//         if (!worksheet) {
//             worksheet = workbook.getSheets()[0];
//         }
//         const config = worksheet.getConfig();
//         // const { rowHeader, ccolumnHeader} = config;
//         const spreadsheetSkeleton = SpreadsheetSkeleton.create(
//             config,
//             worksheet.getCellMatrix(),
//             workbook.getStyles(),
//             context
//         );

//         return spreadsheetSkeleton;
//     }

//     private _rowHeightByTitle(worksheet: Worksheet) {
//         const config = worksheet?.getConfig();
//         const columnHeader = config?.columnHeader.height || 0;
//         return columnHeader;
//     }

//     private _columnWidthByTitle(worksheet: Worksheet) {
//         const config = worksheet?.getConfig();
//         const rowHeader = config?.rowHeader.width || 0;
//         return rowHeader;
//     }
// }

// // CanvasViewRegistry.add(SceneViewerTestView);

// export class SceneViewerTestViewFactory {
//     /**
//      * Generate SceneViewerTestView Instance
//      * @param scene
//      * @param plugin
//      * @returns
//      */
//     create(scene: Scene, plugin: SheetPlugin): SceneViewerTestView {
//         return new SceneViewerTestView().initialize(scene, plugin);
//     }
// }
// // CanvasViewRegistry.add(new SceneViewerTestViewFactory());
