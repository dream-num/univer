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

import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { Plugin } from '@univerjs/core';
import { SheetsThreadCommentPanelService } from '../../thread-comment-ui/src/services/thread-comment-panel.service';
import { SheetsThreadCommentController } from './controllers/sheets-thread-comment.controller';
import { SheetsThreadCommentRefRangeController } from './controllers/sheets-thread-comment-ref-range.controller';
import { SheetsThreadCommentModel } from './models/sheets-thread-comment.model';
import { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';

export class SheetsThreadPlugin extends Plugin {
    constructor(
        _config: unknown,
        @Inject(Injector) readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [SheetsThreadCommentModel],
            [SheetsThreadCommentController],
            [SheetsThreadCommentRefRangeController],

            [SheetsThreadCommentPanelService],
            [SheetsThreadCommentPopupService],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });
    }
}
