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

import { ICommandService, IUniverInstanceService, Univer } from '@univerjs/core';
import type { IRegisterFunctionParams, IUnregisterFunctionParams } from '@univerjs/sheets-formula';
import type { CommandListener, IWorkbookData } from '@univerjs/core';
import {
    BorderStyleTypes,
    UndoCommand,
    WrapStrategy,
} from '@univerjs/core';
import { IRegisterFunctionService } from '@univerjs/sheets-formula';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FWorkbook } from './sheet/f-workbook';

export class FUniver {
    /**
     * Create a FUniver instance, if the injector is not provided, it will create a new Univer instance.
     */
    static newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        return injector.createInstance(FUniver);
    }

    static BorderStyle = BorderStyleTypes;
    static WrapStrategy = WrapStrategy;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRegisterFunctionService private readonly _registerFunctionService: IRegisterFunctionService
    ) {}

    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     * @param data the snapshot of the spreadsheet.
     * @returns Spreadsheet API instance.
     */
    createUniverSheet(data: IWorkbookData): FWorkbook {
        const workbook = this._univerInstanceService.createSheet(data);
        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     * @param id the spreadsheet id.
     * @returns Spreadsheet API instance.
     */
    getUniverSheet(id: string): FWorkbook | null {
        const workbook = this._univerInstanceService.getUniverSheetInstance(id);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Get the currently focused Univer spreadsheet.
     * @returns the currently focused Univer spreadsheet.
     */
    getCurrentUniverSheet(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    registerFunction(config: IRegisterFunctionParams) {
        this._registerFunctionService.registerFunctions(config);
    }

    unregisterFunction(config: IUnregisterFunctionParams) {
        this._registerFunctionService.unregisterFunctions(config);
    }

    // #region

    /**
     * Undo an editing on the currently focused document.
     * @returns redo result
     */
    undo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    /**
     * Redo an editing on the currently focused document.
     * @returns redo result
     */
    redo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    // #endregion

    // #region editing

    // #callback

    // #region listeners

    /**
     * Register a callback that will be triggered when a command is invoked.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command) => {
            callback(command);
        });
    }

    // @endregion
}
