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

import type {
    CommandListener,
    Dependency,
    DocumentDataModel,
    IDisposable,
    IDocumentData,
    IExecutionOptions,
    Injector,
    IWorkbookData,
    LifecycleStages,
    Nullable,

    Workbook } from '@univerjs/core';
import type {
    IColumnsHeaderCfgParam,
    IRowsHeaderCfgParam,
    RenderComponentType,
    SheetComponent,
    SheetExtension, SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/engine-render';
import type { ISocket } from '@univerjs/network';
import type { ISetCrosshairHighlightColorOperationParams } from '@univerjs/sheets-crosshair-highlight';
import type { IRegisterFunctionParams } from '@univerjs/sheets-formula';
import {
    BorderStyleTypes,
    debounce,
    FUniver,
    LifecycleService,
    Quantity,
    RedoCommand,
    toDisposable,
    UndoCommand,
    Univer,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import { SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ISocketService, WebSocketService } from '@univerjs/network';
import { FWorkbook } from '@univerjs/sheets/facade';
import { DisableCrosshairHighlightOperation, EnableCrosshairHighlightOperation, SetCrosshairHighlightColorOperation } from '@univerjs/sheets-crosshair-highlight';
import { IRegisterFunctionService, RegisterFunctionService } from '@univerjs/sheets-formula';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import { CopyCommand, PasteCommand } from '@univerjs/ui';
import { FDocument } from './docs/f-document';
import { FHooks } from './f-hooks';
import { FDataValidationBuilder } from './sheets/f-data-validation-builder';
import { FFormula } from './sheets/f-formula';
import { FPermission } from './sheets/f-permission';
import { FSheetHooks } from './sheets/f-sheet-hooks';

interface IFUniverLegacy {
    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     *
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @returns {FWorkbook} FWorkbook API instance.
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook;

    /**
     * Create a new document and get the API handler of that document.
     *
     * @param {Partial<IDocumentData>} data The snapshot of the document.
     * @returns {FDocument} FDocument API instance.
     */
    createUniverDoc(data: Partial<IDocumentData>): FDocument;

    /**
     * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
     *
     * @param unitId The unit id of the UniverSheet.
     * @returns Whether the Univer instance is disposed successfully.
     */
    disposeUnit(unitId: string): boolean;

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     *
     * @param {string} id The spreadsheet id.
     * @returns {FWorkbook | null} The spreadsheet API instance.
     */
    getUniverSheet(id: string): FWorkbook | null;

    /**
     * Get the document API handler by the document id.
     *
     * @param {string} id The document id.
     * @returns {FDocument | null} The document API instance.
     */
    getUniverDoc(id: string): FDocument | null;

    /**
     * Get the currently focused Univer spreadsheet.
     *
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet.
     */
    getActiveWorkbook(): FWorkbook | null;

    /**
     * Get the currently focused Univer document.
     *
     * @returns {FDocument | null} The currently focused Univer document.
     */
    getActiveDocument(): FDocument | null;
    /**
     * Register a function to the spreadsheet.
     *
     * @param {IRegisterFunctionParams} config The configuration of the function.
     * @returns {IDisposable} The disposable instance.
     */
    registerFunction(config: IRegisterFunctionParams): IDisposable;

    /**
     * Register sheet row header render extensions.
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetRowHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable;

    /**
     * Register sheet column header render extensions.
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetColumnHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable;
    /**
     * Register sheet main render extensions.
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetMainExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable;
    getFormula(): FFormula;
    /**
     * Get the current lifecycle stage.
     *
     * @returns {LifecycleStages} - The current lifecycle stage.
     */
    getCurrentLifecycleStage(): LifecycleStages;
    // #region

    /**
     * Undo an editing on the currently focused document.
     *
     * @returns {Promise<boolean>} undo result
     */
    undo(): Promise<boolean>;

    /**
     * Redo an editing on the currently focused document.
     *
     * @returns {Promise<boolean>} redo result
     */
    redo(): Promise<boolean>;

    copy(): Promise<boolean>;

    paste(): Promise<boolean>;

    // #endregion

    // #region listeners

    /**
     * Register a callback that will be triggered before invoking a command.
     *
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable;

    /**
     * Register a callback that will be triggered when a command is invoked.
     *
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onCommandExecuted(callback: CommandListener): IDisposable;

    // #endregion

    /**
     * Execute command
     *
     * @param {string} id Command ID
     * @param {object} params Command parameters
     * @param {IExecutionOptions} options Command execution options
     * @returns {Promise<R>} Command execution result
     */
    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R>;

    /**
     * Set WebSocket URL for WebSocketService
     *
     * @param {string} url WebSocket URL
     * @returns {ISocket} WebSocket instance
     */
    createSocket(url: string): ISocket;

    /**
     * Get sheet hooks
     *
     * @returns {FSheetHooks} FSheetHooks instance
     */
    getSheetHooks(): FSheetHooks;

    /**
     * Get hooks
     *
     * @returns {FHooks} FHooks instance
     */
    getHooks(): FHooks;

    /**
     * Customize the column header of the spreadsheet.
     *
     * @param {IColumnsHeaderCfgParam} cfg The configuration of the column header.
     *
     * @example
     * ```typescript
     * customizeColumnHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, columnsCfg: ['MokaII', undefined, null, { text: 'Size', textAlign: 'left' }] });
     * ```
     */
    customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void;

    /**
     * Customize the row header of the spreadsheet.
     *
     * @param {IRowsHeaderCfgParam} cfg The configuration of the row header.
     *
     * @example
     * ```typescript
     * customizeRowHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, rowsCfg: ['MokaII', undefined, null, { text: 'Size', textAlign: 'left' }] });
     * ```
     */
    customizeRowHeader(cfg: IRowsHeaderCfgParam): void;

    // #region API applies to all workbooks

    /**
     * Enable or disable crosshair highlight.
     * @param {boolean} enabled if crosshair highlight should be enabled
     */
    setCrosshairHighlightEnabled(enabled: boolean): void;

    /**
     * Set the color of the crosshair highlight.
     * @param {string} color the color of the crosshair highlight
     */
    setCrosshairHighlightColor(color: string): void;
    // #endregion

    /**
     * Get the PermissionInstance.
     *
     * @returns {FPermission} - The PermissionInstance.
     */
    getPermission(): FPermission;
}

class FUniverLegacy extends FUniver implements IFUniverLegacy {
    static BorderStyle = BorderStyleTypes;

    static WrapStrategy = WrapStrategy;

    /**
     * Initialize the FUniver instance.
     *
     * @private
     */
    override _initialize(): void {
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

    /**
     * Get dependencies for FUniver, you can override newAPI to add more dependencies.
     *
     * @static
     * @protected
     *
     * @param {Injector} injector - The injector instance used to retrieve dependencies.
     * @param {Dependency[]} [derivedDependencies] - Optional array of pre-derived dependencies.
     * @returns {Dependency[]} - An array of dependencies required by the service.
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
     * Create an FUniver instance, if the injector is not provided, it will create a new Univer instance.
     *
     * @static
     *
     * @param {Univer | Injector} wrapped - The Univer instance or injector instance.
     * @returns {FUniver} - The FUniver instance.
     */
    static override newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        const dependencies = FUniverLegacy.getDependencies(injector);
        dependencies.forEach((dependency) => injector.add(dependency));
        return injector.createInstance(FUniver);
    }

    static override newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    /**
     * registerFunction may be executed multiple times, triggering multiple formula forced refreshes
     */
    private _debouncedFormulaCalculation: () => void;

    override createUniverSheet(data: Partial<IWorkbookData>): FWorkbook {
        const workbook = this._univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        return this._injector.createInstance(FWorkbook, workbook);
    }

    override createUniverDoc(data: Partial<IDocumentData>): FDocument {
        const document = this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        return this._injector.createInstance(FDocument, document);
    }

    override disposeUnit(unitId: string): boolean {
        return this._univerInstanceService.disposeUnit(unitId);
    }

    override getUniverSheet(id: string): FWorkbook | null {
        const workbook = this._univerInstanceService.getUniverSheetInstance(id);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getUniverDoc(id: string): FDocument | null {
        const document = this._univerInstanceService.getUniverDocInstance(id);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    override getActiveWorkbook(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getActiveDocument(): FDocument | null {
        const document = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    override registerFunction(config: IRegisterFunctionParams): IDisposable {
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

    override registerSheetRowHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    override registerSheetColumnHeaderExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    override registerSheetMainExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.MAIN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    override getFormula(): FFormula {
        return this._injector.createInstance(FFormula);
    }

    override getCurrentLifecycleStage(): LifecycleStages {
        const lifecycleService = this._injector.get(LifecycleService);
        return lifecycleService.stage;
    }

    // #region

    override undo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    override redo(): Promise<boolean> {
        return this._commandService.executeCommand(RedoCommand.id);
    }

    override copy(): Promise<boolean> {
        return this._commandService.executeCommand(CopyCommand.id);
    }

    override paste(): Promise<boolean> {
        return this._commandService.executeCommand(PasteCommand.id);
    }

    // #endregion

    // #region listeners

    override onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    override onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    // #endregion

    override executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> {
        return this._commandService.executeCommand(id, params, options);
    }

    override createSocket(url: string): ISocket {
        const wsService = this._injector.get(ISocketService);
        const ws = wsService.createSocket(url);

        if (!ws) {
            throw new Error('[WebSocketService]: failed to create socket!');
        }

        return ws;
    }

    override getSheetHooks(): FSheetHooks {
        return this._injector.createInstance(FSheetHooks);
    }

    override getHooks(): FHooks {
        return this._injector.createInstance(FHooks);
    }

    /**
     * Get sheet render component from render by unitId and view key.
     *
     * @private
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SHEET_VIEW_KEY} viewKey The view key of the spreadsheet.
     * @returns {Nullable<RenderComponentType>} The render component.
     */
    private _getSheetRenderComponent(unitId: string, viewKey: SHEET_VIEW_KEY): Nullable<RenderComponentType> {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);
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

    override customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void {
        const wb = this.getActiveWorkbook();
        if (!wb) {
            console.error('WorkBook not exist');
            return;
        }
        const unitId = wb?.getId();
        const sheetColumn = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        sheetColumn.setCustomHeader(cfg);
    }

    override customizeRowHeader(cfg: IRowsHeaderCfgParam): void {
        const wb = this.getActiveWorkbook();
        if (!wb) {
            console.error('WorkBook not exist');
            return;
        }
        const unitId = wb?.getId();
        const sheetRow = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        sheetRow.setCustomHeader(cfg);
    }

    // #region API applies to all workbooks

    override setCrosshairHighlightEnabled(enabled: boolean): void {
        if (enabled) {
            this._commandService.executeCommand(EnableCrosshairHighlightOperation.id);
        } else {
            this._commandService.executeCommand(DisableCrosshairHighlightOperation.id);
        }
    }

    override setCrosshairHighlightColor(color: string): void {
        this._commandService.executeCommand(SetCrosshairHighlightColorOperation.id, {
            value: color,
        } as ISetCrosshairHighlightColorOperationParams);
    }

    // #endregion

    override getPermission(): FPermission {
        return this._injector.createInstance(FPermission);
    }
}

FUniver.extend(FUniverLegacy);

export { FUniver };

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/no-namespace
    namespace FUniver {
        function newDataValidation(): FDataValidationBuilder;
    }

    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverLegacy {}
}
