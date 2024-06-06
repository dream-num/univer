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

import type { ICommand } from '@univerjs/core';
import {
    ICommandService,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { ITextSelectionRenderManager, TextSelectionRenderManager } from '@univerjs/engine-render';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { BreakLineCommand } from './commands/commands/break-line.command';
import { DeleteCommand, InsertCommand, UpdateCommand } from './commands/commands/core-editing.command';
import { DeleteCustomBlockCommand, DeleteLeftCommand, DeleteRightCommand, MergeTwoParagraphCommand } from './commands/commands/delete.command';
import { IMEInputCommand } from './commands/commands/ime-input.command';
import {
    ResetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from './commands/commands/inline-format.command';
import { BulletListCommand, ListOperationCommand, OrderListCommand } from './commands/commands/list.command';
import { CoverContentCommand, ReplaceContentCommand } from './commands/commands/replace-content.command';
import { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/cursor.operation';
import { SelectAllOperation } from './commands/operations/select-all.operation';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { SetTextSelectionsOperation } from './commands/operations/text-selection.operation';
import { IMEInputController } from './controllers/ime-input.controller';
import { MoveCursorController } from './controllers/move-cursor.controller';
import { NormalInputController } from './controllers/normal-input.controller';
import { IMEInputManagerService } from './services/ime-input-manager.service';
import { TextSelectionManagerService } from './services/text-selection-manager.service';
import { DocStateChangeManagerService } from './services/doc-state-change-manager.service';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from './commands/commands/paragraph-align.command';
import { DocCustomRangeService } from './services/doc-custom-range.service';

export interface IUniverDocsConfig {
    hasScroll?: boolean;
}

const PLUGIN_NAME = 'docs';

export class UniverDocsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        _config: Partial<IUniverDocsConfig> = {},
        @Inject(Injector) override _injector: Injector
    ) {
        super();

        this._initializeDependencies(_injector);

        this._initializeCommands();
    }

    private _initializeCommands(): void {
        (
            [
                MoveCursorOperation,
                MoveSelectionOperation,
                DeleteLeftCommand,
                DeleteRightCommand,
                SetInlineFormatBoldCommand,
                SetInlineFormatItalicCommand,
                SetInlineFormatUnderlineCommand,
                SetInlineFormatStrikethroughCommand,
                SetInlineFormatSubscriptCommand,
                SetInlineFormatSuperscriptCommand,
                SetInlineFormatFontSizeCommand,
                SetInlineFormatFontFamilyCommand,
                SetInlineFormatTextColorCommand,
                ResetInlineFormatTextBackgroundColorCommand,
                SetInlineFormatTextBackgroundColorCommand,
                SetInlineFormatCommand,
                BreakLineCommand,
                InsertCommand,
                DeleteCommand,
                DeleteCustomBlockCommand,
                UpdateCommand,
                IMEInputCommand,
                MergeTwoParagraphCommand,
                RichTextEditingMutation,
                ReplaceContentCommand,
                CoverContentCommand,
                SetDocZoomRatioCommand,
                SetDocZoomRatioOperation,
                SetTextSelectionsOperation,
                SelectAllOperation,
                OrderListCommand,
                BulletListCommand,
                ListOperationCommand,
                AlignLeftCommand,
                AlignCenterCommand,
                AlignRightCommand,
                AlignOperationCommand,
                AlignJustifyCommand,
            ] as ICommand[]
        ).forEach((command) => {
            this._injector.get(ICommandService).registerCommand(command);
        });
    }

    private _initializeDependencies(docInjector: Injector) {
        (
            [
                // services
                [DocStateChangeManagerService],
                [IMEInputManagerService],
                [
                    ITextSelectionRenderManager,
                    {
                        useClass: TextSelectionRenderManager,
                    },
                ],
                [TextSelectionManagerService],
                [DocCustomRangeService],
                // controllers
                [NormalInputController],
                [IMEInputController],
                [MoveCursorController],

            ] as Dependency[]
        ).forEach((d) => docInjector.add(d));
    }
}
