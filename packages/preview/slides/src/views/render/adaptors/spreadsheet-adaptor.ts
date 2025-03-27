/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { EventState, IPageElement } from '@univerjs/core';
import type { IScrollObserverParam, IWheelEvent } from '@univerjs/engine-render';
import { IConfigService, IContextService, Inject, Injector, LocaleService, PageElementType, Styles, Worksheet } from '@univerjs/core';
import {
    getColor,
    Rect,
    Scene,
    SceneViewer,
    ScrollBar,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    SpreadsheetSkeleton,
    Viewport,
} from '@univerjs/engine-render';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../adaptor';

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

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IContextService private readonly _contextService: IContextService,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    override check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    override convert(pageElement: IPageElement, mainScene: Scene) {
        const {
            id,
            zIndex,
            left = 0,
            top = 0,
            width,
            height,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            spreadsheet: spreadsheetModel,
        } = pageElement;

        if (spreadsheetModel == null) {
            return;
        }

        const { worksheet, styles } = spreadsheetModel;

        const styleModel = new Styles(styles);
        const spreadsheetSkeleton = new SpreadsheetSkeleton(
            new Worksheet(id, worksheet, styleModel), // FIXME: worksheet in slide doesn't has a Worksheet object
            styleModel,
            this._localeService,
            this._contextService,
            this._configService,
            this._injector
        );

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        const allWidth = columnTotalWidth + worksheet.rowHeader.width || 0;
        const allHeight = rowTotalHeight + worksheet.columnHeader.height || 0;

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
            forceRender: true,
        });
        const scene = new Scene(SHEET_VIEW_KEY.SCENE + id, sv, {
            width: allWidth,
            height: allHeight,
        });

        this._updateViewport(id, rowHeaderWidth, columnHeaderHeight, scene, mainScene);

        const spreadsheet = new Spreadsheet('testSheetViewer', spreadsheetSkeleton, false);
        const spreadsheetRowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW, spreadsheetSkeleton);
        const spreadsheetColumnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN, spreadsheetSkeleton);
        const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
            zIndex: 2,
            left: -1,
            top: -1,
            width: rowHeaderWidth,
            height: columnHeaderHeight,
            fill: getColor([248, 249, 250]),
            stroke: getColor([217, 217, 217]),
            strokeWidth: 1,
        });

        spreadsheet.zIndex = 10;
        scene.addObjects([spreadsheet], 1);
        scene.addObjects([spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder], 2);
        // spreadsheet.enableSelection();
        return sv;
    }

    // eslint-disable-next-line max-lines-per-function
    private _updateViewport(
        id: string,
        rowHeaderWidth: number,
        columnHeaderHeight: number,
        scene: Scene,
        mainScene: Scene
    ) {
        if (mainScene == null) {
            return;
        }
        const rowHeaderWidthScale = rowHeaderWidth * scene.scaleX;
        const columnHeaderHeightScale = columnHeaderHeight * scene.scaleY;

        const viewMain = new Viewport(SHEET_VIEW_KEY.VIEW_MAIN + id, scene, {
            left: rowHeaderWidthScale,
            top: columnHeaderHeightScale,
            bottom: 0,
            right: 0,
            explicitViewportWidthSet: false,
            explicitViewportHeightSet: false,
            isWheelPreventDefaultX: true,
        });
        const viewTop = new Viewport(SHEET_VIEW_KEY.VIEW_TOP + id, scene, {
            left: rowHeaderWidthScale,
            height: columnHeaderHeightScale,
            top: 0,
            right: 0,
            explicitViewportWidthSet: false,
            isWheelPreventDefaultX: true,
        });
        const viewLeft = new Viewport(SHEET_VIEW_KEY.VIEW_LEFT + id, scene, {
            left: 0,
            bottom: 0,
            top: columnHeaderHeightScale,
            width: rowHeaderWidthScale,
            explicitViewportHeightSet: false,
            isWheelPreventDefaultX: true,
        });

        const VIEW_LEFT_TOP = new Viewport(SHEET_VIEW_KEY.VIEW_LEFT_TOP + id, scene, {
            left: 0,
            top: 0,
            width: rowHeaderWidthScale,
            height: columnHeaderHeightScale,
            isWheelPreventDefaultX: true,
        });
        // viewMain.linkToViewport(viewLeft, LINK_VIEW_PORT_TYPE.Y);
        // viewMain.linkToViewport(viewTop, LINK_VIEW_PORT_TYPE.X);
        viewMain.onScrollAfter$.subscribeEvent((param: IScrollObserverParam) => {
            const { scrollX, scrollY, viewportScrollX, viewportScrollY } = param;

            viewTop
                .updateScrollVal({
                    scrollX,
                    viewportScrollX,
                });

            viewLeft
                .updateScrollVal({
                    scrollY,
                    viewportScrollY,
                });
        });

        scene.attachControl();

        const scrollbar = new ScrollBar(viewMain, {
            mainScene,
        });

        // 鼠标滚轮缩放
        scene.onMouseWheel$.subscribeEvent((evt: unknown, state: EventState) => {
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
