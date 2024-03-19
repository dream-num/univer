/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ISlidePage, Nullable } from '@univerjs/core';
import { IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { CanvasView } from '@univerjs/slides';
import { Inject } from '@wendellhu/redi';
import { takeUntil } from 'rxjs';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { SlideBar } from '../views/slide-bar/SlideBar';

@OnLifecycle(LifecycleStages.Rendered, SlideBarUIController)
export class SlideBarUIController extends RxDisposable {
    private _slideBar?: SlideBar;

    private _pages: ISlidePage[] = [];

    private _slideIdSet: Set<string> = new Set();

    constructor(
        @Inject(CanvasView) private readonly _canvasView: CanvasView,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initialize();
    }

    // 获取SlideBar组件
    getComponent = (ref: SlideBar) => {
        this._slideBar = ref;
        this.setSlideBar();
    };

    setSlideBar() {
        const canvasView = this._getCanvasView();
        this._slideBar!.setSlide(this._pages, () => {
            const slideBarRef = this._slideBar!.slideBarRef;
            const thumbList = slideBarRef.current?.childNodes[0].childNodes;
            canvasView.createSlidePages(thumbList, this._pages);
        });

        canvasView.getSlide()!.onSlideChangePageByNavigationObservable.add((pageId) => {
            if (this._slideBar!.state.activePageId === pageId || pageId == null) {
                return;
            }
            this._slideBar!.setState({
                activePageId: pageId,
            });
            canvasView.activePage(pageId);
        });
    }

    /**
     * Arrow functions must be used to bind `this`, otherwise `this` will be lost when the DOM component triggers the callback
     */
    addSlide = () => {
        const model = this._currentUniverService.getCurrentUniverSlideInstance();
        const canvasView = this._getCanvasView();
        const newPage = model.addPage();
        this._pages.push(newPage);

        this._slideBar!.setSlide(this._pages, () => {
            const slideBarRef = this._slideBar!.slideBarRef;
            const thumbList = slideBarRef.current?.childNodes[0].childNodes;
            canvasView.createSlidePages(thumbList, this._pages);
        });
    };

    activeSlide = (pageId: string) => {
        const canvasView = this._getCanvasView();
        canvasView.activePage(pageId);
    };

    private _initialize() {
        this._renderManagerService.createRender$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
            this._create(unitId);
        });

        this._currentUniverService.currentSlide$.pipe(takeUntil(this.dispose$)).subscribe((slideModel) => {
            this._create(slideModel?.getUnitId());
        });

        this._currentUniverService.getAllUniverSlidesInstance().forEach((slideModel) => {
            this._create(slideModel.getUnitId());
        });
    }

    private _getCanvasView() {
        return this._canvasView;
    }

    private _create(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const model = this._currentUniverService.getUniverSlideInstance(unitId);

        if (model == null) {
            return;
        }

        if (this._slideIdSet.has(unitId)) {
            return;
        }

        this._slideIdSet.add(unitId);

        const pages = model.getPages();
        const pageOrder = model.getPageOrder();
        if (!pages || !pageOrder) {
            return;
        }

        pageOrder.forEach((pageKey: string) => {
            this._pages.push(pages[pageKey]);
        });
    }
}
