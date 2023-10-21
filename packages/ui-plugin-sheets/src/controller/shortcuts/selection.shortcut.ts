import {
    ExpandSelectionCommand,
    IExpandSelectionCommandParams,
    IMoveSelectionCommandParams,
    ISelectAllCommandParams,
    MoveSelectionCommand,
    SelectAllCommand,
} from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/base-ui';
import { Direction } from '@univerjs/core';

import { whenEditorNotActivated } from './utils';

export const MoveSelectionDownShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN,
    priority: 100,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveSelectionUpShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_UP,
    priority: 100,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveSelectionLeftShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT,
    priority: 100,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveSelectionRightShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT,
    priority: 100,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveSelectionTabShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.TAB,
    priority: 100,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveBackSelectionShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.TAB | MetaKeys.SHIFT,
    priority: 100,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

// move selection to continuous end

export const MoveSelectionEndDownShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.DOWN,
        jumpOver: true,
    },
};

export const MoveSelectionEndUpShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.UP,
        jumpOver: true,
    },
};

export const MoveSelectionEndLeftShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.LEFT,
        jumpOver: true,
    },
};

export const MoveSelectionEndRightShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.RIGHT,
        jumpOver: true,
    },
};

export const ExpandSelectionDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const ExpandSelectionUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const ExpandSelectionLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const ExpandSelectionRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// continuous selection to continuous end

export const ExpandSelectionEndDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.DOWN,
        jumpOver: true,
    },
};

export const ExpandSelectionEndUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.UP,
        jumpOver: true,
    },
};

export const ExpandSelectionEndLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.LEFT,
        jumpOver: true,
    },
};

export const ExpandSelectionEndRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        direction: Direction.RIGHT,
        jumpOver: true,
    },
};

export const SelectAllShortcutItem: IShortcutItem<ISelectAllCommandParams> = {
    id: SelectAllCommand.id,
    binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorNotActivated,
    staticParameters: {
        expandToGapFirst: true,
        loop: true,
    },
};
