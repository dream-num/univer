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
import type { IDialogPartMethodOptions, ISidebarMethodOptions } from '@univerjs/ui';
import { FUniver } from '@univerjs/core';
import { ComponentManager, CopyCommand, IDialogService, ISidebarService, PasteCommand } from '@univerjs/ui';

interface IFUniverUIMixin {
    copy(): Promise<boolean>;

    paste(): Promise<boolean>;

    /**
     * Open a sidebar.
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a dialog.
     * @param dialog the dialog options
     * @returns the disposable object
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;

    /**
     * Get the component manager
     * @returns The component manager
     */
    getComponentManager(): ComponentManager;
}

class FUniverUIMixin extends FUniver implements IFUniverUIMixin {
    override copy(): Promise<boolean> {
        return this._commandService.executeCommand(CopyCommand.id);
    }

    override paste(): Promise<boolean> {
        return this._commandService.executeCommand(PasteCommand.id);
    }

    override openSiderbar(params: ISidebarMethodOptions): IDisposable {
        const sideBarService = this._injector.get(ISidebarService);
        return sideBarService.open(params);
    }

    override openDialog(dialog: IDialogPartMethodOptions): IDisposable {
        const dialogService = this._injector.get(IDialogService);
        const disposable = dialogService.open({
            ...dialog,
            onClose: () => {
                disposable.dispose();
            },
        });
        return disposable;
    }

    override getComponentManager(): ComponentManager {
        return this._injector.get(ComponentManager);
    }
}

FUniver.extend(FUniverUIMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverUIMixin {}
}
