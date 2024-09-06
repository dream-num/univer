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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, Inject, IUniverInstanceService } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { InsertCommand } from '../../commands/commands/core-editing.command';
import { AfterSpaceCommand } from '../../commands/commands/auto-format.command';

export class DocInputController extends Disposable implements IRenderModule {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._onInputSubscription?.unsubscribe();
    }

    private _init() {
        this._initialNormalInput();
    }

    private _initialNormalInput() {
        this._onInputSubscription = this._docSelectionRenderService.onInput$.subscribe(async (config) => {
            if (config == null) {
                return;
            }

            const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
            if (!documentModel) {
                return;
            }

            const unitId = documentModel.getUnitId();

            const { event, content = '', activeRange } = config;

            const e = event as InputEvent;

            const skeleton = this._docSkeletonManagerService.getSkeleton();

            if (e.data == null || skeleton == null) {
                return;
            }

            if (!skeleton || !activeRange) {
                return;
            }

            const { segmentId } = activeRange;

            await this._commandService.executeCommand(InsertCommand.id, {
                unitId,
                body: {
                    dataStream: content,
                },
                range: activeRange,
                segmentId,
            });

            // Space
            if (content === ' ') {
                await this._commandService.executeCommand(AfterSpaceCommand.id);
            }
        });
    }
}
