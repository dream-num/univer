import { Disposable, ICommandService, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { fromDocumentEvent } from '../../Common/lifecycle';
import { IPlatformService } from '../platform/platform.service';
import { MetaKeys } from './keycode';

export interface IShortcutItem {
    /** This should reuse the corresponding command's id. */
    id: string;

    binding: number;

    mac?: number;
    win?: number;
    linux?: number;
}

export interface IShortcutService {
    registerShortcut(shortcut: IShortcutItem): IDisposable;

    getCommandShortcut(id: string): string;
}

export const IShortcutService = createIdentifier<IShortcutService>('univer.shortcut');

export class DesktopShortcutService extends Disposable implements IShortcutService {
    // TODO: @wzhudev: this should be a linked list to resolve different shortcut mapping to the same keybinding

    private readonly _shortCutMapping = new Map<number, IShortcutItem>();

    constructor(@ICommandService private readonly _commandService: ICommandService, @IPlatformService private readonly _platformService: IPlatformService) {
        super();

        this.disposeWithMe(
            fromDocumentEvent('keydown', (e: KeyboardEvent) => {
                this.resolveMouseEvent(e);
            })
        );
    }

    registerShortcut(shortcut: IShortcutItem): IDisposable {
        // first map shortcut to a number, so it could be converted and fetched quickly
        const binding = this.getBindingFromItem(shortcut);
        this._shortCutMapping.set(binding, shortcut);

        return toDisposable(() => {
            this._shortCutMapping.delete(binding);
        });
    }

    getCommandShortcut(id: string): string {
        return '';
    }

    private resolveMouseEvent(e: KeyboardEvent): void {
        const shouldPreventDefault = this.dispatch(e);
        if (shouldPreventDefault) {
            e.preventDefault();
        }
    }

    private dispatch(e: KeyboardEvent): boolean {
        const binding = this.deriveBindingFromEvent(e);
        if (binding === null) {
            return false;
        }

        const shortcut = this._shortCutMapping.get(binding);
        if (shortcut === undefined) {
            return false;
        }

        this._commandService.executeCommand(shortcut.id);
        return true;
    }

    private getBindingFromItem(item: IShortcutItem): number {
        if (this._platformService.isMac && item.mac) {
            return item.mac;
        }

        if (this._platformService.isWindows && item.win) {
            return item.win;
        }

        if (this._platformService.isLinux && item.linux) {
            return item.linux;
        }

        return item.binding;
    }

    private deriveBindingFromEvent(e: KeyboardEvent): number | null {
        const { shiftKey, metaKey, altKey, keyCode } = e;

        let binding = keyCode;

        if (shiftKey) {
            binding |= MetaKeys.SHIFT;
        }

        if (altKey) {
            binding |= MetaKeys.ALT;
        }

        const ctrlKey = this._platformService.isMac ? metaKey : e.ctrlKey;
        if (ctrlKey) {
            binding |= MetaKeys.CTRL_COMMAND;
        }

        if (this._platformService.isMac && e.ctrlKey) {
            binding |= MetaKeys.MAC_CTRL;
        }

        return binding;
    }
}