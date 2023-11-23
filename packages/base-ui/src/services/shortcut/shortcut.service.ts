import { Disposable, ICommandService, IContextService, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

import { fromDocumentEvent } from '../../common/lifecycle';
import { IFocusService } from '../focus/focus.service';
import { IPlatformService } from '../platform/platform.service';
import { KeyCodeToChar, MetaKeys } from './keycode';

export interface IShortcutItem<P extends object = object> {
    /** This should reuse the corresponding command's id. */
    id: string;
    description?: string;

    priority?: number;
    /** A callback that will be triggered to examine if the shortcut should be invoked. */
    preconditions?: (contextService: IContextService) => boolean;

    /** A command can be bound to several bindings, with different static parameters perhaps. */
    binding: number;
    mac?: number;
    win?: number;
    linux?: number;

    /**
     * The group of the menu item should belong to. The shortcut item would be rendered in the
     * panel if this is set.
     */
    group?: string;

    /** Static parameters of this shortcut. Would be send to `CommandService.executeCommand`. */
    staticParameters?: P;
}

export interface IShortcutService {
    shortcutChanged$: Observable<void>;

    registerShortcut(shortcut: IShortcutItem): IDisposable;
    getShortcutDisplay(id: string): string | null;
    getAllShortcuts(): IShortcutItem[];
}

export const IShortcutService = createIdentifier<IShortcutService>('univer.shortcut');

export class DesktopShortcutService extends Disposable implements IShortcutService {
    private readonly _shortCutMapping = new Map<number, Set<IShortcutItem>>();

    private readonly _idToShortcut = new Map<string, number>();

    private readonly _shortcutChanged$ = new Subject<void>();
    readonly shortcutChanged$ = this._shortcutChanged$.asObservable();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IPlatformService private readonly _platformService: IPlatformService,
        @IContextService private readonly _contextService: IContextService,
        @IFocusService private readonly _focusService: IFocusService
    ) {
        super();

        // Register native keydown event handler to trigger shortcuts.
        this.disposeWithMe(
            fromDocumentEvent('keydown', (e: KeyboardEvent) => {
                this._resolveMouseEvent(e);
            })
        );
    }

    getAllShortcuts(): IShortcutItem[] {
        return Array.from(this._shortCutMapping.values())
            .map((v) => Array.from(v.values()))
            .flat();
    }

    registerShortcut(shortcut: IShortcutItem): IDisposable {
        // first map shortcut to a number, so it could be converted and fetched quickly
        const binding = this._getBindingFromItem(shortcut);
        const existing = this._shortCutMapping.get(binding);

        if (existing) {
            existing.add(shortcut);
        } else {
            this._shortCutMapping.set(binding, new Set([shortcut]));
        }

        this._idToShortcut.set(shortcut.id, binding);
        this._emitShortcutChanged();

        return toDisposable(() => {
            this._emitShortcutChanged();
            this._idToShortcut.delete(shortcut.id);
            this._shortCutMapping.delete(binding);
        });
    }

    getShortcutDisplay(id: string): string | null {
        const binding = this._idToShortcut.get(id);
        if (!binding) {
            return null;
        }

        const ctrlKey = binding & MetaKeys.CTRL_COMMAND;
        const shiftKey = binding & MetaKeys.SHIFT;
        const altKey = binding & MetaKeys.ALT;
        const macCtrl = binding & MetaKeys.MAC_CTRL;

        const body = KeyCodeToChar[binding & 0xff] ?? '<->';

        if (this._platformService.isMac) {
            return `${ctrlKey ? '⌘' : ''}${shiftKey ? '⇧' : ''}${altKey ? '⌥' : ''}${macCtrl ? '⌃' : ''}${body}`;
        }
        return `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${body}`;
    }

    private _emitShortcutChanged(): void {
        this._shortcutChanged$.next();
    }

    private _resolveMouseEvent(e: KeyboardEvent): void {
        const shouldPreventDefault = this._dispatch(e);
        if (shouldPreventDefault) {
            e.preventDefault();
        }
    }

    private _dispatch(e: KeyboardEvent) {
        const binding = this._deriveBindingFromEvent(e);
        if (binding === null) {
            return false;
        }

        const shortcuts = this._shortCutMapping.get(binding);
        if (shortcuts === undefined) {
            return false;
        }

        const shouldTrigger = Array.from(shortcuts)
            .sort((s1, s2) => (s2.priority ?? 0) - (s1.priority ?? 0))
            .find((s) => s.preconditions?.(this._contextService) ?? true);

        if (shouldTrigger) {
            this._commandService.executeCommand(shouldTrigger.id, shouldTrigger.staticParameters);
            return true;
        }

        return false;
    }

    private _getBindingFromItem(item: IShortcutItem): number {
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

    private _deriveBindingFromEvent(e: KeyboardEvent): number | null {
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
