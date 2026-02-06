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
import { CanceledError, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '@univerjs/sheets-note';

/**
 * @ignore
 */
export interface IFUniverSheetNoteMixin {
    // Add any note-specific methods here if needed
}

export class FUniverSheetNoteMixin extends FUniver implements IFUniverSheetNoteMixin {
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteAdd,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && !change.oldNote && change.newNote) {
                            const { unitId, subUnitId, newNote } = change;
                            const target = this.getSheetTarget(unitId, subUnitId);
                            if (!target) {
                                return;
                            }
                            const { workbook, worksheet } = target;

                            this.fireEvent(this.Event.SheetNoteAdd, {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                                note: newNote,
                            });
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteDelete,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && !change.newNote) {
                            const { unitId, subUnitId, oldNote } = change;
                            const target = this.getSheetTarget(unitId, subUnitId);
                            if (!target) {
                                return;
                            }
                            const { workbook, worksheet } = target;

                            this.fireEvent(this.Event.SheetNoteDelete, {
                                workbook,
                                worksheet,
                                row: oldNote.row,
                                col: oldNote.col,
                                oldNote,
                            });
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteUpdate,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && change.newNote) {
                            const { unitId, subUnitId, oldNote, newNote } = change;
                            const target = this.getSheetTarget(unitId, subUnitId);
                            if (!target) {
                                return;
                            }
                            const { workbook, worksheet } = target;

                            this.fireEvent(this.Event.SheetNoteUpdate, {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                                note: newNote,
                                oldNote,
                            });
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteShow,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && change.newNote && !change.oldNote.show && change.newNote.show) {
                            const { unitId, subUnitId, newNote } = change;
                            const target = this.getSheetTarget(unitId, subUnitId);
                            if (!target) {
                                return;
                            }
                            const { workbook, worksheet } = target;

                            this.fireEvent(this.Event.SheetNoteShow, {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                            });
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteHide,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && change.newNote && change.oldNote.show && !change.newNote.show) {
                            const { unitId, subUnitId, newNote } = change;
                            const target = this.getSheetTarget(unitId, subUnitId);
                            if (!target) {
                                return;
                            }
                            const { workbook, worksheet } = target;

                            this.fireEvent(this.Event.SheetNoteHide, {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                            });
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteAdd,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetUpdateNoteCommand.id) {
                        const { unitId, sheetId, row, col, note } = command.params as IUpdateNoteMutationParams;

                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) return;

                        const model = injector.get(SheetsNoteModel);
                        const oldNote = model.getNote(unitId, sheetId, { noteId: note.id, row, col });
                        if (oldNote) return;

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
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteDelete,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetDeleteNoteCommand.id) {
                        const { unitId, sheetId, row, col } = command.params as IRemoveNoteMutationParams;
                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) return;
                        if (row === undefined || col === undefined) return;
                        const model = injector.get(SheetsNoteModel);
                        const oldNote = model.getNote(unitId, sheetId, { row, col });
                        if (!oldNote) return;

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
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteUpdate,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetUpdateNoteCommand.id) {
                        const { unitId, sheetId, row, col, note } = command.params as IUpdateNoteMutationParams;

                        const target = this.getSheetTarget(unitId, sheetId);
                        if (!target) return;

                        const model = injector.get(SheetsNoteModel);
                        const oldNote = model.getNote(unitId, sheetId, { row, col });
                        if (!oldNote) return;

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
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteShow,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetToggleNotePopupCommand.id) {
                        const target = getSheetCommandTarget(injector.get(IUniverInstanceService));
                        if (!target) return;

                        const { unitId, subUnitId } = target;
                        const workbook = this.getUniverSheet(unitId);
                        if (!workbook) return;
                        const worksheet = workbook.getSheetBySheetId(subUnitId);
                        if (!worksheet) return;

                        const sheetsSelectionsService = injector.get(SheetsSelectionsService);
                        const selection = sheetsSelectionsService.getCurrentLastSelection();
                        if (!selection?.primary) return;

                        const sheetsNoteModel = injector.get(SheetsNoteModel);
                        const { actualColumn, actualRow } = selection.primary;
                        const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
                        if (!note || note.show) return;

                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteShow, {
                            workbook,
                            worksheet,
                            row: actualRow,
                            col: actualColumn,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteHide,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetToggleNotePopupCommand.id) {
                        const target = getSheetCommandTarget(injector.get(IUniverInstanceService));
                        if (!target) return;

                        const { unitId, subUnitId } = target;
                        const workbook = this.getUniverSheet(unitId);
                        if (!workbook) return;
                        const worksheet = workbook.getSheetBySheetId(subUnitId);
                        if (!worksheet) return;

                        const sheetsSelectionsService = injector.get(SheetsSelectionsService);
                        const selection = sheetsSelectionsService.getCurrentLastSelection();
                        if (!selection?.primary) return;

                        const sheetsNoteModel = injector.get(SheetsNoteModel);
                        const { actualColumn, actualRow } = selection.primary;
                        const note = sheetsNoteModel.getNote(unitId, subUnitId, { row: actualRow, col: actualColumn });
                        if (!note || !note.show) return;

                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteHide, {
                            workbook,
                            worksheet,
                            row: actualRow,
                            col: actualColumn,
                        });
                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );
    }
}

FUniver.extend(FUniverSheetNoteMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetNoteMixin {}
}
