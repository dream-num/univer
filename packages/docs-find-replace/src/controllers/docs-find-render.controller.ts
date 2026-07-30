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

import type { Nullable } from '@univerjs/core';
import type { DocSkeletonManagerService } from '@univerjs/docs';

import type { Documents, ITextSelectionStyle } from '@univerjs/engine-render';
import type { DocsFindModel } from '../models/docs-find.model';
import { ColorKit, Disposable, Inject, ThemeService, toDisposable } from '@univerjs/core';
import { DocBackScrollRenderController, getTextRangeFromCharIndex } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { merge } from 'rxjs';

export class DocsFindRenderController extends Disposable {
    private readonly _highlights: Array<{ dispose(): void }> = [];

    constructor(
        private readonly _model: DocsFindModel,
        private readonly _skeletonManager: DocSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this.disposeWithMe(toDisposable(merge(
            this._model.matchesUpdate$,
            this._skeletonManager.currentSkeleton$
        ).subscribe(() => this._refreshHighlights())));
        this.disposeWithMe(toDisposable(this._model.currentMatchChanged$.subscribe(({ match, shouldScroll }) => {
            if (match && shouldScroll) {
                this._renderManagerService.getRenderUnitById(this._model.unitId)
                    ?.with(DocBackScrollRenderController)
                    .scrollToRange(match.range);
            }
            this._refreshHighlights();
        })));
    }

    override dispose(): void {
        this._disposeHighlights();
        super.dispose();
    }

    private _refreshHighlights(): void {
        this._disposeHighlights();
        const render = this._renderManagerService.getRenderUnitById(this._model.unitId);
        const skeleton = this._skeletonManager.getSkeleton();
        const document = render?.mainComponent as Nullable<Documents>;
        if (!render || !skeleton || !document) return;

        const color = this._themeService.getColorFromTheme('yellow.400');
        const passiveStyle: ITextSelectionStyle = {
            strokeWidth: 0,
            stroke: 'rgba(0,0,0,0)',
            strokeActive: 'rgba(0,0,0,0)',
            fill: new ColorKit(color).setAlpha(0.3).toRgbString(),
        };
        const activeStyle: ITextSelectionStyle = {
            ...passiveStyle,
            fill: new ColorKit(color).setAlpha(0.65).toRgbString(),
        };

        const currentMatch = this._model.currentMatch;
        this._model.getMatches().forEach((match) => {
            const range = getTextRangeFromCharIndex(
                match.range.startOffset,
                match.range.endOffset,
                render.scene,
                document,
                skeleton,
                match === currentMatch ? activeStyle : passiveStyle,
                '',
                -1
            );
            if (range) this._highlights.push(range);
        });
    }

    private _disposeHighlights(): void {
        this._highlights.forEach((highlight) => highlight.dispose());
        this._highlights.length = 0;
    }
}
