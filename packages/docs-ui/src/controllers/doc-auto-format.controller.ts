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

import type { Nullable } from 'vitest';
import type { ITabCommandParams } from '../commands/commands/auto-format.command';
import { Disposable, Inject, QuickListTypeMap } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { AfterSpaceCommand, EnterCommand, TabCommand } from '../commands/commands/auto-format.command';
import { BreakLineCommand } from '../commands/commands/break-line.command';
import { ChangeListNestingLevelCommand, ChangeListNestingLevelType, ListOperationCommand, QuickListCommand } from '../commands/commands/list.command';
import { QUICK_HEADING_MAP, QuickHeadingCommand } from '../commands/commands/set-heading.command';
import { DocTableTabCommand } from '../commands/commands/table/doc-table-tab.command';
import { DocAutoFormatService } from '../services/doc-auto-format.service';
import { isInSameTableCellData } from '../services/selection/convert-rect-range';

export class DocAutoFormatController extends Disposable {
    constructor(
        @Inject(DocAutoFormatService) private readonly _docAutoFormatService: DocAutoFormatService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initListTabAutoFormat();
        this._initSpaceAutoFormat();
        this._initDefaultEnterFormat();
        this._initExitListAutoFormat();
    }

    private _initListTabAutoFormat() {
        this.disposeWithMe(
            this._docAutoFormatService.registerAutoFormat({
                id: TabCommand.id,
                match: (context) => {
                    const { selection, paragraphs, unit } = context;

                    // 1. match 1 bullet paragraph, range.start == paragraph.start
                    if (paragraphs.length === 1 && selection.startOffset === paragraphs[0].paragraphStart && paragraphs[0].bullet) {
                        // 2. cross paragraphs, some paragraph is bullet
                        const allParagraphs = unit.getBody()?.paragraphs;
                        // 3. disable first bullet indent
                        const bulletParagraphs = allParagraphs?.filter((p) => p.bullet?.listId === paragraphs[0].bullet!.listId);
                        if (bulletParagraphs?.findIndex((p) => p.startIndex === paragraphs[0].startIndex) === 0) {
                            return false;
                        }
                        return true;
                    } else if (paragraphs.length > 1 && paragraphs.some((p) => p.bullet)) {
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
                priority: 100,
            })
        );

        this.disposeWithMe(
            this._docAutoFormatService.registerAutoFormat({
                id: TabCommand.id,
                match: (context) => {
                    const { selection, unit } = context;

                    const { startNodePosition, endNodePosition } = selection;

                    const renderObject = this._renderManagerService.getRenderById(unit.getUnitId());
                    const skeleton = renderObject?.with(DocSkeletonManagerService).getSkeleton();

                    if (skeleton == null) {
                        return false;
                    }

                    if (startNodePosition && endNodePosition && isInSameTableCellData(skeleton, startNodePosition, endNodePosition)) {
                        return true;
                    }

                    if (startNodePosition && !endNodePosition && startNodePosition.path.indexOf('cells') > -1) {
                        return true;
                    }

                    return false;
                },

                getMutations(context) {
                    const params = context.commandParams as Nullable<ITabCommandParams>;
                    return [{
                        id: DocTableTabCommand.id,
                        params: {
                            shift: !!params?.shift,
                        },
                    }];
                },
                priority: 99,
            })
        );
    }

    private _initSpaceAutoFormat() {
        this.disposeWithMe(
            this._docAutoFormatService.registerAutoFormat({
                id: AfterSpaceCommand.id,
                match: (context) => {
                    const { selection, paragraphs, unit } = context;
                    if (!selection.collapsed) {
                        return false;
                    }
                    if (paragraphs.length !== 1) {
                        return false;
                    }
                    if (!selection.collapsed) {
                        return false;
                    }
                    const text = unit.getBody()?.dataStream.slice(paragraphs[0].paragraphStart, selection.startOffset - 1);
                    if (text && (Object.keys(QuickListTypeMap).includes(text) || Object.keys(QUICK_HEADING_MAP).includes(text))) {
                        return true;
                    }
                    return false;
                },
                getMutations(context) {
                    const { paragraphs, unit, selection } = context;
                    const text = unit.getBody()?.dataStream.slice(paragraphs[0].paragraphStart, selection.startOffset - 1);
                    if (text && Object.keys(QuickListTypeMap).includes(text)) {
                        const type = QuickListTypeMap[text as keyof typeof QuickListTypeMap];
                        return [{
                            id: QuickListCommand.id,
                            params: {
                                listType: type,
                                paragraph: paragraphs[0],
                            },
                        }];
                    }

                    if (text && Object.keys(QUICK_HEADING_MAP).includes(text)) {
                        const type = QUICK_HEADING_MAP[text as keyof typeof QUICK_HEADING_MAP];
                        return [{
                            id: QuickHeadingCommand.id,
                            params: {
                                value: type,
                            },
                        }];
                    }
                    return [];
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
