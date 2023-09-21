import { Disposable, ICommandService, IContextService, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { fromDocumentEvent } from '../../Common/lifecycle';
import { IPlatformService } from '../platform/platform.service';
import { MetaKeys } from './keycode';

export interface IShortcutItem<P extends object = object> {
    /** This should reuse the corresponding command's id. */
    id: string;
    description?: string;

    priority?: number;
    /** A callback that will be triggered to examine if the shortcut should be invoked. */
    preconditions?: (contextService: Pick<IContextService, 'getContextValue'>) => boolean;

    /** A command can be bound to several bindings, with different static parameters perhaps. */
    binding: number;
    mac?: number;
    win?: number;
    linux?: number;

    /** Static parameters of this shortcut. Would be send to `CommandService.executeCommand`. */
    staticParameters?: P;
}

export interface IShortcutService {
    registerShortcut(shortcut: IShortcutItem): IDisposable;

    getCommandShortcut(id: string): string | null;
}

export const IShortcutService = createIdentifier<IShortcutService>('univer.shortcut');

export class DesktopShortcutService extends Disposable implements IShortcutService {
    // TODO: @wzhudev: this should be a linked list to resolve different shortcut mapping to the same keybinding
    private readonly _shortCutMapping = new Map<number, Set<IShortcutItem>>();

    private readonly _idToShortcut = new Map<string, number>();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IPlatformService private readonly _platformService: IPlatformService,
        @IContextService private readonly _contextService: IContextService
    ) {
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
        const existing = this._shortCutMapping.get(binding);
        if (existing) {
            existing.add(shortcut);
        } else {
            this._shortCutMapping.set(binding, new Set([shortcut]));
        }

        this._idToShortcut.set(shortcut.id, binding);

        return toDisposable(() => {
            this._idToShortcut.delete(shortcut.id);
            this._shortCutMapping.delete(binding);
        });
    }

    getCommandShortcut(id: string): string | null {
        const binding = this._idToShortcut.get(id);
        if (!binding) {
            return null;
        }

        const ctrlKey = binding & MetaKeys.CTRL_COMMAND;
        const shiftKey = binding & MetaKeys.SHIFT;
        const altKey = binding & MetaKeys.ALT;
        const macCtrl = binding & MetaKeys.MAC_CTRL;

        if (this._platformService.isMac) {
            return `${ctrlKey ? '⌘' : ''}${shiftKey ? '⇧' : ''}${altKey ? '⌥' : ''}${
                macCtrl ? '⌃' : ''
            }${String.fromCharCode(binding & 0xff)}`;
        }
        return `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${String.fromCharCode(
            binding & 0xff
        )}`;
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

        const shortcuts = this._shortCutMapping.get(binding);
        if (shortcuts === undefined) {
            return false;
        }

        const shouldTrigger = Array.from(shortcuts)
            .sort((s1, s2) => (s1.priority ?? 0) - (s2.priority ?? 0))
            .find(
                (s) =>
                    s.preconditions?.({
                        getContextValue: this._contextService.getContextValue.bind(this._contextService),
                    }) ?? true
            );
        if (shouldTrigger) {
            this._commandService.executeCommand(shouldTrigger.id, shouldTrigger.staticParameters);
            return true;
        }

        return false;
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
