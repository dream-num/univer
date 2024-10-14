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
    Dependency,
    DocumentDataModel,
    IDisposable,
    IDocumentData,
    Injector,
    LifecycleStages,
} from '@univerjs/core';
import type { ISocket } from '@univerjs/network';
import type { IRegisterFunctionParams } from '@univerjs/sheets-formula';
import {
    BorderStyleTypes,
    debounce,
    FUniver,
    Quantity,
    toDisposable,
    Univer,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import { SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { ISocketService, WebSocketService } from '@univerjs/network';
import { IRegisterFunctionService, RegisterFunctionService } from '@univerjs/sheets-formula';
import { CopyCommand, PasteCommand } from '@univerjs/ui';
import { FDocument } from './docs/f-document';
import { FHooks } from './f-hooks';
import { FFormula } from './sheets/f-formula';
import { FPermission } from './sheets/f-permission';

interface IFUniverLegacy {
    /**
     * Create a new document and get the API handler of that document.
     *
     * @param {Partial<IDocumentData>} data The snapshot of the document.
     * @returns {FDocument} FDocument API instance.
     */
    createUniverDoc(data: Partial<IDocumentData>): FDocument;
    /**
     * Get the document API handler by the document id.
     *
     * @param {string} id The document id.
     * @returns {FDocument | null} The document API instance.
     */
    getUniverDoc(id: string): FDocument | null;
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

    // TODO: why is not registerFunction part of FFormula? @Dushusir

    getFormula(): FFormula;
    /**
     * Get the current lifecycle stage.
     *
     * @returns {LifecycleStages} - The current lifecycle stage.
     */
    getCurrentLifecycleStage(): LifecycleStages;
    // #region
    copy(): Promise<boolean>;
    paste(): Promise<boolean>;
    // #endregion

    /**
     * Set WebSocket URL for WebSocketService
     *
     * @param {string} url WebSocket URL
     * @returns {ISocket} WebSocket instance
     */
    createSocket(url: string): ISocket;

    /**
     * Get hooks
     *
     * @returns {FHooks} FHooks instance
     */
    getHooks(): FHooks;

    // #region API applies to all workbooks

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

    override copy(): Promise<boolean> {
        return this._commandService.executeCommand(CopyCommand.id);
    }

    override paste(): Promise<boolean> {
        return this._commandService.executeCommand(PasteCommand.id);
    }

    override createUniverDoc(data: Partial<IDocumentData>): FDocument {
        const document = this._univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        return this._injector.createInstance(FDocument, document);
    }

    override getActiveDocument(): FDocument | null {
        const document = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    override getUniverDoc(id: string): FDocument | null {
        const document = this._univerInstanceService.getUniverDocInstance(id);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

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

    /**
     * registerFunction may be executed multiple times, triggering multiple formula forced refreshes
     */
    private _debouncedFormulaCalculation: () => void;
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

    override getFormula(): FFormula {
        return this._injector.createInstance(FFormula);
    }

    override createSocket(url: string): ISocket {
        const wsService = this._injector.get(ISocketService);
        const ws = wsService.createSocket(url);

        if (!ws) {
            throw new Error('[WebSocketService]: failed to create socket!');
        }

        return ws;
    }

    override getHooks(): FHooks {
        return this._injector.createInstance(FHooks);
    }

    override getPermission(): FPermission {
        return this._injector.createInstance(FPermission);
    }
}

FUniver.extend(FUniverLegacy);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverLegacy {}
}
