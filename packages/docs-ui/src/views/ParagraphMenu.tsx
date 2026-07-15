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

import type { DocumentDataModel, IDocumentBlockRange, IDocumentBody, IParagraph, ITextRun, JSONXActions } from '@univerjs/core';
import type { IDocBlockMoveValidationContext } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IPopup, IValueOption, RectPopupDirection } from '@univerjs/ui';
import type { CSSProperties } from 'react';
import type { IMutiPageParagraphBound } from '../services/doc-event-manager.service';
import type { IDocBlockMenuTarget } from '../services/doc-paragraph-menu.service';
import {
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    LocaleService,
    NamedStyleType,
    SliceBodyType,
    TextX,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { DocBlockMoveValidatorService, DocContentInsertService, DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    ContextMenuPanel,
    IClipboardInterfaceService,
    IconManager,
    ILayoutService,
    RectPopup,
    useDependency,
    useObservable,
} from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import {
    DocCopyCommand,
    DocCopyCurrentParagraphCommand,
    DocCutCurrentParagraphCommand,
    DocPasteCommand,
} from '../commands/commands/clipboard.command';
import { MoveDocBlockCommand } from '../commands/commands/doc-block-move.command';
import { DeleteCurrentParagraphCommand } from '../commands/commands/doc-delete.command';
import { HorizontalLineCommand } from '../commands/commands/doc-horizontal-line.command';
import { DocParagraphSettingCommand } from '../commands/commands/doc-paragraph-setting.command';
import {
    ResetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextColorCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
} from '../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, OrderListCommand } from '../commands/commands/list.command';
import {
    AlignCenterCommand,
    AlignJustifyCommand,
    AlignLeftCommand,
    AlignRightCommand,
} from '../commands/commands/paragraph-align.command';
import {
    H1HeadingCommand,
    H2HeadingCommand,
    H3HeadingCommand,
    H4HeadingCommand,
    H5HeadingCommand,
    NormalTextHeadingCommand,
    SetParagraphNamedStyleCommand,
    SubtitleHeadingCommand,
    TitleHeadingCommand,
} from '../commands/commands/set-heading.command';
import { DocTableDeleteTableCommand } from '../commands/commands/table/doc-table-delete.command';
import {
    DOC_PARAGRAPH_T_DIVIDER_MENU_ID,
    DOC_PARAGRAPH_T_EDIT_MENU_ID,
    DOC_PARAGRAPH_T_INDENT_DECREASE_ID,
    DOC_PARAGRAPH_T_INDENT_INCREASE_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    DOC_PARAGRAPH_T_INSERT_MENU_ID,
    DOC_PARAGRAPH_T_RESET_COLORS_ID,
    DOC_TABLE_BLOCK_MENU_ID,
    INSERT_BELLOW_MENU_ID,
} from '../menu/paragraph-menu';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';
import { DocEventManagerService } from '../services/doc-event-manager.service';
import { DocParagraphMenuService } from '../services/doc-paragraph-menu.service';

export function getParagraphMenuPopupDirection(
    anchorLeft: number,
    menuWidth = 212,
    viewportPadding = 8,
    options: {
        anchorRight?: number;
        direction?: 'ltr' | 'rtl';
        viewportWidth?: number;
    } = {}
): 'left' | 'right' {
    const {
        anchorRight = anchorLeft,
        direction = 'ltr',
        viewportWidth = Number.POSITIVE_INFINITY,
    } = options;
    const hasLeftSpace = anchorLeft - menuWidth >= viewportPadding;
    const hasRightSpace = anchorRight + menuWidth + viewportPadding <= viewportWidth;

    if (direction === 'rtl') {
        return hasRightSpace || !hasLeftSpace ? 'right' : 'left';
    }

    return hasLeftSpace || !hasRightSpace ? 'left' : 'right';
}

export const PARAGRAPH_MENU_HOVER_OPEN_DELAY = 800;
const PARAGRAPH_MENU_HOVER_HIDE_DELAY = 240;
const PARAGRAPH_MENU_HOVER_BRIDGE_EDGE_OVERLAP = 12;
const PARAGRAPH_MENU_HOVER_BRIDGE_VERTICAL_PADDING = 8;
type ParagraphMenuOpenMode = 'pointer' | 'slash';

function getParagraphMenuTriggerClassName(visible: boolean) {
    return clsx(`
      univer-mr-1 univer-inline-flex univer-h-7 univer-cursor-pointer univer-items-center univer-gap-1 univer-rounded-md
      univer-border univer-border-gray-200 univer-bg-white univer-px-2 univer-py-0 univer-shadow-sm
      univer-transition-colors
      hover:univer-bg-gray-50 hover:univer-shadow-md
      dark:!univer-border-gray-700 dark:!univer-bg-gray-900
      dark:hover:!univer-bg-gray-800
    `, {
        'univer-bg-gray-100 univer-shadow-md dark:!univer-bg-gray-800': visible,
    });
}

export function shouldExecuteParagraphMenuMove(
    validatorService: Pick<DocBlockMoveValidatorService, 'canMoveBlock'>,
    context: IDocBlockMoveValidationContext
): boolean {
    return validatorService.canMoveBlock(context);
}

function getParagraphMenuTriggerIconKey(namedStyleType?: NamedStyleType): string {
    switch (namedStyleType) {
        case NamedStyleType.HEADING_1:
            return 'H1Icon';
        case NamedStyleType.HEADING_2:
            return 'H2Icon';
        case NamedStyleType.HEADING_3:
            return 'H3Icon';
        case NamedStyleType.HEADING_4:
            return 'H4Icon';
        case NamedStyleType.HEADING_5:
            return 'H5Icon';
        case NamedStyleType.TITLE:
            return 'TitleTypeIcon';
        case NamedStyleType.SUBTITLE:
            return 'SubtitleTypeIcon';
        case NamedStyleType.NORMAL_TEXT:
        case NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED:
        default:
            return 'TextTypeIcon';
    }
}

export function createParagraphMenuHoverOpenScheduler(openMenu: () => void, delay = PARAGRAPH_MENU_HOVER_OPEN_DELAY) {
    let openTimer: number | null = null;

    const cancel = () => {
        if (openTimer != null) {
            window.clearTimeout(openTimer);
            openTimer = null;
        }
    };

    return {
        schedule() {
            cancel();
            openTimer = window.setTimeout(() => {
                openTimer = null;
                openMenu();
            }, delay);
        },
        cancel,
        openNow() {
            cancel();
            openMenu();
        },
    };
}

export function setParagraphMenuInteractionActive(
    docParagraphMenuService: Pick<DocParagraphMenuService, 'setParagraphMenuActive'> | null | undefined,
    active: boolean
): void {
    docParagraphMenuService?.setParagraphMenuActive(active);
}

export function isEmptyParagraphMenuTarget(dataStream: string, paragraph?: IMutiPageParagraphBound | null | void): boolean {
    if (!paragraph) {
        return false;
    }

    return dataStream.slice(paragraph.paragraphStart, paragraph.paragraphEnd).replace(/[\r\n]/g, '') === '';
}

export function getParagraphMenuTargetRange(paragraph?: IMutiPageParagraphBound | null | void): ITextRangeWithStyle | null {
    if (!paragraph) {
        return null;
    }

    const blockRange = (paragraph as IMutiPageParagraphBound & { blockRange?: { endIndex: number; startIndex: number } }).blockRange;
    if (blockRange) {
        return {
            startOffset: blockRange.startIndex,
            endOffset: blockRange.endIndex + 1,
            collapsed: false,
            segmentId: paragraph.segmentId,
        };
    }

    return {
        startOffset: paragraph.paragraphStart,
        endOffset: paragraph.paragraphStart,
        collapsed: true,
        segmentId: paragraph.segmentId,
    };
}

export function getParagraphMenuHoverBridgeStyle(
    anchorRect: { left: number; right: number; top: number; bottom: number } | null | undefined,
    direction: 'left' | 'right',
    edgeOverlap = PARAGRAPH_MENU_HOVER_BRIDGE_EDGE_OVERLAP,
    verticalPadding = PARAGRAPH_MENU_HOVER_BRIDGE_VERTICAL_PADDING
): CSSProperties | undefined {
    if (!anchorRect) {
        return undefined;
    }

    return {
        left: direction === 'left' ? anchorRect.left - edgeOverlap : anchorRect.right - edgeOverlap,
        top: anchorRect.top - verticalPadding,
        width: edgeOverlap * 2,
        height: anchorRect.bottom - anchorRect.top + verticalPadding * 2,
    };
}

const HEADING_COMMAND_VALUES: Record<string, NamedStyleType> = {
    [H1HeadingCommand.id]: NamedStyleType.HEADING_1,
    [H2HeadingCommand.id]: NamedStyleType.HEADING_2,
    [H3HeadingCommand.id]: NamedStyleType.HEADING_3,
    [H4HeadingCommand.id]: NamedStyleType.HEADING_4,
    [H5HeadingCommand.id]: NamedStyleType.HEADING_5,
    [NormalTextHeadingCommand.id]: NamedStyleType.NORMAL_TEXT,
    [TitleHeadingCommand.id]: NamedStyleType.TITLE,
    [SubtitleHeadingCommand.id]: NamedStyleType.SUBTITLE,
};

const NAMED_STYLE_HEADING_COMMAND_IDS: Partial<Record<NamedStyleType, string>> = {
    [NamedStyleType.HEADING_1]: H1HeadingCommand.id,
    [NamedStyleType.HEADING_2]: H2HeadingCommand.id,
    [NamedStyleType.HEADING_3]: H3HeadingCommand.id,
    [NamedStyleType.HEADING_4]: H4HeadingCommand.id,
    [NamedStyleType.HEADING_5]: H5HeadingCommand.id,
    [NamedStyleType.NORMAL_TEXT]: NormalTextHeadingCommand.id,
    [NamedStyleType.TITLE]: TitleHeadingCommand.id,
    [NamedStyleType.SUBTITLE]: SubtitleHeadingCommand.id,
};

export function getParagraphMenuActiveHeadingCommandId(namedStyleType?: NamedStyleType): string {
    return NAMED_STYLE_HEADING_COMMAND_IDS[namedStyleType ?? NamedStyleType.NORMAL_TEXT] ?? NormalTextHeadingCommand.id;
}

export function getParagraphMenuHiddenHeadingCommandIds(namedStyleType?: NamedStyleType): string[] {
    if (namedStyleType === NamedStyleType.TITLE) {
        return [H4HeadingCommand.id, H5HeadingCommand.id, SubtitleHeadingCommand.id];
    }

    if (namedStyleType === NamedStyleType.SUBTITLE) {
        return [H4HeadingCommand.id, H5HeadingCommand.id, TitleHeadingCommand.id];
    }

    if (namedStyleType === NamedStyleType.HEADING_5) {
        return [H4HeadingCommand.id, TitleHeadingCommand.id, SubtitleHeadingCommand.id];
    }

    return [H5HeadingCommand.id, TitleHeadingCommand.id, SubtitleHeadingCommand.id];
}

const LIST_ICON_TO_COMMAND_ID: Record<string, string> = {
    OrderIcon: OrderListCommand.id,
    UnorderIcon: BulletListCommand.id,
    TodoListDoubleIcon: CheckListCommand.id,
};

const PARAGRAPH_MENU_BLOCK_RANGE_TYPES = [
    DocumentBlockRangeType.CODE,
    DocumentBlockRangeType.QUOTE,
    DocumentBlockRangeType.CALLOUT,
];

function getParagraphMenuBlockRangeCommandId(blockType?: string): string | undefined {
    return blockType ? `docs-${blockType}.command.insert` : undefined;
}

const PARAGRAPH_MENU_BLOCK_RANGE_COMMAND_IDS = new Set(
    PARAGRAPH_MENU_BLOCK_RANGE_TYPES.map((blockType) => getParagraphMenuBlockRangeCommandId(blockType)!)
);

const PARAGRAPH_MENU_SELECTION_COMMAND_IDS = new Set([
    BulletListCommand.id,
    OrderListCommand.id,
    CheckListCommand.id,
    HorizontalLineCommand.id,
    SetInlineFormatTextColorCommand.id,
    ResetInlineFormatTextColorCommand.id,
    SetInlineFormatTextBackgroundColorCommand.id,
    ResetInlineFormatTextBackgroundColorCommand.id,
    ...PARAGRAPH_MENU_BLOCK_RANGE_COMMAND_IDS,
    AlignLeftCommand.id,
    AlignCenterCommand.id,
    AlignRightCommand.id,
    AlignJustifyCommand.id,
]);

const PARAGRAPH_MENU_SKIP_REPLACE_SELECTION_COMMAND_IDS = new Set([
    DocCopyCurrentParagraphCommand.id,
    DocCutCurrentParagraphCommand.id,
    DeleteCurrentParagraphCommand.id,
]);

const PARAGRAPH_MENU_RESTORE_SELECTION_COMMAND_IDS = new Set([
    SetInlineFormatTextColorCommand.id,
    ResetInlineFormatTextColorCommand.id,
    SetInlineFormatTextBackgroundColorCommand.id,
    ResetInlineFormatTextBackgroundColorCommand.id,
]);

function shouldRestoreParagraphMenuSelectionAfterCommand(commandId: string | undefined) {
    return !!commandId && PARAGRAPH_MENU_RESTORE_SELECTION_COMMAND_IDS.has(commandId);
}

export function getParagraphMenuCommand(params: IValueOption, targetRange?: ITextRangeWithStyle | null): { commandId?: string; params?: object } {
    const commandId = params.commandId ?? params.id ?? (typeof params.label === 'string' ? params.label : undefined);
    if (commandId && targetRange && commandId in HEADING_COMMAND_VALUES) {
        return {
            commandId: SetParagraphNamedStyleCommand.id,
            params: {
                value: HEADING_COMMAND_VALUES[commandId],
                textRanges: [targetRange],
            },
        };
    }

    if (commandId && targetRange && (commandId === BulletListCommand.id || commandId === OrderListCommand.id || commandId === CheckListCommand.id)) {
        return {
            commandId,
            params: {
                docRange: [targetRange],
            },
        };
    }

    if (commandId === HorizontalLineCommand.id && targetRange) {
        return {
            commandId,
            params: {
                insertRange: targetRange,
            },
        };
    }

    const fallbackParams = typeof params.params === 'function' ? params.params() : params.params;
    const commandParams = typeof params.value === 'undefined'
        ? fallbackParams
        : { value: params.value };

    return {
        commandId,
        params: commandParams && typeof commandParams === 'object' ? commandParams : undefined,
    };
}

export function getParagraphMenuResolvedCommand(option: IValueOption, targetRange?: ITextRangeWithStyle | null): { commandId?: string; params?: object } {
    const commandId = option.commandId ?? option.id ?? (typeof option.label === 'string' ? option.label : undefined);

    if (!commandId) {
        return {};
    }

    return getParagraphMenuCommand({
        ...option,
        commandId,
        id: option.id ?? commandId,
    }, targetRange);
}

export function getParagraphMenuCommandParams(
    commandId: string | undefined,
    commandParams: Record<string, unknown> | undefined,
    target: IDocBlockMenuTarget | null | undefined,
    unitId: string
): Record<string, unknown> | undefined {
    if (commandId !== DeleteCurrentParagraphCommand.id || target?.kind !== 'blockRange' || !target.blockRange) {
        return commandParams;
    }

    return {
        ...(commandParams ?? {}),
        unitId,
        blockRange: target.blockRange,
    };
}

function getParagraphMenuType(target: IDocBlockMenuTarget | null | undefined, emptyMode: boolean): string {
    if (target?.kind === 'table') {
        return DOC_TABLE_BLOCK_MENU_ID;
    }

    if (emptyMode) {
        return DOC_PARAGRAPH_T_INSERT_MENU_ID;
    }

    if (target?.icon === 'ReduceIcon') {
        return DOC_PARAGRAPH_T_DIVIDER_MENU_ID;
    }

    return DOC_PARAGRAPH_T_EDIT_MENU_ID;
}

export function shouldShowParagraphSettingMenu(target: IDocBlockMenuTarget | null | undefined): boolean {
    return !target || target.kind === 'paragraph';
}

function getParagraphMenuActiveItemIds(target: IDocBlockMenuTarget | null | undefined, namedStyleType?: NamedStyleType): string[] {
    if (target?.kind === 'blockRange') {
        const blockType = target.blockRange?.blockType;
        const commandId = getParagraphMenuBlockRangeCommandId(blockType);
        return commandId && PARAGRAPH_MENU_BLOCK_RANGE_COMMAND_IDS.has(commandId)
            ? [commandId]
            : [];
    }

    const activeIds = [getParagraphMenuActiveHeadingCommandId(namedStyleType)];
    const listCommandId = target?.icon ? LIST_ICON_TO_COMMAND_ID[target.icon] : undefined;
    if (listCommandId) {
        activeIds.push(listCommandId);
    }

    return activeIds;
}

export function getParagraphMenuHiddenItemIds(
    menuType: string,
    target: IDocBlockMenuTarget | null | undefined,
    namedStyleType?: NamedStyleType
): string[] {
    if (menuType === DOC_PARAGRAPH_T_INSERT_MENU_ID) {
        return [];
    }

    const hiddenIds = [...getParagraphMenuHiddenHeadingCommandIds(namedStyleType)];
    const blockType = target?.kind === 'blockRange' ? target.blockRange?.blockType : undefined;

    if (blockType === DocumentBlockRangeType.CALLOUT) {
        hiddenIds.push(
            getParagraphMenuBlockRangeCommandId(DocumentBlockRangeType.CODE)!,
            getParagraphMenuBlockRangeCommandId(DocumentBlockRangeType.QUOTE)!
        );
    } else if (blockType === DocumentBlockRangeType.QUOTE || blockType === DocumentBlockRangeType.CODE) {
        hiddenIds.push(getParagraphMenuBlockRangeCommandId(DocumentBlockRangeType.CALLOUT)!);
    }

    return hiddenIds;
}

function getEndTokenOffset(body: IDocumentBody, blockRange: Pick<IDocumentBlockRange, 'endIndex'>): number {
    return body.dataStream[blockRange.endIndex] === DataStreamTreeTokenType.BLOCK_END
        ? blockRange.endIndex
        : body.dataStream[blockRange.endIndex + 1] === DataStreamTreeTokenType.BLOCK_END
            ? blockRange.endIndex + 1
            : blockRange.endIndex;
}

function shiftPointRangesAfterDelete<T extends { startIndex: number }>(ranges: T[] | undefined, offset: number, length: number): T[] | undefined {
    const endOffset = offset + length;
    return ranges
        ?.map((range) => {
            if (range.startIndex >= offset && range.startIndex < endOffset) {
                return null;
            }

            return range.startIndex >= endOffset ? { ...range, startIndex: range.startIndex - length } : range;
        })
        .filter((range): range is T => range != null);
}

function shiftTextRunsAfterDelete(runs: ITextRun[] | undefined, offset: number, length: number): ITextRun[] | undefined {
    const endOffset = offset + length;
    return runs
        ?.map((run) => {
            if (run.st >= offset && run.ed < endOffset) {
                return null;
            }

            if (run.st >= endOffset) {
                return {
                    ...run,
                    st: run.st - length,
                    ed: run.ed - length,
                };
            }

            if (run.ed >= offset) {
                return {
                    ...run,
                    st: run.st < offset ? run.st : offset,
                    ed: Math.max(offset, run.ed - length),
                };
            }

            return run;
        })
        .filter((run): run is ITextRun => run != null);
}

function shiftIndexRangesAfterDelete<T extends { startIndex: number; endIndex: number }>(
    ranges: T[] | undefined,
    offset: number,
    length: number
): T[] | undefined {
    const endOffset = offset + length;
    return ranges
        ?.map((range) => {
            if (range.startIndex >= offset && range.endIndex < endOffset) {
                return null;
            }

            if (range.startIndex >= endOffset) {
                return {
                    ...range,
                    startIndex: range.startIndex - length,
                    endIndex: range.endIndex - length,
                };
            }

            if (range.endIndex >= offset) {
                return {
                    ...range,
                    startIndex: range.startIndex < offset ? range.startIndex : offset,
                    endIndex: Math.max(offset, range.endIndex - length),
                };
            }

            return range;
        })
        .filter((range): range is T => range != null);
}

function deleteBodyText(body: IDocumentBody, startOffset: number, endOffset: number): void {
    const length = endOffset - startOffset;
    body.dataStream = `${body.dataStream.slice(0, startOffset)}${body.dataStream.slice(endOffset)}`;
    body.paragraphs = shiftPointRangesAfterDelete(body.paragraphs, startOffset, length);
    body.sectionBreaks = shiftPointRangesAfterDelete(body.sectionBreaks, startOffset, length);
    body.customBlocks = shiftPointRangesAfterDelete(body.customBlocks, startOffset, length);
    body.textRuns = shiftTextRunsAfterDelete(body.textRuns, startOffset, length);
    body.tables = shiftIndexRangesAfterDelete(body.tables, startOffset, length);
    body.customRanges = shiftIndexRangesAfterDelete(body.customRanges, startOffset, length);
    body.customDecorations = shiftIndexRangesAfterDelete(body.customDecorations, startOffset, length);
    body.blockRanges = shiftIndexRangesAfterDelete(body.blockRanges, startOffset, length);
}

function stripBlockParagraphStyle(style: IParagraph['paragraphStyle'], blockType: DocumentBlockRangeType): IParagraph['paragraphStyle'] {
    const nextStyle = { ...style };

    if (blockType === DocumentBlockRangeType.QUOTE) {
        delete nextStyle.indentStart;
        delete nextStyle.spaceAbove;
        delete nextStyle.spaceBelow;
        return nextStyle;
    }

    if (blockType === DocumentBlockRangeType.CODE) {
        delete nextStyle.indentStart;
        delete nextStyle.indentEnd;
        delete nextStyle.spaceAbove;
        delete nextStyle.spaceBelow;
        if (nextStyle.textStyle?.ff === 'monospace' && nextStyle.textStyle?.fs === 12) {
            delete nextStyle.textStyle;
        }
        return nextStyle;
    }

    if (blockType === DocumentBlockRangeType.CALLOUT) {
        delete nextStyle.indentStart;
        delete nextStyle.indentEnd;
        delete nextStyle.spaceAbove;
        delete nextStyle.spaceBelow;
        return nextStyle;
    }

    return nextStyle;
}

export function unwrapBlockRangeBody(documentBody: IDocumentBody, blockRange: IDocumentBlockRange) {
    const body = Tools.deepClone(documentBody);
    const endTokenOffset = getEndTokenOffset(body, blockRange);

    (body.paragraphs ?? [])
        .filter((paragraph) => paragraph.startIndex > blockRange.startIndex && paragraph.startIndex < endTokenOffset)
        .forEach((paragraph) => {
            paragraph.paragraphStyle = stripBlockParagraphStyle(paragraph.paragraphStyle, blockRange.blockType);
        });

    deleteBodyText(body, endTokenOffset, endTokenOffset + 1);
    deleteBodyText(body, blockRange.startIndex, blockRange.startIndex + 1);
    body.blockRanges = body.blockRanges?.filter((range) => range.blockId !== blockRange.blockId);

    return {
        body,
        range: {
            startOffset: blockRange.startIndex,
            endOffset: Math.max(blockRange.startIndex, endTokenOffset - 1),
            collapsed: false,
        },
    };
}

const UNWRAP_BLOCK_BODY_PATCH_KEYS = [
    'paragraphs',
    'sectionBreaks',
    'textRuns',
    'customRanges',
    'customDecorations',
    'customBlocks',
    'tables',
    'columnGroups',
    'blockRanges',
] as const satisfies Array<keyof IDocumentBody>;

export function buildUnwrapBlockRangeActions(previousBody: IDocumentBody, nextBody: IDocumentBody, blockRange: IDocumentBlockRange): JSONXActions | null {
    const endTokenOffset = getEndTokenOffset(previousBody, blockRange);
    const textX = new TextX();

    textX.retain(blockRange.startIndex);
    textX.delete(1);
    textX.retain(Math.max(0, endTokenOffset - blockRange.startIndex - 1));
    textX.delete(1);

    const textAction = JSONX.getInstance().editOp(textX.serialize(), ['body']);
    const intermediateBody = Tools.deepClone(previousBody);
    TextX.apply(intermediateBody, textX.serialize());

    const rawActions = [textAction];
    collectUnwrapBlockBodyPatchActions(intermediateBody, nextBody, rawActions);

    return rawActions.reduce((acc, action) => JSONX.compose(acc, action), null as JSONXActions);
}

function collectUnwrapBlockBodyPatchActions(previousBody: IDocumentBody, nextBody: IDocumentBody, actions: JSONXActions[]): void {
    for (const key of UNWRAP_BLOCK_BODY_PATCH_KEYS) {
        collectUnwrapPatchActions(
            JSONX.getInstance(),
            ['body', key],
            previousBody[key],
            nextBody[key],
            actions
        );
    }
}

function collectUnwrapPatchActions(
    jsonX: JSONX,
    path: (string | number)[],
    oldValue: unknown,
    newValue: unknown,
    actions: JSONXActions[]
): void {
    if (isEmptyArrayEquivalent(oldValue, newValue) || Tools.diffValue(oldValue, newValue)) {
        return;
    }

    if (oldValue == null) {
        actions.push(jsonX.insertOp(path, newValue));
        return;
    }

    if (newValue == null) {
        actions.push(jsonX.removeOp(path, oldValue));
        return;
    }

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        collectUnwrapArrayPatchActions(jsonX, path, oldValue, newValue, actions);
        return;
    }

    if (isPlainObject(oldValue) && isPlainObject(newValue)) {
        const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
        keys.forEach((key) => collectUnwrapPatchActions(
            jsonX,
            [...path, key],
            (oldValue as Record<string, unknown>)[key],
            (newValue as Record<string, unknown>)[key],
            actions
        ));
        return;
    }

    actions.push(jsonX.replaceOp(path, oldValue, newValue));
}

function collectUnwrapArrayPatchActions(
    jsonX: JSONX,
    path: (string | number)[],
    oldItems: unknown[],
    newItems: unknown[],
    actions: JSONXActions[]
): void {
    if (oldItems.length === newItems.length) {
        oldItems.forEach((item, index) => collectUnwrapPatchActions(jsonX, [...path, index], item, newItems[index], actions));
        return;
    }

    let prefix = 0;
    while (prefix < oldItems.length && prefix < newItems.length && Tools.diffValue(oldItems[prefix], newItems[prefix])) {
        prefix++;
    }

    let oldSuffix = oldItems.length - 1;
    let newSuffix = newItems.length - 1;
    while (oldSuffix >= prefix && newSuffix >= prefix && Tools.diffValue(oldItems[oldSuffix], newItems[newSuffix])) {
        oldSuffix--;
        newSuffix--;
    }

    for (let index = oldSuffix; index >= prefix; index--) {
        actions.push(jsonX.removeOp([...path, index], oldItems[index]));
    }

    for (let index = prefix; index <= newSuffix; index++) {
        actions.push(jsonX.insertOp([...path, index], newItems[index]));
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isEmptyArrayEquivalent(oldValue: unknown, newValue: unknown): boolean {
    return (
        (oldValue == null && Array.isArray(newValue) && newValue.length === 0) ||
        (newValue == null && Array.isArray(oldValue) && oldValue.length === 0)
    );
}

function getTargetSelectionRange(target: IDocBlockMenuTarget | null | undefined, paragraph?: IMutiPageParagraphBound | null): ITextRangeWithStyle | null {
    if (!target) {
        return getParagraphMenuTargetRange(paragraph);
    }

    return {
        ...target.menuRange,
        segmentId: paragraph?.segmentId,
    };
}

export function getParagraphFormattingRange(target: IDocBlockMenuTarget | null | undefined, paragraph?: IMutiPageParagraphBound | null): ITextRangeWithStyle | null {
    if (target?.kind === 'blockRange') {
        return getBlockSelectionRange(target, paragraph);
    }

    if (paragraph) {
        return {
            startOffset: paragraph.paragraphStart,
            endOffset: paragraph.paragraphEnd,
            collapsed: false,
            segmentId: paragraph.segmentId,
        };
    }

    return getTargetSelectionRange(target, paragraph);
}

export function getParagraphMenuCommandTargetRange(
    commandId: string | undefined,
    targetRange?: ITextRangeWithStyle | null,
    formattingRange?: ITextRangeWithStyle | null
): ITextRangeWithStyle | null | undefined {
    if (commandId && PARAGRAPH_MENU_SELECTION_COMMAND_IDS.has(commandId)) {
        return formattingRange ?? targetRange;
    }

    return targetRange ?? formattingRange;
}

export function finishParagraphMenuCommand(
    docParagraphMenuService: Pick<DocParagraphMenuService, 'hideParagraphMenu'> | null | undefined,
    layoutService: Pick<ILayoutService, 'focus'>,
    hideMenu: () => void
) {
    docParagraphMenuService?.hideParagraphMenu(true);
    hideMenu();
    layoutService.focus();
}

function getBlockSelectionRange(target: IDocBlockMenuTarget | null | undefined, paragraph?: IMutiPageParagraphBound | null): ITextRangeWithStyle | null {
    if (target?.kind !== 'blockRange') {
        return getTargetSelectionRange(target, paragraph);
    }

    const blockRange = target.blockRange;
    if (!blockRange) {
        return getTargetSelectionRange(target, paragraph);
    }

    return {
        startOffset: blockRange.startIndex,
        endOffset: blockRange.endIndex + 1,
        collapsed: false,
        segmentId: paragraph?.segmentId,
    };
}

function ParagraphMenuBase({ popup, tableBlockOnly = false }: { popup: IPopup; tableBlockOnly?: boolean }) {
    const [visible, setVisible] = useState(false);
    const [openMode, setOpenMode] = useState<ParagraphMenuOpenMode>('pointer');
    const [anchorRect, setAnchorRect] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
    const [dropRect, setDropRect] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
    const [menuDirection, setMenuDirection] = useState<RectPopupDirection>('left');
    const targetRangeRef = useRef<ITextRangeWithStyle | null>(null);
    const dragTargetOffsetRef = useRef<number | null>(null);
    const dragRangeRef = useRef<{ startOffset: number; endOffset: number } | null>(null);
    const isDraggingRef = useRef(false);
    const openMenuRef = useRef<() => void>(() => undefined);
    const hoverOpenSchedulerRef = useRef(createParagraphMenuHoverOpenScheduler(() => openMenuRef.current()));
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const direction = useObservable(localeService.direction$, 'ltr');
    const docClipboardService = useDependency(IDocClipboardService);
    const docContentInsertService = useDependency(DocContentInsertService);
    const docBlockMoveValidatorService = useDependency(DocBlockMoveValidatorService);
    const clipboardInterfaceService = useDependency(IClipboardInterfaceService);
    const layoutService = useDependency(ILayoutService);
    const iconManager = useDependency(IconManager);
    const anchorRef = useRef<HTMLDivElement>(null);
    const isMouseOver = useRef(false);
    const hideTimerRef = useRef<number | null>(null);
    const handledSlashRequestNonceRef = useRef(0);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderUnit = renderManagerService.getRenderById(popup.unitId);
    const doc = univerInstanceService.getUnit<DocumentDataModel>(popup.unitId, UniverInstanceType.UNIVER_DOC);
    const docParagraphMenuService = renderUnit?.with(DocParagraphMenuService);
    const docEventManagerService = renderUnit?.with(DocEventManagerService);
    const activeTarget = useObservable(docParagraphMenuService?.activeTarget$);
    const slashMenuRequest = useObservable(docParagraphMenuService?.slashMenuRequest$);
    const paragraph = useObservable(docEventManagerService?.hoverParagraph$);
    const paragraphLeft = useObservable(docEventManagerService?.hoverParagraphLeft$);
    const rawActiveTarget = activeTarget ?? docParagraphMenuService?.activeTarget;
    const currentActiveTarget = tableBlockOnly
        ? rawActiveTarget?.kind === 'table' ? rawActiveTarget : null
        : rawActiveTarget?.kind === 'table' ? null : rawActiveTarget;
    const activeParagraphBound = currentActiveTarget?.paragraph ?? docParagraphMenuService?.activeParagraph ?? paragraph ?? paragraphLeft;
    const startIndex = activeParagraphBound?.startIndex;
    const dataStream = doc?.getBody()?.dataStream ?? '';
    const paragraphObj = useMemo(() => doc?.getBody()?.paragraphs?.find((p) => p.startIndex === startIndex), [doc, startIndex]);
    const isEmptyParagraph = currentActiveTarget?.emptyMode ?? isEmptyParagraphMenuTarget(dataStream, activeParagraphBound);
    const namedStyleType = paragraphObj?.paragraphStyle?.namedStyleType;
    const targetIconKey = currentActiveTarget?.icon ?? getParagraphMenuTriggerIconKey(namedStyleType);
    const TargetIcon = iconManager.get(targetIconKey);
    const paragraphMenuType = useMemo(
        () => getParagraphMenuType(currentActiveTarget, isEmptyParagraph),
        [currentActiveTarget, isEmptyParagraph]
    );
    const paragraphMenuActiveItemIds = useMemo(
        () => getParagraphMenuActiveItemIds(currentActiveTarget, namedStyleType),
        [currentActiveTarget, namedStyleType]
    );
    const paragraphMenuHiddenItemIds = useMemo(
        () => currentActiveTarget?.kind === 'table'
            ? []
            : getParagraphMenuHiddenItemIds(paragraphMenuType, currentActiveTarget, namedStyleType),
        [currentActiveTarget, namedStyleType, paragraphMenuType]
    );
    const anchorRect$ = useMemo(() => new BehaviorSubject({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }), []);

    const updateAnchorRect = () => {
        const boundingRect = anchorRef.current?.getBoundingClientRect();
        const left = (boundingRect?.left ?? 0) - 4;
        const right = boundingRect?.right ?? 0;
        const viewportWidth = anchorRef.current?.ownerDocument.defaultView?.innerWidth ?? window.innerWidth;
        setMenuDirection(getParagraphMenuPopupDirection(left, 212, 8, {
            anchorRight: right,
            direction,
            viewportWidth,
        }));
        const nextAnchorRect = {
            left,
            right,
            top: boundingRect?.top ?? 0,
            bottom: boundingRect?.bottom ?? 0,
        };
        setAnchorRect(nextAnchorRect);
        anchorRect$.next(nextAnchorRect);
    };

    const handleHideMenu = () => {
        setVisible(false);
        setOpenMode('pointer');
        targetRangeRef.current = null;
        setParagraphMenuInteractionActive(docParagraphMenuService, false);
    };

    const clearHideTimer = () => {
        if (hideTimerRef.current != null) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    };

    const scheduleHideMenu = () => {
        clearHideTimer();
        hideTimerRef.current = window.setTimeout(() => {
            if (!isMouseOver.current && !isDraggingRef.current) {
                handleHideMenu();
            }
        }, PARAGRAPH_MENU_HOVER_HIDE_DELAY);
    };

    const handleOpenMenu = (mode: ParagraphMenuOpenMode = 'pointer') => {
        clearHideTimer();
        const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;
        setParagraphMenuInteractionActive(docParagraphMenuService, true);
        const targetRange = latestTarget
            ? {
                ...latestTarget.menuRange,
                segmentId: activeParagraphBound?.segmentId,
            }
            : getParagraphMenuTargetRange(activeParagraphBound);
        targetRangeRef.current = targetRange;
        updateAnchorRect();
        setOpenMode(mode);
        setVisible(true);
    };
    openMenuRef.current = handleOpenMenu;

    const handleOpenSlashMenu = (request: NonNullable<typeof slashMenuRequest>) => {
        clearHideTimer();
        targetRangeRef.current = {
            ...request.target.menuRange,
            segmentId: request.target.paragraph?.segmentId ?? activeParagraphBound?.segmentId,
        };
        setMenuDirection('vertical');
        setAnchorRect(request.anchorRect);
        anchorRect$.next(request.anchorRect);
        setOpenMode('slash');
        setVisible(true);
    };

    const scheduleOpenMenu = () => {
        clearHideTimer();
        hoverOpenSchedulerRef.current.schedule();
    };

    const cancelOpenMenu = () => {
        hoverOpenSchedulerRef.current.cancel();
    };

    const replaceSelection = (range: ITextRangeWithStyle | null | undefined) => {
        if (!range) {
            return;
        }

        docSelectionManagerService.replaceTextRanges([range], false);
    };

    const getCurrentTextRangesSnapshot = () => {
        return (docSelectionManagerService.getTextRanges() ?? []).map((range) => ({ ...range }));
    };

    const restoreTextRanges = (ranges: ITextRangeWithStyle[] | null) => {
        if (!ranges) {
            return;
        }

        docSelectionManagerService.replaceTextRanges(ranges, false);
    };

    const executeResolvedCommand = (option: IValueOption, targetRange?: ITextRangeWithStyle | null) => {
        const resolved = getParagraphMenuResolvedCommand(option, targetRange);

        if (!resolved.commandId) {
            return false;
        }

        return commandService.executeCommand(resolved.commandId, resolved.params);
    };

    const unwrapActiveBlockRange = async () => {
        const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;
        if (!latestTarget || latestTarget.kind !== 'blockRange' || !latestTarget.blockRange || !doc?.getBody()) {
            return null;
        }

        const previousBody = doc.getBody()!;
        const { body, range } = unwrapBlockRangeBody(previousBody, latestTarget.blockRange);
        const actions = buildUnwrapBlockRangeActions(previousBody, body, latestTarget.blockRange);
        const segmentId = activeParagraphBound?.segmentId ?? '';

        const success = await commandService.executeCommand(RichTextEditingMutation.id, {
            unitId: popup.unitId,
            actions,
            textRanges: [{
                ...range,
                segmentId,
            }],
        });

        if (!success) {
            return null;
        }

        const nextRange = {
            ...range,
            segmentId,
        };
        replaceSelection(nextRange);
        targetRangeRef.current = nextRange;
        return nextRange;
    };

    const executeParagraphMenuOption = async (option: IValueOption) => {
        const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;
        const targetRange = getTargetSelectionRange(latestTarget, activeParagraphBound ?? undefined);
        const blockRange = getBlockSelectionRange(latestTarget, activeParagraphBound ?? undefined);
        const formattingRange = getParagraphFormattingRange(latestTarget, activeParagraphBound ?? undefined);
        const commandId = option.commandId ?? option.id ?? (typeof option.label === 'string' ? option.label : undefined);
        const commandParams = typeof option.params === 'function' ? option.params() : option.params;

        if (!commandId) {
            return;
        }

        if (commandId === DOC_PARAGRAPH_T_RESET_COLORS_ID) {
            if (formattingRange) {
                replaceSelection(formattingRange);
            }
            await commandService.executeCommand(SetInlineFormatTextColorCommand.id, { value: '#000000' });
            await commandService.executeCommand(ResetInlineFormatTextBackgroundColorCommand.id);
            finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
            return;
        }

        if (commandId === DOC_PARAGRAPH_T_INDENT_INCREASE_ID || commandId === DOC_PARAGRAPH_T_INDENT_DECREASE_ID) {
            if (formattingRange) {
                replaceSelection(formattingRange);
            }
            const currentIndent = paragraphObj?.paragraphStyle?.indentFirstLine?.v ?? 0;
            const delta = commandId === DOC_PARAGRAPH_T_INDENT_INCREASE_ID ? 20 : -20;
            await commandService.executeCommand(DocParagraphSettingCommand.id, {
                paragraph: {
                    indentFirstLine: {
                        v: Math.max(0, currentIndent + delta),
                    },
                },
            });
            finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
            return;
        }

        if (commandId === DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID) {
            if (!latestTarget?.moveRange) {
                return;
            }

            docContentInsertService.setInsertRange({
                unitId: popup.unitId,
                startOffset: latestTarget.moveRange.endOffset,
                endOffset: latestTarget.moveRange.endOffset,
                segmentId: activeParagraphBound?.segmentId,
            });
            const wrappedCommandId = typeof commandParams?.commandId === 'string' ? commandParams.commandId : undefined;
            if (wrappedCommandId) {
                await commandService.executeCommand(wrappedCommandId);
            }
            finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
            return;
        }

        if (latestTarget?.kind === 'blockRange') {
            const currentBlockCommandId = getParagraphMenuBlockRangeCommandId(latestTarget.blockRange?.blockType);

            if (commandId === currentBlockCommandId) {
                await unwrapActiveBlockRange();
                finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                return;
            }

            if (
                commandId === NormalTextHeadingCommand.id ||
                commandId in HEADING_COMMAND_VALUES ||
                commandId === BulletListCommand.id ||
                commandId === OrderListCommand.id ||
                commandId === CheckListCommand.id
            ) {
                const nextRange = await unwrapActiveBlockRange();
                if (commandId !== NormalTextHeadingCommand.id) {
                    await executeResolvedCommand({
                        ...option,
                        commandId,
                        params: commandParams as Record<string, unknown> | undefined,
                    }, nextRange);
                }
                finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                return;
            }

            if (PARAGRAPH_MENU_BLOCK_RANGE_COMMAND_IDS.has(commandId)) {
                if (blockRange) {
                    replaceSelection(blockRange);
                }
                await executeResolvedCommand({
                    ...option,
                    commandId,
                    params: commandParams as Record<string, unknown> | undefined,
                }, blockRange);
                finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                return;
            }
        }

        if (commandId === getParagraphMenuActiveHeadingCommandId(namedStyleType) && commandId !== NormalTextHeadingCommand.id) {
            if (targetRange) {
                replaceSelection(targetRange);
            }
            await executeResolvedCommand({
                id: NormalTextHeadingCommand.id,
            }, targetRange);
            finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
            return;
        }

        const previousTextRanges = shouldRestoreParagraphMenuSelectionAfterCommand(commandId)
            ? getCurrentTextRangesSnapshot()
            : null;

        if (commandId && shouldUseInsertBelowRange(commandId, option) && latestTarget?.moveRange) {
            docContentInsertService.setInsertRange({
                unitId: popup.unitId,
                startOffset: latestTarget.moveRange.endOffset,
                endOffset: latestTarget.moveRange.endOffset,
                segmentId: targetRange?.segmentId ?? activeParagraphBound?.segmentId ?? '',
            });
        } else if (PARAGRAPH_MENU_SELECTION_COMMAND_IDS.has(commandId) && !PARAGRAPH_MENU_SKIP_REPLACE_SELECTION_COMMAND_IDS.has(commandId)) {
            replaceSelection(getParagraphMenuCommandTargetRange(commandId, targetRange, formattingRange));
        }

        try {
            await executeResolvedCommand({
                ...option,
                commandId,
                params: getParagraphMenuCommandParams(
                    commandId,
                    commandParams as Record<string, unknown> | undefined,
                    latestTarget,
                    popup.unitId
                ),
            }, getParagraphMenuCommandTargetRange(commandId, targetRange, formattingRange));
        } finally {
            restoreTextRanges(previousTextRanges);
        }
        finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
    };

    const hoverBridgeStyle = visible && (menuDirection === 'left' || menuDirection === 'right')
        ? getParagraphMenuHoverBridgeStyle(anchorRect, menuDirection)
        : undefined;
    const resolvedParagraphMenuType = openMode === 'slash' ? DOC_PARAGRAPH_T_INSERT_MENU_ID : paragraphMenuType;

    useEffect(() => () => {
        if (hideTimerRef.current != null) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        hoverOpenSchedulerRef.current.cancel();
        setParagraphMenuInteractionActive(docParagraphMenuService, false);
    }, []);

    useEffect(() => {
        if (!slashMenuRequest || handledSlashRequestNonceRef.current >= slashMenuRequest.nonce) {
            return;
        }

        handledSlashRequestNonceRef.current = slashMenuRequest.nonce;
        hoverOpenSchedulerRef.current.cancel();
        clearHideTimer();
        isMouseOver.current = false;
        handleOpenSlashMenu(slashMenuRequest);
    }, [slashMenuRequest]);

    if (!currentActiveTarget) {
        return null;
    }

    return (
        <>
            <div
                data-u-comp="paragraph-menu"
                ref={anchorRef}
                className={getParagraphMenuTriggerClassName(visible)}
                onMouseEnter={(e) => {
                    popup.onPointerEnter?.(e);
                    setParagraphMenuInteractionActive(docParagraphMenuService, true);
                    isMouseOver.current = true;
                    scheduleOpenMenu();
                }}
                onMouseLeave={() => {
                    isMouseOver.current = false;
                    setParagraphMenuInteractionActive(docParagraphMenuService, false);
                    cancelOpenMenu();
                    scheduleHideMenu();
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    isMouseOver.current = true;
                    hoverOpenSchedulerRef.current.openNow();
                }}
            >
                <TargetIcon />
                {currentActiveTarget?.draggable && (
                    <button
                        type="button"
                        className={`
                          univer-group univer-flex univer-h-4 univer-w-2.5 univer-cursor-grab univer-items-center
                          univer-justify-center univer-border-none univer-bg-transparent univer-p-0
                          active:univer-cursor-grabbing
                        `}
                        aria-label={localeService.t('docs-ui.doc.blockMenu.dragBlock')}
                        title={localeService.t('docs-ui.doc.blockMenu.dragBlock')}
                        onPointerDown={(event) => {
                            const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;
                            const moveRange = latestTarget?.moveRange;
                            if (!moveRange || !latestTarget?.draggable) {
                                return;
                            }

                            event.preventDefault();
                            event.stopPropagation();
                            event.currentTarget.setPointerCapture?.(event.pointerId);
                            clearHideTimer();
                            isMouseOver.current = true;
                            isDraggingRef.current = true;
                            docParagraphMenuService?.setBlockMenuDragging(true);
                            dragRangeRef.current = moveRange;
                            dragTargetOffsetRef.current = null;
                            setDropRect(null);
                            const pointerId = event.pointerId;

                            const handlePointerMove = (moveEvent: PointerEvent) => {
                                if (moveEvent.pointerId !== pointerId) {
                                    return;
                                }

                                moveEvent.preventDefault();
                                const range = dragRangeRef.current;
                                if (!range) {
                                    return;
                                }

                                const target = docParagraphMenuService?.getDropTargetFromClientPoint(moveEvent.clientX, moveEvent.clientY, range);
                                dragTargetOffsetRef.current = target?.targetOffset ?? null;
                                setDropRect(target?.rect ?? null);
                            };
                            const finishDrag = (shouldDrop: boolean) => {
                                window.removeEventListener('pointermove', handlePointerMove);
                                window.removeEventListener('pointerup', handlePointerUp);
                                window.removeEventListener('pointercancel', handlePointerCancel);
                                window.removeEventListener('blur', handleWindowBlur);
                                const range = dragRangeRef.current;
                                const targetOffset = dragTargetOffsetRef.current;
                                dragRangeRef.current = null;
                                dragTargetOffsetRef.current = null;
                                isDraggingRef.current = false;
                                docParagraphMenuService?.setBlockMenuDragging(false);
                                setDropRect(null);

                                if (shouldDrop && range && targetOffset != null && shouldExecuteParagraphMenuMove(docBlockMoveValidatorService, {
                                    unitId: popup.unitId,
                                    sourceRange: range,
                                    targetOffset,
                                })) {
                                    commandService.executeCommand(MoveDocBlockCommand.id, {
                                        unitId: popup.unitId,
                                        sourceRange: range,
                                        targetOffset,
                                    });
                                }
                            };
                            const handlePointerUp = (upEvent: PointerEvent) => {
                                if (upEvent.pointerId !== pointerId) {
                                    return;
                                }

                                upEvent.preventDefault();
                                finishDrag(true);
                            };
                            const handlePointerCancel = (cancelEvent: PointerEvent) => {
                                if (cancelEvent.pointerId !== pointerId) {
                                    return;
                                }

                                finishDrag(false);
                            };
                            const handleWindowBlur = () => {
                                finishDrag(false);
                            };

                            window.addEventListener('pointermove', handlePointerMove);
                            window.addEventListener('pointerup', handlePointerUp);
                            window.addEventListener('pointercancel', handlePointerCancel);
                            window.addEventListener('blur', handleWindowBlur, { once: true });
                        }}
                    >
                        <DragHandleDotsIcon />
                    </button>
                )}
            </div>
            {visible && hoverBridgeStyle && (
                <div
                    aria-hidden="true"
                    className="univer-fixed univer-z-[1019] univer-bg-transparent"
                    style={hoverBridgeStyle}
                    // Keep hover continuity when the pointer crosses the tiny dead zone between trigger and popup.
                    onMouseEnter={(e) => {
                        popup.onPointerEnter?.(e);
                        setParagraphMenuInteractionActive(docParagraphMenuService, true);
                        isMouseOver.current = true;
                        clearHideTimer();
                    }}
                    onMouseLeave={() => {
                        isMouseOver.current = false;
                        setParagraphMenuInteractionActive(docParagraphMenuService, false);
                        scheduleHideMenu();
                    }}
                />
            )}
            {visible && (
                <RectPopup
                    portal
                    anchorRect$={anchorRect$}
                    direction={menuDirection}
                >
                    <section
                        onMouseEnter={(e) => {
                            popup.onPointerEnter?.(e);
                            setParagraphMenuInteractionActive(docParagraphMenuService, true);
                            isMouseOver.current = true;
                            clearHideTimer();
                        }}
                        onMouseLeave={() => {
                            isMouseOver.current = false;
                            setParagraphMenuInteractionActive(docParagraphMenuService, false);
                            scheduleHideMenu();
                        }}
                    >
                        <ContextMenuPanel
                            className="univer-w-[212px]"
                            menuType={resolvedParagraphMenuType}
                            activeItemIds={currentActiveTarget?.kind === 'table' ? undefined : paragraphMenuActiveItemIds}
                            hiddenItemIds={openMode === 'slash' || currentActiveTarget?.kind === 'table' ? undefined : paragraphMenuHiddenItemIds}
                            autoFocus={openMode === 'slash'}
                            autoFocusTarget={openMode === 'slash' ? 'container' : undefined}
                            suppressHoverUntilPointerMove={openMode === 'slash'}
                            onMenuPointerEnter={() => {
                                setParagraphMenuInteractionActive(docParagraphMenuService, true);
                                isMouseOver.current = true;
                                clearHideTimer();
                            }}
                            onMenuPointerLeave={() => {
                                isMouseOver.current = false;
                                setParagraphMenuInteractionActive(docParagraphMenuService, false);
                                scheduleHideMenu();
                            }}
                            onCancel={() => {
                                finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                            }}
                            onOptionSelect={async (params) => {
                                const targetRange = targetRangeRef.current ?? getParagraphMenuTargetRange(activeParagraphBound);
                                const { commandId, params: commandParams } = getParagraphMenuCommand(params, targetRange);
                                const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;

                                if (latestTarget?.kind === 'table' && commandId && targetRange) {
                                    const tableRange = {
                                        ...targetRange,
                                        segmentId: targetRange.segmentId ?? '',
                                        collapsed: false,
                                    };
                                    const afterTableRange = {
                                        startOffset: latestTarget.moveRange.endOffset,
                                        endOffset: latestTarget.moveRange.endOffset,
                                        collapsed: true,
                                        segmentId: targetRange.segmentId ?? '',
                                    };

                                    if (commandId === DocCopyCommand.id || commandId === DocCopyCommand.name) {
                                        await docClipboardService.copy(SliceBodyType.copy, [tableRange]);
                                        finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                                        return;
                                    }

                                    if (commandId === DocPasteCommand.id) {
                                        docSelectionManagerService.replaceTextRanges([afterTableRange], false);
                                        const clipboardItems = await clipboardInterfaceService.read();
                                        await docClipboardService.paste(clipboardItems);
                                        finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                                        return;
                                    }

                                    if (commandId === DocTableDeleteTableCommand.id) {
                                        docSelectionManagerService.replaceTextRanges([tableRange], false);
                                    } else if (params.id === INSERT_BELLOW_MENU_ID || commandId !== INSERT_BELLOW_MENU_ID) {
                                        docSelectionManagerService.replaceTextRanges([afterTableRange], false);
                                    }

                                    if (commandService && commandId) {
                                        commandService.executeCommand(commandId, commandParams);
                                    }

                                    finishParagraphMenuCommand(docParagraphMenuService, layoutService, handleHideMenu);
                                    return;
                                }

                                await executeParagraphMenuOption(params);
                            }}
                        />
                    </section>
                </RectPopup>
            )}
            {dropRect && (
                <div
                    className="
                      univer-pointer-events-none univer-fixed univer-z-[10000] univer-h-0.5 univer-rounded-full
                      univer-bg-primary-600
                    "
                    style={{
                        left: dropRect.left,
                        top: dropRect.top,
                        width: Math.max(60, dropRect.right - dropRect.left),
                    }}
                />
            )}
        </>
    );
}

export const ParagraphMenu = ({ popup }: { popup: IPopup }) => (
    <ParagraphMenuBase popup={popup} />
);

export const TableBlockMenu = ({ popup }: { popup: IPopup }) => (
    <ParagraphMenuBase popup={popup} tableBlockOnly />
);

export function shouldUseInsertBelowRange(commandId: string, params: IValueOption): boolean {
    if (params.id === INSERT_BELLOW_MENU_ID) {
        return true;
    }

    if (typeof params.id === 'string' && params.id.toLowerCase().includes('below')) {
        return true;
    }

    const normalized = commandId.toLowerCase();

    if (normalized.includes('insert') && (normalized.includes('below') || normalized.includes('bellow'))) {
        return true;
    }

    if (normalized.includes('insert') && normalized.includes('image')) {
        return true;
    }

    if (normalized.includes('table') && normalized.includes('create')) {
        return true;
    }

    return normalized === 'doc.command.create-table'
        || normalized === 'doc.operation.create-table'
        || normalized === DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID;
}

function DragHandleDotsIcon() {
    return (
        <span
            className={`
              univer-grid univer-h-3.5 univer-w-2 univer-grid-cols-2 univer-place-items-center univer-gap-x-0.5
              univer-gap-y-px
            `}
            aria-hidden="true"
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className={`
                      univer-size-0.5 univer-rounded-full univer-bg-gray-400 univer-transition-colors
                      group-hover:univer-bg-gray-500
                      dark:!univer-bg-gray-500
                      dark:group-hover:!univer-bg-gray-300
                    `}
                />
            ))}
        </span>
    );
}
