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

import type { DocumentDataModel, ICustomRange, Nullable } from '@univerjs/core';
import { Disposable, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService, VIEWPORT_KEY } from '@univerjs/docs';
import type { Documents, IMouseEvent, IPointerEvent, Viewport } from '@univerjs/engine-render';
import { IRenderManagerService, PageLayoutType, Vector2 } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';

export class DocHoverManagerService extends Disposable {
    private readonly _activeCustomRanges$ = new BehaviorSubject<ICustomRange[]>([]);
    readonly activeCustomRanges$ = this._activeCustomRanges$.asObservable();

    private readonly _activeIndex$ = new BehaviorSubject<Nullable<number>>(null);
    readonly activeIndex$ = this._activeIndex$.asObservable();

    private _scrolling = false;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this.disposeWithMe(() => {
            this._activeCustomRanges$.complete();
            this._activeIndex$.complete();
        });
    }

    private _getTransformCoordForDocumentOffset(document: Documents, viewport: Viewport, evtOffsetX: number, evtOffsetY: number) {
        const { documentTransform } = document.getOffsetConfig();
        const originCoord = viewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        if (!originCoord) {
            return;
        }

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _calcActiveCustomRanges(offsetX: number, offsetY: number) {
        const document = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document) {
            this._activeCustomRanges$.next([]);
            return;
        }

        const currentRender = this._renderManagerService.getRenderById(document.getUnitId());

        if (!currentRender) {
            return null;
        }
        const documentComponent = currentRender.mainComponent as Documents;
        const skeleton = currentRender.with(DocSkeletonManagerService).getSkeleton();
        const { pageLayoutType = PageLayoutType.VERTICAL, pageMarginLeft, pageMarginTop, docsLeft, docsTop } = documentComponent.getOffsetConfig();
        const coord = this._getTransformCoordForDocumentOffset(
            documentComponent,
            currentRender.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!,
            offsetX,
            offsetY
        );
        if (!coord) {
            return;
        }
        const node = skeleton.findNodeByCoord(
            coord,
            pageLayoutType,
            pageMarginLeft,
            pageMarginTop
        );
        if (node && node.node) {
            const left = node.node.left + pageMarginLeft;
            const right = node.node.left + node.node.width + pageMarginLeft;
            if (coord.x < left || coord.x > right) {
                this._activeIndex$.next(null);
                this._activeCustomRanges$.next([]);
                return;
            }

            const index = node.node.parent!.st! + node.node.parent!.glyphGroup.indexOf(node.node)!;
            if (index !== this._activeIndex$.value) {
                this._activeIndex$.next(index);
            }

            const ranges = document.getCustomRanges()?.filter((range) => range.startIndex <= index && range.endIndex >= index) ?? [];
            const currentRanges = this._activeCustomRanges$.value;
            if (currentRanges.length === ranges.length && currentRanges.every((range, i) => range.rangeId === ranges[i].rangeId)) {
                return;
            }

            this._activeCustomRanges$.next(ranges);
        }
    }

    onMouseMove(evt: IPointerEvent | IMouseEvent) {
        if (this._scrolling) {
            return;
        }
        const { offsetX, offsetY } = evt;
        this._calcActiveCustomRanges(offsetX, offsetY);
    }

    startScroll() {
        if (this._scrolling) {
            return;
        }
        this._scrolling = true;
    }

    endScroll() {
        this._scrolling = false;
    }
}
