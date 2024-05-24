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

/**
 * The facade API of Univer, which simplifies the usage of Univer.
 * @zh Univer Facade API，它简化了 Univer 的使用。
 */
export class FUniver {
    /**
     * Get dependencies for FUniver, you can override newAPI to add more dependencies.
     * @param injector
     * @param derivedDependencies
     * @returns dependencies
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
     * @paramZh wrapped Univer 实例或注入器。
     * @returnsZh FUniver 实例。
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
     *
     * @zh 创建一个新的工作簿并返回 `FWorkbook` 实例。
     * @paramZh data 表格的快照数据。
     * @returnsZh 工作簿对应的 `FWorkbook` 实例。
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook {
        const workbook = this._univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        return this._injector.createInstance(FWorkbook, workbook);
    }

    /**
     * Create a new document and get the API handler of that document.
     * @param data The snapshot of the document.
     * @returns Document API instance.
     *
     * @zh 创建一个新的文档并返回 `FDocument` 实例。
     * @paramZh data 文档的快照数据。
     * @returnsZh 文档对应的 `FDocument` 实例。
     */
    createUniverDoc(data: Partial<IDocumentData>): FDocument {
        const document = this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        return this._injector.createInstance(FDocument, document);
    }

    /**
     * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
     * @param unitId The `unitId` of the UniverSheet.
     * @returns If the UniverSheet is disposed successfully, return `true`, otherwise return `false`.
     *
     * @zh 通过 `unitId` 销毁 Univer 文档。Univer 文档将从应用中卸载。
     * @paramZh unitId Univer 文档的 `unitId`。
     * @returnsZh 如果 Univer 文档成功销毁，返回 `true`，否则返回 `false`。
     */
    disposeUnit(unitId: string): boolean {
        return this._univerInstanceService.disposeUnit(unitId);
    }

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     * @param id The spreadsheet id.
     * @returns Spreadsheet API instance.
     *
     * @zh 通过工作簿 id 获取 `FWorkbook` 实例。
     * @paramZh id 工作簿 id。
     * @returnsZh 工作簿对应的 `FWorkbook` 实例。
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
     *
     * @zh 通过文档 id 获取 `FDocument` 实例。
     * @paramZh id 文档 id。
     * @returnsZh 文档对应的 `FDocument` 实例。
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
     *
     * @zh 获取当前激活的工作簿。
     * @returnsZh 当前激活的工作簿。
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
     *
     * @zh 获取当前激活的文档。
     * @returnsZh 当前激活的文档。
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
     * @param config The function configuration.
     *
     * @zh 向表格注册一个自定义函数。
     * @paramZh config 函数配置。
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
     * @param unitId The unit id of the sheet.
     * @param extensions The extensions to register.
     *
     * @zh 注册表格行头渲染扩展。
     * @paramZh unitId 表格的 `unitId`。
     * @paramZh extensions 要注册的扩展。
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
     * @param unitId The unit id of the sheet.
     * @param extensions The extensions to register.
     *
     * @zh 注册表格列头渲染扩展。
     * @paramZh unitId 表格的 `unitId`。
     * @paramZh extensions 要注册的扩展。
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
     * @param unitId The unit id of the sheet.
     * @param extensions The extensions to register.
     *
     * @zh 注册表格主体渲染扩展。
     * @paramZh unitId 表格的 `unitId`。
     * @paramZh extensions 要注册的扩展。
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
     *
     * @zh 撤销当前文档的编辑操作。
     * @returnsZh 撤销命令执行结果。
     */
    undo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    /**
     * Redo an editing on the currently focused document.
     * @returns redo result
     *
     * @zh 重做当前文档的编辑操作。
     * @returnsZh 重做命令执行结果。
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
     *
     * @zh 注册一个在执行命令之前触发的回调。
     * @paramZh callback 回调函数。
     * @returnsZh 一个用于销毁监听的函数。
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
     *
     * @zh 注册一个在执行命令之后触发的回调。
     * @paramZh callback 回调函数。
     * @returnsZh 一个用于销毁监听的函数。
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    /**
     * Execute command
     * @param id Command id
     * @param params Command params
     * @param options Command options
     * @returns Command Promise
     *
     * @zh 执行命令
     * @paramZh id 命令 id
     * @paramZh params 命令参数
     * @paramZh options 命令选项
     * @returnsZh 命令 Promise
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
     *
     * @zh 设置 WebSocketService 的 URL
     * @paramZh url WebSocketService URL
     * @returnsZh WebSocket 信息和回调
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
     *
     * @zh 获取表格提供的 `hooks` API 实例。
     */
    getSheetHooks() {
        return this._injector.createInstance(FSheetHooks);
    }

    /**
     * Get sheet render component from render by unitId and view key.
     * @param unitId
     *
     * @zh 通过 `unitId` 和 `view key` 从 render 获取表格渲染组件。
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

    // @endregion
}
