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

import type { IMouseEvent, IPointerEvent } from '@univerjs/engine-render';
import { isInternalEditorID, UniverInstanceType } from '@univerjs/core';
import { fromEvent } from 'rxjs';
import { neoGetDocObject } from '../../../basics/component-tools';
import { DocSelectionRenderController } from '../doc-selection-render.controller';

export class MobileDocSelectionRenderController extends DocSelectionRenderController {
    protected override _initialMain(unitId: string): void {
        this.disposeWithMe(fromEvent<MouseEvent>(this._context.engine.getCanvasElement(), 'mousedown').subscribe((event) => {
            // A compatibility mouse event must not steal focus after a WebKit touch.
            if (event.button === 0 && this._docSelectionRenderService.isFocusing) {
                event.preventDefault();
            }
        }));
        if (isInternalEditorID(unitId)) {
            super._initialMain(unitId);
            return;
        }

        const { document, scene } = neoGetDocObject(this._context);
        this._docSelectionRenderService.exitMobileEditMode();
        this.disposeWithMe(scene.onPointerDown$.subscribeEvent((event: IPointerEvent | IMouseEvent, state) => {
            if (event.cancelable) {
                event.preventDefault();
            }
            this._startMobileGesture(event, this._docSelectionRenderService.isMobileEditMode, this._getMobileDocumentOffset(event), false);
            state.stopPropagation();
        }));
        this.disposeWithMe(document.onPointerDown$.subscribeEvent((event: IPointerEvent | IMouseEvent, state) => {
            if (this._isEditorReadOnly(unitId) || this._isEmbedInteractionEvent(event, unitId)) {
                return;
            }
            const current = this._instanceSrv.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            if (current?.getUnitId() !== unitId) {
                this._instanceSrv.setCurrentUnitForType(unitId);
            }
            if (!this._editorService.getEditorRenderConfig(unitId)?.preserveHostFocus) {
                this._instanceSrv.focusUnit(unitId);
            }
            const offset = this._getMobileDocumentOffset(event);
            this._syncEditArea(offset.offsetX, offset.offsetY);
            if (event.cancelable) {
                event.preventDefault();
            }
            this._startMobileGesture(event, this._docSelectionRenderService.isMobileEditMode, offset);
            if (event.button !== 2) {
                state.stopPropagation();
            }
        }));
    }

    protected override _focusInitialSelection(): void {
        // Reading mode must not activate the input on initial layout publication.
    }
}
