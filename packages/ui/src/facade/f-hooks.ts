/**
 * Copyright 2023-present DreamNum Inc.
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
import { FHooks, ICommandService } from '@univerjs/core';
import { CopyCommand, PasteCommand, SheetPasteShortKeyCommandName } from '@univerjs/ui';

export interface IFHooksSheetsUIMixin {
    /**
     * The onBeforeCopy event is fired before a copy operation is performed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeCopy(callback: () => void): IDisposable;

    /**
     * The onBeforeCopy event is fired before a copy operation is performed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforePaste(callback: () => void): IDisposable;

    /**
     * The onCopy event is fired after a copy operation is performed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCopy(callback: () => void): IDisposable;

    /**
     * The onBeforePaste event is fired before a paste operation is performed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforePaste(callback: () => void): IDisposable;

    /**
     * The onPaste event is fired after a paste operation is performed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onPaste(callback: () => void): IDisposable;
}

export class FHooksSheetsMixin extends FHooks implements IFHooksSheetsUIMixin {
    override onBeforeCopy(callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.beforeCommandExecuted((command) => {
            if (command.id === CopyCommand.id) {
                callback();
            }
        });
    }

    override onCopy(callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.onCommandExecuted((command) => {
            if (command.id === CopyCommand.id) {
                callback();
            }
        });
    }

    override onBeforePaste(callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.beforeCommandExecuted((command) => {
            if (command.id === PasteCommand.id) {
                callback();
            }
        });
    }

    override onPaste(callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.onCommandExecuted((command) => {
            if (command.id === PasteCommand.id || command.id === SheetPasteShortKeyCommandName) {
                callback();
            }
        });
    }
}

FHooks.extend(FHooksSheetsMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FHooks extends IFHooksSheetsUIMixin {}
}
