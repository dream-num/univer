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

import type { IPageElement, Nullable } from '@univerjs/core';
import type {
    BaseObject,
    IRenderModule,
} from '@univerjs/engine-render';
import type { PageID } from '../type';
import { RxDisposable } from '@univerjs/core';

import {
    IRenderManagerService,
} from '@univerjs/engine-render';
import { SlideRenderController } from './slide.render-controller';

export class CanvasView extends RxDisposable implements IRenderModule {
    constructor(
        // this controller needs by commands. root injector. T
        // That means this controller is not init by renderUnit ---> no renderContext.
        // private readonly _renderContext: IRenderContext<UnitModel>,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    private _getSlideRenderControllerFromRenderUnit(unitId: string) {
        const renderUnit = this._renderManagerService
            .getRenderById(unitId)!;
        const slideRC = renderUnit.with(SlideRenderController);
        return slideRC;
    }

    createThumbs(unitId: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        slideRC.createThumbs();
    }

    activePage(pageId: string, unitId: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        slideRC.activePage(pageId);
    }

    getRenderUnitByPageId(pageId: PageID, unitId: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        return slideRC.getPageRenderUnit(pageId);
    }

    createObjectToPage(element: IPageElement, pageID: PageID, unitId: string): Nullable<BaseObject> {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        return slideRC.createObjectToPage(element, pageID);
    }

    setObjectActiveByPage(obj: BaseObject, pageID: PageID, unitId: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        return slideRC.setObjectActiveByPage(obj, pageID);
    }

    removeObjectById(id: string, pageID: PageID, unitId: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        slideRC.removeObjectById(id, pageID);
    }

    /**
     * append blank page
     */
    appendPage(unitId: string) {
        const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
        slideRC.appendPage();
    }
}
