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

import { ICommandService } from '@univerjs/core';
import { CancelZenEditCommand, ConfirmZenEditCommand, OpenZenEditorCommand } from '@univerjs/sheets-zen-editor';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IFWorkbookSheetsZenEditorMixin {
     /**
      * Start the zen editing process
      * @returns A promise that resolves to a boolean indicating whether the zen editing process was started successfully.
      * @example
      * ```ts
      * univerAPI.getActiveWorkbook().startZenEditingAsync();
      * ```
      */
    startZenEditingAsync(): Promise<boolean>;

     /**
      * End the zen editing process
      * @async
      * @param {boolean} save - Whether to save the changes, default is true
      * @returns A promise that resolves to a boolean indicating whether the zen editing process was ended successfully.
      * @example
      * ```ts
      * univerAPI.getActiveWorkbook().endZenEditingAsync(false);
      * ```
      */
    endZenEditingAsync(save?: boolean): Promise<boolean>;
}

export class FWorkbookSheetsZenEditorMixin extends FWorkbook implements IFWorkbookSheetsZenEditorMixin {
    override startZenEditingAsync(): Promise<boolean> {
        const commandService = this._injector.get(ICommandService);

        return commandService.executeCommand(OpenZenEditorCommand.id);
    }

    override endZenEditingAsync(save = true): Promise<boolean> {
        const commandService = this._injector.get(ICommandService);

        return save
            ? commandService.executeCommand(ConfirmZenEditCommand.id)
            : commandService.executeCommand(CancelZenEditCommand.id);
    }
}

FWorkbook.extend(FWorkbookSheetsZenEditorMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsZenEditorMixin {}
}
