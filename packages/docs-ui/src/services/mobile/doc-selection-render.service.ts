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

import { isInternalEditorID } from '@univerjs/core';
import { DocSelectionRenderService } from '../selection/doc-selection-render.service';

const MOBILE_INPUT_VIEWPORT_INSET = 1;

export class MobileDocSelectionRenderService extends DocSelectionRenderService {
    protected override _positionInput(_x: number, _y: number) {
        // Keep the hidden editor inside the Portal subtree when possible to avoid focus-trap loops,
        // then compensate coordinates if a transformed ancestor changes the fixed containing block.
        this._ensureHostContainer();
        this._container.style.position = 'fixed';
        const visualViewport = typeof window === 'undefined' ? null : window.visualViewport;
        let left = MOBILE_INPUT_VIEWPORT_INSET;
        let top = MOBILE_INPUT_VIEWPORT_INSET;
        const fixedContainer = this._container.offsetParent;
        if (fixedContainer) {
            const rect = fixedContainer.getBoundingClientRect();
            left -= rect.left;
            top -= rect.top;
        } else {
            left += visualViewport?.offsetLeft ?? 0;
            top += visualViewport?.offsetTop ?? 0;
        }

        this._container.style.left = `${left}px`;
        this._container.style.top = `${top}px`;
        this._container.style.zIndex = '1000';
    }

    protected override _syncMobileSelectionVisuals(): void {
        const activeRange = this._getActiveRangeInstance();
        for (const range of this._rangeList) {
            range.setCaretVisible(this.isEditing && range === activeRange);
            range.hideMobileHandles();
        }

        if (!activeRange || activeRange.collapsed || this.isEditing) {
            return;
        }

        activeRange.showMobileHandles(
            this._mobileSelectionHandleColor,
            (handle, event) => this._startMobileSelectionHandleDrag(handle, event)
        );
    }

    protected override _initMobileKeyboardViewport(): void {
        if (
            typeof window === 'undefined' ||
            !window.visualViewport
        ) {
            return;
        }

        const visualViewport = window.visualViewport;
        this._mobileViewportBaselineHeight = visualViewport.height;
        this._mobileViewportBaselineBottom = visualViewport.offsetTop + visualViewport.height;
        this._mobileViewportBaselineWidth = visualViewport.width;
        const update = () => this._updateMobileKeyboardState(visualViewport);
        visualViewport.addEventListener('resize', update);
        visualViewport.addEventListener('scroll', update);
        this.disposeWithMe({
            dispose: () => {
                visualViewport.removeEventListener('resize', update);
                visualViewport.removeEventListener('scroll', update);
            },
        });
    }

    protected override _updateInputPosition({ forceFocus = false, preserveFocus = false } = {}): void {
        if (!forceFocus && !isInternalEditorID(this._context.unitId)) {
            // Formatting may refresh selection without reopening the software keyboard.
            this._positionInput(0, 0);
            return;
        }
        super._updateInputPosition({ forceFocus, preserveFocus });
    }

    protected override _handleInputBlur(event: Event): void {
        if (this.isEditing) {
            this._pendingMobileBlurEvent = event;
            return;
        }
        super._handleInputBlur(event);
    }
}
