import { ChangeSelectionCommand, ExpandSelectionCommand, IChangeSelectionCommandParams, IExpandSelectionCommandParams } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/base-ui';
import { Direction } from '@univerjs/core';

export const MoveSelectionDownShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveSelectionUpShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_UP,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveSelectionLeftShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveSelectionRightShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// move selection to continuous end

export const MoveSelectionEndDownShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.LEFT,
        toEnd: true,
    },
};

export const MoveSelectionEndUpShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.UP,
        toEnd: true,
    },
};

export const MoveSelectionEndLeftShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.LEFT,
        toEnd: true,
    },
};

export const MoveSelectionEndRightShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.RIGHT,
        toEnd: true,
    },
};

// continuous selection by cell

export const ExpandSelectionDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const ExpandSelectionUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const ExpandSelectionLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const ExpandSelectionRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// continuous selection to continuous end

export const ExpandSelectionEndDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.DOWN,
        toEnd: true,
    },
};

export const ExpandSelectionEndUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.UP,
        toEnd: true,
    },
};

export const ExpandSelectionEndLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.LEFT,
        toEnd: true,
    },
};

export const ExpandSelectionEndRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.RIGHT,
        toEnd: true,
    },
};
