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

import type { IDisposable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { KeyCode } from './keycode';
import { createIdentifier, Disposable, ICommandService, IContextService, Optional, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { fromGlobalEvent } from '../../common/lifecycle';
import { ILayoutService } from '../layout/layout.service';
import { IPlatformService } from '../platform/platform.service';
import { KeyCodeToChar, MetaKeys } from './keycode';

/**
 * A shortcut item that could be registered to the {@link IShortcutService}.
 */
export interface IShortcutItem<P extends object = object> {
    /** Id of the shortcut item. It should reuse the corresponding {@link ICommand}'s id. */
    id: string;

    /** Description of the shortcut. */
    description?: string;

    /** If two shortcuts have the same binding, the one with higher priority would be check first. */
    priority?: number;

    /**
     * A callback that will be triggered to examine if the shortcut should be invoked. The `{@link IContextService}`
     * would be passed to the callback.
     */
    preconditions?: (contextService: IContextService) => boolean;

    /**
     * The binding of the shortcut. It should be a combination of {@link KeyCode} and {@link MetaKeys}.
     *
     * A command can be bound to several bindings, with different static parameters perhaps.
     *
     * @example { binding: KeyCode.ENTER | MetaKeys.ALT }
     */
    binding?: KeyCode | number;
    /**
     * The binding of the shortcut for macOS. If the property is not specified, the default binding would be used.
     */
    mac?: number;
    /**
     * The binding of the shortcut for Windows. If the property is not specified, the default binding would be used.
     */
    win?: number;
    /**
     * The binding of the shortcut for Linux. If the property is not specified, the default binding would be used.
     */
    linux?: number;

    /**
     * The group of the menu item should belong to. The shortcut item would be rendered in the
     * panel if this is set.
     *
     * @example { group: '10_global-shortcut' }
     */
    group?: string;

    /**
     * Static parameters of this shortcut. Would be send to {@link ICommandService.executeCommand} as the second
     * parameter when the corresponding command is executed.
     *
     * You can define multi shortcuts with the same command id but different static parameters.
     */
    staticParameters?: P;
}

/**
 * The dependency injection identifier of the {@link IShortcutService}.
 */
export const IShortcutService = createIdentifier<IShortcutService>('ui.shortcut.service');
/**
 * The interface of the shortcut service.
 */
export interface IShortcutService {
    /**
     * An observable that emits when the shortcuts are changed.
     */
    shortcutChanged$: Observable<void>;

    /**
     * Make the shortcut service ignore all keyboard events.
     * @returns {IDisposable} a disposable that could be used to cancel the force escaping.
     */
    forceEscape(): IDisposable;

    /**
     * Used by API to force disable all shortcut keys, which will not be restored by selection
     * @returns {IDisposable} a disposable that could be used to cancel the force disabling.
     */
    forceDisable(): IDisposable;

    /**
     * Dispatch a keyboard event to the shortcut service and check if there is a shortcut that matches the event.
     * @param e - the keyboard event to be dispatched.
     */
    dispatch(e: KeyboardEvent): IShortcutItem<object> | undefined;
    /**
     * Register a shortcut item to the shortcut service.
     * @param {IShortcutItem} shortcut - the shortcut item to be registered.
     * @returns {IDisposable} a disposable that could be used to unregister the shortcut.
     */
    registerShortcut(shortcut: IShortcutItem): IDisposable;
    /**
     * Get the display string of the shortcut item.
     * @param shortcut - the shortcut item to get the display string.
     * @returns {string | null} The display string of the shortcut. For example `Ctrl+Enter`.
     */
    getShortcutDisplay(shortcut: IShortcutItem): string | null;
    /**
     * Get the display string of the shortcut of the command.
     * @param id the id of the command to get the shortcut display.
     * @returns {string | null} the display string of the shortcut. For example `Ctrl+Enter`.
     */
    getShortcutDisplayOfCommand(id: string): string | null;
    /**
     * Get all the shortcuts registered in the shortcut service.
     * @returns {IShortcutItem[]} all the shortcuts registered in the shortcut service.
     */
    getAllShortcuts(): IShortcutItem[];
}

/**
 * @ignore
 */
export class ShortcutService extends Disposable implements IShortcutService {
    private readonly _shortCutMapping = new Map<number, Set<IShortcutItem>>();
    private readonly _commandIDMapping = new Map<string, Set<IShortcutItem>>();

    private readonly _shortcutChanged$ = new Subject<void>();
    readonly shortcutChanged$ = this._shortcutChanged$.asObservable();

    private _forceEscaped = false;

    private _forceDisabled = false;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IPlatformService private readonly _platformService: IPlatformService,
        @IContextService private readonly _contextService: IContextService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();

        // Register native keydown event handler to trigger shortcuts.
        this.disposeWithMe(
            fromGlobalEvent('keydown', (e: KeyboardEvent) => {
                this._resolveKeyboardEvent(e);
            }, {
                capture: true,
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
        if (!binding) return toDisposable(() => {});

        const bindingSet = this._shortCutMapping.get(binding);
        if (bindingSet) {
            bindingSet.add(shortcut);
        } else {
            this._shortCutMapping.set(binding, new Set([shortcut]));
        }

        const commandID = shortcut.id;
        const commandIDSet = this._commandIDMapping.get(commandID);
        if (commandIDSet) {
            commandIDSet.add(shortcut);
        } else {
            this._commandIDMapping.set(commandID, new Set([shortcut]));
        }

        this._emitShortcutChanged();
        return toDisposable(() => {
            this._shortCutMapping.get(binding)?.delete(shortcut);
            if (this._shortCutMapping.get(binding)?.size === 0) {
                this._shortCutMapping.delete(binding);
            }

            this._commandIDMapping.get(commandID)?.delete(shortcut);
            if (this._commandIDMapping.get(commandID)?.size === 0) {
                this._commandIDMapping.delete(commandID);
            }

            this._emitShortcutChanged();
        });
    }

    getShortcutDisplayOfCommand(id: string): string | null {
        const set = this._commandIDMapping.get(id);
        if (!set) {
            return null;
        }

        const shortcut = set.values().next().value;
        if (shortcut) {
            return this.getShortcutDisplay(shortcut);
        }

        return null;
    }

    getShortcutDisplay(shortcut: IShortcutItem): string | null {
        const binding = this._getBindingFromItem(shortcut);
        if (!binding) return null;

        const ctrlKey = binding & MetaKeys.CTRL_COMMAND;
        const shiftKey = binding & MetaKeys.SHIFT;
        const altKey = binding & MetaKeys.ALT;
        const macCtrl = binding & MetaKeys.MAC_CTRL;

        const body = KeyCodeToChar[binding & 0xFF] ?? '<->';

        if (this._platformService.isMac) {
            return `${ctrlKey ? '⌘+' : ''}${shiftKey ? '⇧+' : ''}${altKey ? '⌥+' : ''}${macCtrl ? '⌃+' : ''}${body}`;
        }
        return `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${body}`;
    }

    private _emitShortcutChanged(): void {
        this._shortcutChanged$.next();
    }

    forceEscape(): IDisposable {
        this._forceEscaped = true;
        return toDisposable(() => (this._forceEscaped = false));
    }

    forceDisable(): IDisposable {
        this._forceDisabled = true;
        return toDisposable(() => {
            this._forceDisabled = false;
        });
    }

    private _resolveKeyboardEvent(e: KeyboardEvent): void {
        const candidate = this.dispatch(e);
        if (candidate) {
            this._commandService.executeCommand(candidate.id, candidate.staticParameters);
            e.preventDefault();
        }
    }

    dispatch(e: KeyboardEvent): IShortcutItem<object> | undefined {
        // Should get the container element of the Univer instance and see if
        // the event target is a descendant of the container element.
        // Also we should check through escape list and force catching list.
        // if the target is not focused on the univer instance we should ignore the keyboard event.
        // Maybe the user has forcibly disabled the shortcut keys, and the shortcut keys should not be processed at this time.
        if (this._forceEscaped || this._forceDisabled) return;

        if (
            this._layoutService &&
            !this._layoutService.checkElementInCurrentContainers(e.target as HTMLElement)
        ) {
            return;
        }
        const binding = this._deriveBindingFromEvent(e);
        if (binding === null) {
            return undefined;
        }

        const shortcuts = this._shortCutMapping.get(binding);
        if (shortcuts === undefined) {
            return undefined;
        }

        const candidateShortcut = Array.from(shortcuts)
            .sort((s1, s2) => (s2.priority ?? 0) - (s1.priority ?? 0))
            .find((s) => s.preconditions?.(this._contextService) ?? true);

        return candidateShortcut;
    }

    private _getBindingFromItem(item: IShortcutItem): number | undefined {
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
