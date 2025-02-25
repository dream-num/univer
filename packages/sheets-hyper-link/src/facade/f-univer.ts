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

import type { Injector } from '@univerjs/core';
import type { IAddHyperLinkCommandParams, ICancelHyperLinkCommandParams, IUpdateHyperLinkCommandParams } from '@univerjs/sheets-hyper-link';
import type { IBeforeSheetLinkAddEvent, IBeforeSheetLinkCancelEvent, IBeforeSheetLinkUpdateEvent } from './f-event';
import { CanceledError, ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { AddHyperLinkCommand, CancelHyperLinkCommand, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link';

export class FSheetLinkUniver extends FUniver {
    /**
     * @ignore
     */
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.BeforeSheetLinkAdd,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== AddHyperLinkCommand.id) return;

                const eventTarget = this.getCommandSheetTarget(commandInfo);
                if (!eventTarget) return;

                const params = commandInfo.params as IAddHyperLinkCommandParams;
                const eventParams: IBeforeSheetLinkAddEvent = {
                    workbook: eventTarget.workbook,
                    worksheet: eventTarget.worksheet,
                    row: params.link.row,
                    col: params.link.column,
                    link: params.link,
                };
                this.fireEvent(this.Event.BeforeSheetLinkAdd, eventParams);
                if (eventParams.cancel) {
                    throw new CanceledError();
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetLinkUpdate,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== UpdateHyperLinkCommand.id) return;

                const eventTarget = this.getCommandSheetTarget(commandInfo);
                if (!eventTarget) return;

                const params = commandInfo.params as IUpdateHyperLinkCommandParams;
                const eventParams: IBeforeSheetLinkUpdateEvent = {
                    workbook: eventTarget.workbook,
                    worksheet: eventTarget.worksheet,
                    row: params.row,
                    column: params.column,
                    id: params.id,
                    payload: params.payload,
                };
                this.fireEvent(this.Event.BeforeSheetLinkUpdate, eventParams);
                if (eventParams.cancel) {
                    throw new CanceledError();
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetLinkCancel,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== CancelHyperLinkCommand.id) return;

                const eventTarget = this.getCommandSheetTarget(commandInfo);
                if (!eventTarget) return;

                const params = commandInfo.params as ICancelHyperLinkCommandParams;
                const eventParams: IBeforeSheetLinkCancelEvent = {
                    workbook: eventTarget.workbook,
                    worksheet: eventTarget.worksheet,
                    row: params.row,
                    column: params.column,
                    id: params.id,
                };
                this.fireEvent(this.Event.BeforeSheetLinkCancel, eventParams);
                if (eventParams.cancel) {
                    throw new CanceledError();
                }
            })
        );
    }
}

FUniver.extend(FSheetLinkUniver);
