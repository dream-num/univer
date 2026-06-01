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
import type { IBeforeSheetLinkAddEventParams, IBeforeSheetLinkCancelEventParams, IBeforeSheetLinkUpdateEventParams } from './f-event';
import { CanceledError, ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { AddHyperLinkCommand, CancelHyperLinkCommand, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link';

export class FUniverSheetsHyperlinkMixin extends FUniver {
    /**
     * @ignore
     */
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetLinkAdd,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== AddHyperLinkCommand.id) return;

                    const params = commandInfo.params as IAddHyperLinkCommandParams;
                    const target = this.getSheetCommandTarget(params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { link } = params;
                    const { row, column: col } = link;

                    const eventParams: IBeforeSheetLinkAddEventParams = {
                        workbook,
                        worksheet,
                        row,
                        col,
                        link,
                    };
                    this.fireEvent(this.Event.BeforeSheetLinkAdd, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetLinkUpdate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== UpdateHyperLinkCommand.id) return;

                    const params = commandInfo.params as IUpdateHyperLinkCommandParams;
                    const target = this.getSheetCommandTarget(params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { row, column, id, payload } = params;

                    const eventParams: IBeforeSheetLinkUpdateEventParams = {
                        workbook,
                        worksheet,
                        row,
                        column,
                        id,
                        payload,
                    };
                    this.fireEvent(this.Event.BeforeSheetLinkUpdate, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetLinkCancel,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== CancelHyperLinkCommand.id) return;

                    const params = commandInfo.params as ICancelHyperLinkCommandParams;
                    const target = this.getSheetCommandTarget(params);
                    if (!target) return;

                    const { workbook, worksheet } = target;
                    const { row, column, id } = params;

                    const eventParams: IBeforeSheetLinkCancelEventParams = {
                        workbook,
                        worksheet,
                        row,
                        column,
                        id,
                    };
                    this.fireEvent(this.Event.BeforeSheetLinkCancel, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                })
            )
        );
    }
}

FUniver.extend(FUniverSheetsHyperlinkMixin);
