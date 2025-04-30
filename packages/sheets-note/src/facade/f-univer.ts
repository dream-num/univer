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
import type { IRemoveNoteMutationParams, IUpdateNoteMutationParams } from '@univerjs/sheets-note';
import { CanceledError, ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '@univerjs/sheets-note';

/**
 * @ignore
 */
export interface IFUniverSheetNoteMixin {
    // Add any note-specific methods here if needed
}

export class FUniverSheetNoteMixin extends FUniver implements IFUniverSheetNoteMixin {
    override _initialize(injector: Injector): void {
        this.registerEventHandler(
            this.Event.SheetNoteAdd,
            () => {
                const model = injector.get(SheetsNoteModel);
                return model.change$.subscribe((change) => {
                    if (change.type === 'update' && !change.oldNote && change.note) {
                        const { unitId, sheetId, row, col, note, oldNote } = change;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;

                        this.fireEvent(this.Event.SheetNoteAdd, {
                            workbook,
                            worksheet,
                            row,
                            col,
                            note,
                        });
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.SheetNoteDelete,
            () => {
                const model = injector.get(SheetsNoteModel);
                return model.change$.subscribe((change) => {
                    if (change.type === 'update' && change.oldNote && !change.note) {
                        const { unitId, sheetId, row, col, note, oldNote } = change;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;

                        this.fireEvent(this.Event.SheetNoteDelete, {
                            workbook,
                            worksheet,
                            row,
                            col,
                            oldNote,
                        });
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.SheetNoteUpdate,
            () => {
                const model = injector.get(SheetsNoteModel);
                return model.change$.subscribe((change) => {
                    if (change.type === 'update' && change.oldNote && change.note) {
                        const { unitId, sheetId, row, col, note, oldNote } = change;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;

                        this.fireEvent(this.Event.SheetNoteUpdate, {
                            workbook,
                            worksheet,
                            row,
                            col,
                            note,
                            oldNote,
                        });
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.SheetNoteShow,
            () => {
                const model = injector.get(SheetsNoteModel);
                return model.change$.subscribe((change) => {
                    if (change.type === 'update' && change.oldNote && change.note && !change.oldNote.show && change.note.show) {
                        const { unitId, sheetId, row, col } = change;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;

                        this.fireEvent(this.Event.SheetNoteShow, {
                            workbook,
                            worksheet,
                            row,
                            col,
                        });
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.SheetNoteHide,
            () => {
                const model = injector.get(SheetsNoteModel);
                return model.change$.subscribe((change) => {
                    if (change.type === 'update' && change.oldNote && change.note && change.oldNote.show && !change.note.show) {
                        const { unitId, sheetId, row, col } = change;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;

                        this.fireEvent(this.Event.SheetNoteHide, {
                            workbook,
                            worksheet,
                            row,
                            col,
                        });
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.BeforeSheetNoteAdd,
            () => {
                const commandService = injector.get(ICommandService);
                return commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetUpdateNoteCommand.id) {
                        const model = injector.get(SheetsNoteModel);
                        const { unitId, sheetId, row, col, note } = command.params as IUpdateNoteMutationParams;
                        const oldNote = model.getNote(unitId, sheetId, row, col);
                        if (oldNote) return;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteAdd, {
                            workbook,
                            worksheet,
                            row,
                            col,
                            note,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.BeforeSheetNoteDelete,
            () => {
                const commandService = injector.get(ICommandService);
                return commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetDeleteNoteCommand.id) {
                        const model = injector.get(SheetsNoteModel);
                        const { unitId, sheetId, row, col } = command.params as IRemoveNoteMutationParams;
                        const oldNote = model.getNote(unitId, sheetId, row, col);
                        if (!oldNote) return;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteDelete, {
                            workbook,
                            worksheet,
                            row,
                            col,
                            oldNote,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.BeforeSheetNoteUpdate,
            () => {
                const commandService = injector.get(ICommandService);
                return commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetUpdateNoteCommand.id) {
                        const model = injector.get(SheetsNoteModel);
                        const { unitId, sheetId, row, col, note } = command.params as IUpdateNoteMutationParams;
                        const oldNote = model.getNote(unitId, sheetId, row, col);
                        if (!oldNote) return;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteUpdate, {
                            workbook,
                            worksheet,
                            row,
                            col,
                            note,
                            oldNote,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.BeforeSheetNoteShow,
            () => {
                const commandService = injector.get(ICommandService);
                return commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetToggleNotePopupCommand.id) {
                        const model = injector.get(SheetsNoteModel);
                        const { unitId, sheetId, row, col } = command.params as IUpdateNoteMutationParams;
                        const oldNote = model.getNote(unitId, sheetId, row, col);
                        if (oldNote?.show) return;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteShow, {
                            workbook,
                            worksheet,
                            row,
                            col,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                });
            }
        );

        this.registerEventHandler(
            this.Event.BeforeSheetNoteHide,
            () => {
                const commandService = injector.get(ICommandService);
                return commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetToggleNotePopupCommand.id) {
                        const model = injector.get(SheetsNoteModel);
                        const { unitId, sheetId, row, col } = command.params as IUpdateNoteMutationParams;
                        const oldNote = model.getNote(unitId, sheetId, row, col);
                        if (!oldNote?.show) return;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) {
                            return;
                        }
                        const { workbook, worksheet } = target;
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteHide, {
                            workbook,
                            worksheet,
                            row,
                            col,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                });
            }
        );
    }
}

FUniver.extend(FUniverSheetNoteMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetNoteMixin {}
}
