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

import { Disposable, Inject, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { ITabCommandParams } from '@univerjs/docs';
import { BreakLineCommand, ChangeListNestingLevelCommand, ChangeListNestingLevelType, DocAutoFormatService, EnterCommand, ListOperationCommand, TabCommand } from '@univerjs/docs';
import type { Nullable } from 'vitest';

@OnLifecycle(LifecycleStages.Rendered, DocAutoFormatController)
export class DocAutoFormatController extends Disposable {
    constructor(
        @Inject(DocAutoFormatService) private readonly _docAutoFormatService: DocAutoFormatService
    ) {
        super();

        this._initListAutoFormat();
        this._initDefaultEnterFormat();
        this._initExitListAutoFormat();
    }

    private _initListAutoFormat() {
        this.disposeWithMe(
            this._docAutoFormatService.registerAutoFormat({
                id: TabCommand.id,
                match: (context) => {
                    const { selection, paragraphs } = context;
                    // 1. match 1 bullet paragraph, range.start == paragraph.start
                    if (paragraphs.length === 1 && selection.startOffset === paragraphs[0].paragraphStart) {
                         // 2. cross paragraphs, some paragraph is bullet
                        return true;
                    } else if (paragraphs.length > 1) {
                        return true;
                    }
                    return false;
                },
                // traverse all paragraphs, set paragraph
                getMutations(context) {
                    const params = context.commandParams as Nullable<ITabCommandParams>;
                    return [{
                        id: ChangeListNestingLevelCommand.id,
                        params: {
                            type: params?.shift ? ChangeListNestingLevelType.decrease : ChangeListNestingLevelType.increase,
                        },
                    }];
                },
            })
        );
    }

    private _initExitListAutoFormat() {
        this.disposeWithMe(
            this._docAutoFormatService.registerAutoFormat({
                id: EnterCommand.id,
                match: (context) => {
                    const { paragraphs } = context;
                    // selection at empty bullet paragraph
                    if (paragraphs.length === 1 && paragraphs[0].bullet && paragraphs[0].paragraphStart === paragraphs[0].paragraphEnd) {
                        return true;
                    }
                    return false;
                },
                getMutations: (context) => {
                    const bullet = context.paragraphs[0].bullet;
                    if (!bullet) {
                        return [];
                    }

                    if (bullet.nestingLevel > 0) {
                        return [{
                            id: ChangeListNestingLevelCommand.id,
                            params: {
                                type: ChangeListNestingLevelType.decrease,
                            },
                        }];
                    }

                    return [{
                        id: ListOperationCommand.id,
                        params: {
                            listType: context.paragraphs[0].bullet!.listType,
                        },
                    }];
                },
            })
        );
    }

    private _initDefaultEnterFormat() {
        // enter default
        this.disposeWithMe(
            this._docAutoFormatService.registerAutoFormat({
                id: EnterCommand.id,
                match: () => {
                    return true;
                },
                getMutations() {
                    return [{
                        id: BreakLineCommand.id,
                    }];
                },
                priority: -9999,
            })
        );
    }
}
