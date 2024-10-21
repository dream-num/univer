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
    IWorkbookData,
    LifecycleStages,
    Nullable,
    Workbook,
} from '@univerjs/core';
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
import type { ISetGridlineColorOperationParams } from '@univerjs/sheets-ui';
import type { IImageWatermarkConfig, ITextWatermarkConfig } from '@univerjs/watermark';
import {
    BorderStyleTypes,
    debounce,
    ICommandService,
    Inject,
    Injector,
    IUniverInstanceService,
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
import { DisableCrosshairHighlightOperation, EnableCrosshairHighlightOperation, SetCrosshairHighlightColorOperation } from '@univerjs/sheets-crosshair-highlight';
import { IRegisterFunctionService, RegisterFunctionService } from '@univerjs/sheets-formula';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import { CopyCommand, PasteCommand } from '@univerjs/ui';
import { IWatermarkTypeEnum, WatermarkImageBaseConfig, WatermarkService, WatermarkTextBaseConfig } from '@univerjs/watermark';
import { FDocument } from './docs/f-document';
import { FHooks } from './f-hooks';
import { FDataValidationBuilder } from './sheets/f-data-validation-builder';
import { FFormula } from './sheets/f-formula';
import { FPermission } from './sheets/f-permission';
import { FSheetHooks } from './sheets/f-sheet-hooks';
import { FWorkbook } from './sheets/f-workbook';

export class FUniver {
    static BorderStyle = BorderStyleTypes;

    static WrapStrategy = WrapStrategy;

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        this._initialize();
    }

    /**
     * Initialize the FUniver instance.
     *
     * @private
     */
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
    static newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        const dependencies = FUniver.getDependencies(injector);
        dependencies.forEach((dependency) => injector.add(dependency));
        return injector.createInstance(FUniver);
    }

    static newDataValidation(): FDataValidationBuilder {
        return new FDataValidationBuilder();
    }

    /**
     * registerFunction may be executed multiple times, triggering multiple formula forced refreshes
     */
    private _debouncedFormulaCalculation: () => void;

    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     *
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @returns {FWorkbook} FWorkbook API instance.
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook {
        const workbook = this._univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Create a new document and get the API handler of that document.
     *
     * @param {Partial<IDocumentData>} data The snapshot of the document.
     * @returns {FDocument} FDocument API instance.
     */
    createUniverDoc(data: Partial<IDocumentData>): FDocument {
        const document = this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        return this._injector.createInstance(FDocument, document);
    }

    /**
     * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
     *
     * @param unitId The unit id of the UniverSheet.
     * @returns Whether the Univer instance is disposed successfully.
     */
    disposeUnit(unitId: string): boolean {
        return this._univerInstanceService.disposeUnit(unitId);
    }

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     *
     * @param {string} id The spreadsheet id.
     * @returns {FWorkbook | null} The spreadsheet API instance.
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
     *
     * @param {string} id The document id.
     * @returns {FDocument | null} The document API instance.
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
     *
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet.
     */
    getActiveWorkbook(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Get the currently focused Univer document.
     *
     * @returns {FDocument | null} The currently focused Univer document.
     */
    getActiveDocument(): FDocument | null {
        const document = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    /**
     * Register a function to the spreadsheet.
     *
     * @param {IRegisterFunctionParams} config The configuration of the function.
     * @returns {IDisposable} The disposable instance.
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
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
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
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
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
     *
     * @param {string} unitId The unit id of the spreadsheet.
     * @param {SheetExtension[]} extensions The extensions to register.
     * @returns {IDisposable} The disposable instance.
     */
    registerSheetMainExtension(unitId: string, ...extensions: SheetExtension[]): IDisposable {
        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.MAIN) as SheetComponent;
        const registerDisposable = sheetComponent.register(...extensions);

        return toDisposable(() => {
            registerDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    getFormula(): FFormula {
        return this._injector.createInstance(FFormula);
    }

    /**
     * Get the current lifecycle stage.
     *
     * @returns {LifecycleStages} - The current lifecycle stage.
     */
    getCurrentLifecycleStage(): LifecycleStages {
        const lifecycleService = this._injector.get(LifecycleService);
        return lifecycleService.stage;
    }

    // #region

    /**
     * Undo an editing on the currently focused document.
     *
     * @returns {Promise<boolean>} undo result
     */
    undo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    /**
     * Redo an editing on the currently focused document.
     *
     * @returns {Promise<boolean>} redo result
     */
    redo(): Promise<boolean> {
        return this._commandService.executeCommand(RedoCommand.id);
    }

    copy(): Promise<boolean> {
        return this._commandService.executeCommand(CopyCommand.id);
    }

    paste(): Promise<boolean> {
        return this._commandService.executeCommand(PasteCommand.id);
    }

    // #endregion

    // #region listeners

    /**
     * Register a callback that will be triggered before invoking a command.
     *
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    /**
     * Register a callback that will be triggered when a command is invoked.
     *
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

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
    ): Promise<R> {
        return this._commandService.executeCommand(id, params, options);
    }

    /**
     * Set WebSocket URL for WebSocketService
     *
     * @param {string} url WebSocket URL
     * @returns {ISocket} WebSocket instance
     */
    createSocket(url: string): ISocket {
        const wsService = this._injector.get(ISocketService);
        const ws = wsService.createSocket(url);

        if (!ws) {
            throw new Error('[WebSocketService]: failed to create socket!');
        }

        return ws;
    }

    /**
     * Get sheet hooks
     *
     * @returns {FSheetHooks} FSheetHooks instance
     */
    getSheetHooks(): FSheetHooks {
        return this._injector.createInstance(FSheetHooks);
    }

    /**
     * Get hooks
     *
     * @returns {FHooks} FHooks instance
     */
    getHooks(): FHooks {
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
    customizeColumnHeader(cfg: IColumnsHeaderCfgParam): void {
        const wb = this.getActiveWorkbook();
        if (!wb) {
            console.error('WorkBook not exist');
            return;
        }
        const unitId = wb?.getId();
        const sheetColumn = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        sheetColumn.setCustomHeader(cfg);
    }

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
    customizeRowHeader(cfg: IRowsHeaderCfgParam): void {
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

    /**
     * Enable or disable crosshair highlight.
     * @param {boolean} enabled if crosshair highlight should be enabled
     */
    setCrosshairHighlightEnabled(enabled: boolean): void {
        if (enabled) {
            this._commandService.executeCommand(EnableCrosshairHighlightOperation.id);
        } else {
            this._commandService.executeCommand(DisableCrosshairHighlightOperation.id);
        }
    }

    /**
     * Set the color of the crosshair highlight.
     * @param {string} color the color of the crosshair highlight
     */
    setCrosshairHighlightColor(color: string): void {
        this._commandService.executeCommand(SetCrosshairHighlightColorOperation.id, {
            value: color,
        } as ISetCrosshairHighlightColorOperationParams);
    }

    // #endregion

    /**
     * Get the PermissionInstance.
     *
     * @returns {FPermission} - The PermissionInstance.
     */
    getPermission(): FPermission {
        return this._injector.createInstance(FPermission);
    }

    // #region watermark

    /**
     * Adds a watermark to the unit. Supports both text and image watermarks based on the specified type.
     *
     * @param {IWatermarkTypeEnum.Text | IWatermarkTypeEnum.Image} type - The type of watermark to add. Can be either 'Text' or 'Image'.
     * @param {ITextWatermarkConfig | IImageWatermarkConfig} config - The configuration object for the watermark.
     * - If the type is 'Text', the config should follow the ITextWatermarkConfig interface.
     * - If the type is 'Image', the config should follow the IImageWatermarkConfig interface.
     * @throws {Error} Throws an error if the watermark type is unknown.
     */
    addWatermark(type: IWatermarkTypeEnum.Text, config: ITextWatermarkConfig): void;
    addWatermark(type: IWatermarkTypeEnum.Image, config: IImageWatermarkConfig): void;
    addWatermark(
        type: IWatermarkTypeEnum.Text | IWatermarkTypeEnum.Image,
        config: ITextWatermarkConfig | IImageWatermarkConfig
    ): void {
        const watermarkService = this._injector.get(WatermarkService);
        if (type === IWatermarkTypeEnum.Text) {
            watermarkService.updateWatermarkConfig({
                type: IWatermarkTypeEnum.Text,
                config: {
                    text: {
                        ...WatermarkTextBaseConfig,
                        ...config,
                    },
                },
            });
        } else if (type === IWatermarkTypeEnum.Image) {
            watermarkService.updateWatermarkConfig({
                type: IWatermarkTypeEnum.Image,
                config: {
                    image: {
                        ...WatermarkImageBaseConfig,
                        ...config,
                    },
                },
            });
        } else {
            throw new Error('Unknown watermark type');
        }
    }

    /**
     * Deletes the currently applied watermark from the unit.
     *
     * This function retrieves the watermark service and invokes the method to remove any existing watermark configuration.
     */
    deleteWatermark(): void {
        const watermarkService = this._injector.get(WatermarkService);
        watermarkService.deleteWatermarkConfig();
    }

    // #endregion
}
