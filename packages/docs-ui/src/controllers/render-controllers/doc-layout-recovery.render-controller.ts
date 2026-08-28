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

import type { DocumentDataModel, IDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject, RxDisposable, toDisposable } from '@univerjs/core';
import { DocLayoutExecutorService, DocLayoutExecutorState } from '@univerjs/docs';
import { IShortcutService } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { DocCanvasPopManagerService } from '../../services/doc-popup-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { DOC_LAYOUT_RECOVERY_COMPONENT } from '../../views/DocLayoutRecovery';

export function acquireDocLayoutRecoveryInteractionLock(
    canvas: HTMLElement,
    shortcutService: Pick<IShortcutService, 'forceDisable'>,
    blurSelection: () => void
): IDisposable {
    const previousPointerEvents = canvas.style.pointerEvents;
    const previousOpacity = canvas.style.opacity;
    const previousAriaBusy = canvas.getAttribute('aria-busy');
    const shortcutLock = shortcutService.forceDisable();

    blurSelection();
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.55';
    canvas.setAttribute('aria-busy', 'true');

    return toDisposable(() => {
        shortcutLock.dispose();
        canvas.style.pointerEvents = previousPointerEvents;
        canvas.style.opacity = previousOpacity;
        if (previousAriaBusy == null) {
            canvas.removeAttribute('aria-busy');
        } else {
            canvas.setAttribute('aria-busy', previousAriaBusy);
        }
    });
}

export class DocLayoutRecoveryRenderController extends RxDisposable implements IRenderModule {
    private _popup: IDisposable | null = null;
    private _interactionLock: IDisposable | null = null;
    private _visible = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocLayoutExecutorService) private readonly _layoutExecutorService: DocLayoutExecutorService,
        @Inject(DocCanvasPopManagerService) private readonly _docPopupManagerService: DocCanvasPopManagerService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._layoutExecutorService.executorStatus$.pipe(takeUntil(this.dispose$)).subscribe((status) => {
            const recovering = status.state === DocLayoutExecutorState.RECOVERING &&
                status.recoveryUnitId === this._context.unitId;
            if (recovering) {
                this._show();
            } else {
                this._hide();
            }
        });
    }

    override dispose(): void {
        this._hide();
        super.dispose();
    }

    private _show(): void {
        if (this._visible) {
            return;
        }

        const canvas = this._context.engine.getCanvasElement();
        this._visible = true;

        try {
            this._interactionLock = acquireDocLayoutRecoveryInteractionLock(
                canvas,
                this._shortcutService,
                () => this._docSelectionRenderService.blur()
            );
            this._popup = this._docPopupManagerService.attachPopupToRect(
                () => ({
                    left: this._context.scene.width / 2,
                    right: this._context.scene.width / 2,
                    top: this._context.scene.height / 2,
                    bottom: this._context.scene.height / 2,
                }),
                {
                    componentKey: DOC_LAYOUT_RECOVERY_COMPONENT,
                    customActive: true,
                    direction: 'vertical-center',
                    zIndex: 1021,
                },
                this._context.unitId
            );
        } catch {
            this._restoreInteraction();
        }
    }

    private _hide(): void {
        if (!this._visible) {
            return;
        }

        this._popup?.dispose();
        this._popup = null;
        this._restoreInteraction();
    }

    private _restoreInteraction(): void {
        this._interactionLock?.dispose();
        this._interactionLock = null;
        this._visible = false;
    }
}
