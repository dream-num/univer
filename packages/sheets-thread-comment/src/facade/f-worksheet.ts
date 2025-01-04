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
import type { IAddCommentCommandParams } from '@univerjs/thread-comment';
import { ICommandService } from '@univerjs/core';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { FWorksheet } from '@univerjs/sheets/facade';
import { AddCommentCommand } from '@univerjs/thread-comment';
import { FThreadComment } from './f-thread-comment';

export interface IFWorksheetCommentMixin {
    /**
     * Get all comments in the current sheet
     * @returns all comments in the current sheet
     */
    getComments(): FThreadComment[];

    /**
     * Subscribe to comment events.
     * @param callback (cellPos: Nullable<IHoverCellPosition>) => void Callback function, param contains comment info and target cell.
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook().getActiveSheet().onCommented((params) => {...})
     * ```
     */
    onCommented(callback: (params: IAddCommentCommandParams) => void): IDisposable;
}

export class FWorksheetCommentMixin extends FWorksheet implements IFWorksheetCommentMixin {
    override getComments(): FThreadComment[] {
        const sheetsTheadCommentModel = this._injector.get(SheetsThreadCommentModel);
        const comments = sheetsTheadCommentModel.getSubUnitAll(this._workbook.getUnitId(), this._worksheet.getSheetId());
        return comments.map((comment) => this._injector.createInstance(FThreadComment, comment));
    }

    override onCommented(callback: (params: IAddCommentCommandParams) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);
        return commandService.onCommandExecuted((command) => {
            if (command.id === AddCommentCommand.id) {
                const params = command.params as IAddCommentCommandParams;
                callback(params);
            }
        });
    }
}

FWorksheet.extend(FWorksheetCommentMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetCommentMixin {}
}
