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
import { ICommandService, UniverInstanceType } from '@univerjs/core';
import { ThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { SheetsThreadCommentController } from './controllers/sheets-thread-comment.controller';
import { SheetsThreadCommentRefRangeController } from './controllers/sheets-thread-comment-ref-range.controller';
import { SheetsThreadCommentModel } from './models/sheets-thread-comment.model';
import { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';
import { ShowAddSheetCommentModalOperation } from './commands/operations/comment.operation';
import { SheetsThreadCommentRenderController } from './controllers/sheets-thread-comment-render.controller';

export const SHEETS_THREAD_COMMENT = 'SHEETS_THREAD_COMMENT';

export class UniverSheetsThreadCommentPlugin extends ThreadCommentUIPlugin {
    static override pluginName = SHEETS_THREAD_COMMENT;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        _config: unknown,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(ICommandService) protected override _commandService: ICommandService
    ) {
        super(_config, _injector, _commandService);
    }

    override onStarting(injector: Injector): void {
        super.onStarting(injector);
        ([
            [SheetsThreadCommentModel],
            [SheetsThreadCommentController],
            [SheetsThreadCommentRefRangeController],
            [SheetsThreadCommentRenderController],

            [SheetsThreadCommentPopupService],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        [ShowAddSheetCommentModalOperation].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
