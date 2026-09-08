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

import { DocBackScrollRenderController } from '../back-scroll.render-controller';

const MOBILE_CARET_MARGIN = 32;
const MOBILE_TOOLBAR_HEIGHT = 48;
const MOBILE_CARET_VIEWPORT_RATIO = 0.4;

export class MobileDocBackScrollRenderController extends DocBackScrollRenderController {
    protected override _initViewportOcclusion(): void {
        this.disposeWithMe(this._docSelectionRenderService.mobileKeyboardState$.subscribe(({ visible, inset }) => {
            const previousInset = this._mobileKeyboardInset;
            this._mobileKeyboardInset = visible ? inset + MOBILE_TOOLBAR_HEIGHT : 0;
            this._docPageLayoutService.setBottomReserve(
                visible ? this._mobileKeyboardInset + MOBILE_CARET_MARGIN : 0
            );
            if (this._mobileKeyboardInset > previousInset) {
                // Apply occlusion and caret scrolling before the same viewport change is painted.
                if (this._pendingSelectionScrollFrame != null && typeof cancelAnimationFrame !== 'undefined') {
                    cancelAnimationFrame(this._pendingSelectionScrollFrame);
                    this._pendingSelectionScrollFrame = null;
                }
                this._scrollToSelection();
            }
        }));
    }

    protected override _getVerticalScrollDelta(top: number, height: number, boundTop: number, boundBottom: number, _delta: number): number {
        const scaleY = Math.max(this._context.scene.getAncestorScale().scaleY, 0.01);
        const visibleBottom = boundBottom - this._mobileKeyboardInset / scaleY;
        if (top >= boundTop && top + height <= visibleBottom) {
            return 0;
        }
        const targetOffset = Math.max(0, visibleBottom - boundTop - height) * MOBILE_CARET_VIEWPORT_RATIO;
        return top - boundTop - targetOffset;
    }
}
