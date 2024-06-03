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

import type { CommandListener, DocumentDataModel, IDocumentData, IExecutionOptions, IWorkbookData,
    Nullable,
    Workbook } from '@univerjs/core';
import {
    BorderStyleTypes,
    debounce,
    ICommandService,
    IUniverInstanceService,
    toDisposable,
    UndoCommand,
    Univer,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import { ISocketService, WebSocketService } from '@univerjs/network';
import type { IRegisterFunctionParams } from '@univerjs/sheets-formula';
import { IRegisterFunctionService, RegisterFunctionService } from '@univerjs/sheets-formula';
import type { Dependency, IDisposable } from '@wendellhu/redi';
import { Inject, Injector, Quantity } from '@wendellhu/redi';

import type { RenderComponentType, SheetComponent, SheetExtension } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import { SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { FDocument } from './docs/f-document';
import { FWorkbook } from './sheets/f-workbook';
import { FSheetHooks } from './sheets/f-sheet-hooks';
import { FHooks } from './f-hooks';

export class FUniver {
    /**
     * Get dependencies for FUniver, you can override newAPI to add more dependencies.
     * @param injector
     * @param derivedDependencies
     * @returns
     */
    protected static getDependencies(injector: Injector, derivedDependencies?: []): Dependency[] {
        const dependencies: Dependency[] = derivedDependencies || [];
        // Is unified registration required?
        const socketService = injector.get(ISocketService, Quantity.OPTIONAL);
        if (!socketService) {
            dependencies.push([ISocketService, { useClass: WebSocketService }]);
        }
        return dependencies;
    }

    /**
     * Create a FUniver instance, if the injector is not provided, it will create a new Univer instance.
     * @param wrapped The Univer instance or injector.
     * @returns FUniver instance.
     *
     * @zh 创建一个 FUniver 实例，如果未提供注入器，将创建一个新的 Univer 实例。
     * @param_zh wrapped Univer 实例或注入器。
     * @returns_zh FUniver 实例。
     */
    static newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        const dependencies = FUniver.getDependencies(injector);
        dependencies.forEach((dependency) => injector.add(dependency));
        return injector.createInstance(FUniver);
    }

    static BorderStyle = BorderStyleTypes;
    static WrapStrategy = WrapStrategy;

    /**
     * registerFunction may be executed multiple times, triggering multiple formula forced refreshes
     */
    private _debouncedFormulaCalculation: () => void;

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISocketService private readonly _ws: ISocketService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        this._initialize();
    }

    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     * @param data The snapshot of the spreadsheet.
     * @returns Spreadsheet API instance.
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook {
        const workbook = this._univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Create a new document and get the API handler of that document.
     * @param data The snapshot of the document.
     * @returns Document API instance.
     */
    createUniverDoc(data: Partial<IDocumentData>): FDocument {
        const document = this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        return this._injector.createInstance(FDocument, document);
    }

    /**
     * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
     * @param unitId The `unitId` of the UniverSheet.
     * @returns If the UniverSheet is disposed successfully, return `true`, otherwise return `false`.
     */
    disposeUnit(unitId: string): boolean {
        return this._univerInstanceService.disposeUnit(unitId);
    }

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     * @param id The spreadsheet id.
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
     * Get the document API handler by the document id.
     * @param id The document id.
     * @returns Document API instance.
     */
    getUniverDoc(id: string): FDocument | null {
        const document = this._univerInstanceService.getUniverDocInstance(id);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    /**
     * Get the currently focused Univer spreadsheet.
     * @returns the currently focused Univer spreadsheet.
     */
    getActiveWorkbook(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Get the currently focused Univer document.
     * @returns the currently focused Univer document.
     */
    getActiveDocument(): FDocument | null {
        const document = this._univerInstanceService.getCurrentUniverDocInstance();
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    /**
     * Register a function to the spreadsheet.
     * @param config
     */
    registerFunction(config: IRegisterFunctionParams): IDisposable {
        let registerFunctionService = this._injector.get(IRegisterFunctionService);

        if (!registerFunctionService) {
            this._injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
            registerFunctionService = this._injector.get(IRegisterFunctionService);
        }

        const functionsDisposable = registerFunctionService.registerFunctions(config);

        // When the initialization workbook data already contains custom formulas, and then register the formula, you need to trigger a forced calculation to refresh the calculation results
        this._debouncedFormulaCalculation();

        return toDisposable(() => {
            functionsDisposable.dispose();
        });
    }

    /**
     * Register sheet row header render extensions.
     * @param unitId
     * @param extensions
     */
    registerSheetRowHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    /**
     * Register sheet column header render extensions.
     * @param unitId
     * @param extensions
     */
    registerSheetColumnHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    /**
     * Register sheet main render extensions.
     * @param unitId
     * @param uKeys
     */
    registerSheetMainExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.MAIN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
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

    // #region listeners

    /**
     * Register a callback that will be triggered before invoking a command.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    /**
     * Register a callback that will be triggered when a command is invoked.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    // #endregion

    /**
     * Execute command
     * @param id Command id
     * @param params Command params
     * @param options Command options
     * @returns Command Promise
     */
    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> {
        return this._commandService.executeCommand(id, params, options);
    }

    /**
     * Set WebSocket URL for WebSocketService
     * @param url WebSocketService URL
     * @returns WebSocket info and callback
     */
    createSocket(url: string) {
        const ws = this._ws.createSocket(url);

        if (!ws) {
            throw new Error('[WebSocketService]: failed to create socket!');
        }

        return ws;
    }

    /**
     * Get sheet hooks
     * @returns
     */
    getSheetHooks() {
        return this._injector.createInstance(FSheetHooks);
    }

    /**
     * Get hooks
     */
    getHooks() {
        return this._injector.createInstance(FHooks);
    }

    /**
     * Get sheet render component from render by unitId and view key.
     * @param unitId
     * @returns
     */
    private _getSheetRenderComponent(unitId: string, viewKey: SHEET_VIEW_KEY): Nullable<RenderComponentType> {
        const render = this._renderManagerService.getRenderById(unitId);
        if (!render) {
            throw new Error('Render not found');
        }

        const { components } = render;

        const renderComponent = components.get(viewKey);
        if (!renderComponent) {
            throw new Error('Render component not found');
        }

        return renderComponent;
    }

    private _initialize(): void {
        this._debouncedFormulaCalculation = debounce(() => {
            this._commandService.executeCommand(
                SetFormulaCalculationStartMutation.id,
                {
                    commands: [],
                    forceCalculation: true,
                },
                {
                    onlyLocal: true,
                }
            );
        }, 10);
    }
}
