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

import type { Dependency } from '@univerjs/core';
import { DependentOn, ICommandService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { SheetsThreadCommentRefRangeController } from './controllers/sheets-thread-comment-ref-range.controller';
import { SheetsThreadCommentModel } from './models/sheets-thread-comment.model';
import { SHEET_THREAD_COMMENT_BASE } from './types/const';

@DependentOn(UniverThreadCommentPlugin)
export class UniverSheetsThreadCommentPlugin extends Plugin {
    static override pluginName = SHEET_THREAD_COMMENT_BASE;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        config: unknown,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(ICommandService) protected _commandService: ICommandService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [SheetsThreadCommentModel],
            [SheetsThreadCommentRefRangeController],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        this._injector.get(SheetsThreadCommentRefRangeController);
    }
}
