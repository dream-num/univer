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
import { ICommandService } from '@univerjs/core';
import { CopyCommand, PasteCommand } from '@univerjs/ui';
import type { FHooks } from '../f-hooks';

export const FClipboardHooks = {

    onBeforeCopy(this: FHooks, callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.beforeCommandExecuted((command) => {
            if (command.id === CopyCommand.id) {
                callback();
            }
        });
    },
    onCopy(this: FHooks, callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.onCommandExecuted((command) => {
            if (command.id === CopyCommand.id) {
                callback();
            }
        });
    },

    onBeforePaste(this: FHooks, callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.beforeCommandExecuted((command) => {
            if (command.id === PasteCommand.id) {
                callback();
            }
        });
    },
    onPaste(this: FHooks, callback: () => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.onCommandExecuted((command) => {
            if (command.id === PasteCommand.id) {
                callback();
            }
        });
    },
};
