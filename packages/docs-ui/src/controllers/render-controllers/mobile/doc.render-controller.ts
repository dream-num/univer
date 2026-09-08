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

import { DocumentFlavor, fromEventSubject } from '@univerjs/core';
import { animationFrameScheduler, takeUntil, throttleTime } from 'rxjs';
import { DocRenderController } from '../doc.render-controller';

const MOBILE_DOC_OUTER_MARGIN = 12;

export class MobileDocRenderController extends DocRenderController {
    protected override _shouldEnableHorizontalScrollBar(): boolean {
        return this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN &&
            super._shouldEnableHorizontalScrollBar();
    }

    protected override _getMobileModernLayoutOptions() {
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN) {
            return {};
        }

        const parentWidth = this._context.scene.getParent()?.width;
        const availableWidth = parentWidth != null && parentWidth > 1 ? parentWidth : this._context.engine.width;
        if (!Number.isFinite(availableWidth) || availableWidth <= MOBILE_DOC_OUTER_MARGIN * 2) {
            return {};
        }

        return {
            modernPageWidth: availableWidth - MOBILE_DOC_OUTER_MARGIN * 2,
            modernHorizontalMargin: super._getHorizontalPageMargin(),
        };
    }

    protected override _initMobileResponsiveLayout(): void {
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN) {
            return;
        }

        this.disposeWithMe(fromEventSubject(this._context.engine.onTransformChange$).pipe(
            throttleTime(0, animationFrameScheduler),
            takeUntil(this.dispose$)
        ).subscribe(() => {
            const modernPageWidth = this._getMobileModernLayoutOptions().modernPageWidth;
            if (modernPageWidth == null || Math.abs(modernPageWidth - (this._mobileModernPageWidth ?? 0)) < 1) {
                return;
            }
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            if (skeleton) {
                this._scheduleLayout(this._context.unitId, skeleton, { reason: 'initial' });
            }
        }));
    }

    protected override _getHorizontalPageMargin(): number {
        return MOBILE_DOC_OUTER_MARGIN;
    }
}
