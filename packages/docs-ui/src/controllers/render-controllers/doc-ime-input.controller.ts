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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';
import type { IEditorInputConfig } from '../../services/selection/doc-selection-render.service';
import {
    Disposable,
    ICommandService,
    Inject,
    Tools,
} from '@univerjs/core';

import { DocSkeletonManagerService } from '@univerjs/docs';
import { IMEInputCommand } from '../../commands/commands/ime-input.command';
import { DocIMEInputManagerService } from '../../services/doc-ime-input-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export class DocIMEInputController extends Disposable implements IRenderModule {
    private _previousIMEContent: string = '';

    private _isCompositionStart: boolean = true;

    private _onStartSubscription: Nullable<Subscription>;

    private _onUpdateSubscription: Nullable<Subscription>;

    private _onEndSubscription: Nullable<Subscription>;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocIMEInputManagerService) private readonly _docImeInputManagerService: DocIMEInputManagerService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._onStartSubscription?.unsubscribe();
        this._onUpdateSubscription?.unsubscribe();
        this._onEndSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialOnCompositionstart();

        this._initialOnCompositionUpdate();

        this._initialOnCompositionend();
    }

    private _initialOnCompositionstart() {
        this._onStartSubscription = this._docSelectionRenderService.onCompositionstart$.subscribe((config) => {
            if (config == null) {
                return;
            }

            this._resetIME();

            const { activeRange } = config;

            if (activeRange == null) {
                return;
            }

            this._docImeInputManagerService.setActiveRange(Tools.deepClone(activeRange));
        });
    }

    private _initialOnCompositionUpdate() {
        this._onUpdateSubscription = this._docSelectionRenderService.onCompositionupdate$.subscribe((config) => {
            this._updateContent(config, true);
        });
    }

    private _initialOnCompositionend() {
        this._onEndSubscription = this._docSelectionRenderService.onCompositionend$.subscribe((config) => {
            this._updateContent(config, false);
        });
    }

    private async _updateContent(config: Nullable<IEditorInputConfig>, isUpdate: boolean) {
        if (config == null) {
            return;
        }

        const unitId = this._context.unitId;

        const skeleton = this._docSkeletonManagerService.getSkeleton();

        const { event, activeRange } = config;

        if (skeleton == null || activeRange == null) {
            return;
        }

        const e = event as CompositionEvent;

        const content = e.data;

        if (content === this._previousIMEContent && isUpdate) {
            return;
        }

        await this._commandService.executeCommand(IMEInputCommand.id, {
            unitId,
            newText: content,
            oldTextLen: this._previousIMEContent.length,
            isCompositionStart: this._isCompositionStart,
            isCompositionEnd: !isUpdate,
        });

        if (isUpdate) {
            if (this._isCompositionStart) {
                this._isCompositionStart = false;
            }

            this._previousIMEContent = content;
        } else {
            this._resetIME();
        }
    }

    private _resetIME() {
        this._previousIMEContent = '';

        this._isCompositionStart = true;

        this._docImeInputManagerService.clearUndoRedoMutationParamsCache();

        this._docImeInputManagerService.setActiveRange(null);
    }
}
