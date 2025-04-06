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

import type { DocumentDataModel, IAccessor, IContextService, IMultiCommand } from '@univerjs/core';
import { BuildTextUtils, CommandType, DOC_RANGE_TYPE, EDITOR_ACTIVATED, FOCUSING_DOC, IUniverInstanceService, SliceBodyType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { CopyCommand, CutCommand, IClipboardInterfaceService, PasteCommand } from '@univerjs/ui';
import { IDocClipboardService } from '../../services/clipboard/clipboard.service';
import { DocParagraphMenuService } from '../../services/doc-paragraph-menu.service';

export function whenDocOrEditor(contextService: IContextService): boolean {
    return contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(EDITOR_ACTIVATED);
}

export function whenFocusEditor(contextService: IContextService): boolean {
    return contextService.getContextValue(EDITOR_ACTIVATED);
}

const DOC_CLIPBOARD_PRIORITY = 999;

// Commands here should have higher priority than commands of sheets
// in packages/sheets-ui/src/commands/commands/clipboard.command.ts

export const DocCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'doc.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: DOC_CLIPBOARD_PRIORITY,
    preconditions: whenDocOrEditor,
    handler: async (accessor: IAccessor) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        return docClipboardService.copy();
    },
};

export const DocCopyCurrentParagraphCommand = {
    id: 'doc.command.copy-current-paragraph',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        const instanceService = accessor.get(IUniverInstanceService);
        const docParagraphMenuService = accessor.get(DocParagraphMenuService);
        const activeParagraph = docParagraphMenuService.activeParagraph;
        if (!activeParagraph) {
            return false;
        }
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const range = docSelectionManagerService.getActiveTextRange();
        const doc = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!range || !range.collapsed || !doc || range.segmentId) {
            return false;
        }

        const paragraph = BuildTextUtils.range.getParagraphsInRange(range, doc.getBody()?.paragraphs ?? [])[0];
        if (!paragraph) {
            return false;
        }

        return docClipboardService.copy(
            SliceBodyType.copy,
            [{
                startOffset: paragraph.paragraphStart,
                endOffset: paragraph.paragraphEnd + 1,
                collapsed: false,
            }]
        );
    },
};

export const DocCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'doc.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: DOC_CLIPBOARD_PRIORITY,
    preconditions: whenDocOrEditor,
    handler: async (accessor: IAccessor) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        return docClipboardService.cut();
    },
};

export const DocCutCurrentParagraphCommand = {
    id: 'doc.command.cut-current-paragraph',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        const instanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const range = docSelectionManagerService.getActiveTextRange();
        const doc = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!range || !range.collapsed || !doc || range.segmentId) {
            return false;
        }

        const paragraph = BuildTextUtils.range.getParagraphsInRange(range, doc.getBody()?.paragraphs ?? [])[0];
        if (!paragraph) {
            return false;
        }

        return docClipboardService.cut(
            [{
                startOffset: paragraph.paragraphStart,
                endOffset: paragraph.paragraphEnd + 1,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.TEXT,
            }]
        );
    },
};

export const DocPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    name: 'doc.command.paste',
    type: CommandType.COMMAND,
    multi: true,
    priority: DOC_CLIPBOARD_PRIORITY,
    preconditions: whenDocOrEditor,
    handler: async (accessor: IAccessor) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        const clipboardInterfaceService = accessor.get(IClipboardInterfaceService);
        const clipboardItems = await clipboardInterfaceService.read();
        if (clipboardItems.length === 0) {
            return false;
        }

        return docClipboardService.paste(clipboardItems);
    },
};
