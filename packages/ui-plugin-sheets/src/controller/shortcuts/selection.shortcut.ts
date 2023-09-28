import {
    ExpandSelectionCommand,
    IExpandSelectionCommandParams,
    IMoveSelectionCommandParams,
    ISelectAllCommandParams,
    MoveSelectionCommand,
    SelectAllCommand,
} from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/base-ui';
import { Direction, FOCUSING_SHEET } from '@univerjs/core';

import { SHEET_EDITOR_ACTIVATED } from '../../services/context/context';

export const MoveSelectionDownShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveSelectionUpShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_UP,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveSelectionLeftShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveSelectionRightShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveSelectionTabShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.TAB,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// move selection to continuous end

export const MoveSelectionEndDownShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.DOWN,
        jumpOver: true,
    },
};

export const MoveSelectionEndUpShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.UP,
        jumpOver: true,
    },
};

export const MoveSelectionEndLeftShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.LEFT,
        jumpOver: true,
    },
};

export const MoveSelectionEndRightShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.RIGHT,
        jumpOver: true,
    },
};

export const ExpandSelectionDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const ExpandSelectionUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.UP,
    },
};

export const ExpandSelectionLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const ExpandSelectionRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// continuous selection to continuous end

export const ExpandSelectionEndDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.DOWN,
        jumpOver: true,
    },
};

export const ExpandSelectionEndUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.UP,
        jumpOver: true,
    },
};

export const ExpandSelectionEndLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.LEFT,
        jumpOver: true,
    },
};

export const ExpandSelectionEndRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    staticParameters: {
        direction: Direction.RIGHT,
        jumpOver: true,
    },
};

export const SelectAllShortcutItem: IShortcutItem<ISelectAllCommandParams> = {
    id: SelectAllCommand.id,
    binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(SHEET_EDITOR_ACTIVATED),
    staticParameters: {
        expandToGapFirst: true,
        loop: true,
    },
};
