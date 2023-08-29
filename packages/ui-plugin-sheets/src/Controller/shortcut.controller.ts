import { ChangeSelectionCommand, ExpandSelectionCommand, IChangeSelectionCommandParams, IExpandSelectionCommandParams } from '@univerjs/base-sheets';
import { IShortcutItem, IShortcutService, KeyCode, MetaKeys } from '@univerjs/base-ui';
import { Direction, Disposable, ICommandService } from '@univerjs/core';

// move selection by cell

const MoveSelectionDownShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

const MoveSelectionUpShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_UP,
    staticParameters: {
        direction: Direction.UP,
    },
};

const MoveSelectionLeftShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

const MoveSelectionRightShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// move selection to continuous end

const MoveSelectionEndDownShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.LEFT,
        toEnd: true,
    },
};

const MoveSelectionEndUpShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.UP,
        toEnd: true,
    },
};

const MoveSelectionEndLeftShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.LEFT,
        toEnd: true,
    },
};

const MoveSelectionEndRightShortcutItem: IShortcutItem<IChangeSelectionCommandParams> = {
    id: ChangeSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.RIGHT,
        toEnd: true,
    },
};

// continuous selection by cell

const ExpandSelectionDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

const ExpandSelectionUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.UP,
    },
};

const ExpandSelectionLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

const ExpandSelectionRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// continuous selection to continuous end

const ExpandSelectionEndDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.DOWN,
        toEnd: true,
    },
};

const ExpandSelectionEndUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.UP,
        toEnd: true,
    },
};

const ExpandSelectionEndLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.LEFT,
        toEnd: true,
    },
};

const ExpandSelectionEndRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        direction: Direction.RIGHT,
        toEnd: true,
    },
};

export class DesktopSheetShortcutController extends Disposable {
    constructor(@IShortcutService private readonly _shortcutService: IShortcutService, @ICommandService private readonly _commandService: ICommandService) {
        super();

        [ChangeSelectionCommand, ExpandSelectionCommand].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });

        [
            MoveSelectionDownShortcutItem,
            MoveSelectionUpShortcutItem,
            MoveSelectionLeftShortcutItem,
            MoveSelectionRightShortcutItem,
            MoveSelectionEndDownShortcutItem,
            MoveSelectionEndUpShortcutItem,
            MoveSelectionEndLeftShortcutItem,
            MoveSelectionEndRightShortcutItem,
            ExpandSelectionDownShortcutItem,
            ExpandSelectionUpShortcutItem,
            ExpandSelectionLeftShortcutItem,
            ExpandSelectionRightShortcutItem,
            ExpandSelectionEndDownShortcutItem,
            ExpandSelectionEndUpShortcutItem,
            ExpandSelectionEndLeftShortcutItem,
            ExpandSelectionEndRightShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }
}
