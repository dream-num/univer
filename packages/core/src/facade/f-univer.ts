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

import type { CommandListener, DocumentDataModel, IDisposable, IDocumentData, IExecutionOptions, IParagraphStyle, ITextDecoration, ITextStyle, LifecycleStages } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import type { ICommandEvent, IEventParamConfig } from './f-event';
import { CanceledError, ColorBuilder, Disposable, ICommandService, Inject, Injector, IUniverInstanceService, LifecycleService, ParagraphStyleBuilder, ParagraphStyleValue, RedoCommand, RichTextBuilder, RichTextValue, TextDecorationBuilder, TextStyleBuilder, TextStyleValue, ThemeService, toDisposable, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { FBlob } from './f-blob';
import { FDoc } from './f-doc';
import { FEnum } from './f-enum';
import { FEventName } from './f-event';
import { FEventRegistry } from './f-event-registry';
import { FHooks } from './f-hooks';
import { FUserManager } from './f-usermanager';
import { FUtil } from './f-util';

/**
 * @ignore
 */
const InitializerSymbol = Symbol('initializers');

/**
 * @ignore
 */
type Initializers = Array<(injector: Injector) => void>;

/**
 * The root Facade API object to interact with Univer. Please use `newAPI` static method
 * to create a new instance.
 *
 * @hideconstructor
 */
export class FUniver extends Disposable {
    /**
     * Create an FUniver instance, if the injector is not provided, it will create a new Univer instance.
     * @static
     * @param {Univer | Injector} wrapped - The Univer instance or injector instance.
     * @returns {FUniver} - The FUniver instance.
     *
     * @example
     * ```ts
     * const univerAPI = FUniver.newAPI(univer);
     * ```
     */
    static newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        return injector.createInstance(FUniver);
    }

    declare private [InitializerSymbol]: Initializers | undefined;

    /**
     * @ignore
     */
    _initialize(injector: Injector): void { }

    /**
     * @ignore
     */
    static extend(source: any): void {
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name === '_initialize') {
                let initializers = this.prototype[InitializerSymbol];
                if (!initializers) {
                    initializers = [];
                    this.prototype[InitializerSymbol] = initializers;
                }

                initializers.push(source.prototype._initialize);
            } else if (name !== 'constructor') {
                // @ts-ignore
                this.prototype[name] = source.prototype[name];
            }
        });

        Object.getOwnPropertyNames(source).forEach((name) => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                // @ts-ignore
                this[name] = source[name];
            }
        });
    }

    protected _eventRegistry = new FEventRegistry();

    protected registerEventHandler = (event: string, handler: () => IDisposable | Subscription): IDisposable => {
        return this._eventRegistry.registerEventHandler(event, handler);
    };

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService
    ) {
        super();

        this.registerEventHandler(
            this.Event.LifeCycleChanged,
            () =>
                toDisposable(
                    this._lifecycleService.lifecycle$.subscribe((stage) => {
                        this.fireEvent(this.Event.LifeCycleChanged, { stage });
                    })
                )
        );

        this._initUnitEvent(this._injector);
        this._initBeforeCommandEvent(this._injector);
        this._initCommandEvent(this._injector);
        this._injector.onDispose(() => {
            this.dispose();
        });

        const initializers = Object.getPrototypeOf(this)[InitializerSymbol];
        if (initializers) {
            const self = this;
            initializers.forEach(function (fn: (_injector: Injector) => void) {
                fn.apply(self, [_injector]);
            });
        }
    }

    private _initCommandEvent(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        this.registerEventHandler(
            this.Event.Redo,
            () => commandService.onCommandExecuted((commandInfo) => {
                const { id, type: propType, params } = commandInfo;
                if (commandInfo.id === RedoCommand.id) {
                    const type = propType!;
                    const eventParams: ICommandEvent = { id, type, params };
                    this.fireEvent(this.Event.Redo, eventParams);
                }
            })
        );

        this.registerEventHandler(
            this.Event.Undo,
            () => commandService.onCommandExecuted((commandInfo) => {
                const { id, type: propType, params } = commandInfo;
                if (commandInfo.id === UndoCommand.id) {
                    const type = propType!;
                    const eventParams: ICommandEvent = { id, type, params };
                    this.fireEvent(this.Event.Undo, eventParams);
                }
            })
        );

        this.registerEventHandler(
            this.Event.CommandExecuted,
            () => commandService.onCommandExecuted((commandInfo, options) => {
                const { id, type: propType, params } = commandInfo;
                if (commandInfo.id !== RedoCommand.id && commandInfo.id !== UndoCommand.id) {
                    const type = propType!;
                    const eventParams: ICommandEvent = { id, type, params, options };
                    this.fireEvent(this.Event.CommandExecuted, eventParams);
                }
            })
        );
    }

    private _initBeforeCommandEvent(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.BeforeRedo,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                const { id, type: propType, params } = commandInfo;
                if (commandInfo.id === RedoCommand.id) {
                    const type = propType!;
                    const eventParams: ICommandEvent = { id, type, params };
                    this.fireEvent(this.Event.BeforeRedo, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeUndo,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                const { id, type: propType, params } = commandInfo;
                if (commandInfo.id === UndoCommand.id) {
                    const type = propType!;
                    const eventParams: ICommandEvent = { id, type, params };
                    this.fireEvent(this.Event.BeforeUndo, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeCommandExecute,
            () => commandService.beforeCommandExecuted((commandInfo, options) => {
                const { id, type: propType, params } = commandInfo;
                if (commandInfo.id !== RedoCommand.id && commandInfo.id !== UndoCommand.id) {
                    const type = propType!;
                    const eventParams: ICommandEvent = { id, type, params, options };
                    this.fireEvent(this.Event.BeforeCommandExecute, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );
    }

    private _initUnitEvent(injector: Injector): void {
        const univerInstanceService = injector.get(IUniverInstanceService);

        this.registerEventHandler(
            this.Event.DocDisposed,
            () => univerInstanceService.unitDisposed$.subscribe((unit) => {
                if (unit.type === UniverInstanceType.UNIVER_DOC) {
                    this.fireEvent(this.Event.DocDisposed, {
                        unitId: unit.getUnitId(),
                        unitType: unit.type,
                        snapshot: unit.getSnapshot() as IDocumentData,
                    });
                }
            })
        );

        this.registerEventHandler(
            this.Event.DocCreated,
            () => univerInstanceService.unitAdded$.subscribe((unit) => {
                if (unit.type === UniverInstanceType.UNIVER_DOC) {
                    const doc = unit as DocumentDataModel;
                    const docUnit = injector.createInstance(FDoc, doc);
                    this.fireEvent(this.Event.DocCreated, {
                        unitId: unit.getUnitId(),
                        type: unit.type,
                        doc: docUnit,
                        unit: docUnit,
                    });
                }
            })
        );
    }

    /**
     * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
     * @param unitId The unit id of the UniverSheet.
     * @returns Whether the Univer instance is disposed successfully.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const unitId = fWorkbook?.getId();
     *
     * if (unitId) {
     *   univerAPI.disposeUnit(unitId);
     * }
     * ```
     */
    disposeUnit(unitId: string): boolean {
        return this._univerInstanceService.disposeUnit(unitId);
    }

    /**
     * Get the current lifecycle stage.
     * @returns {LifecycleStages} - The current lifecycle stage.
     *
     * @example
     * ```ts
     * const stage = univerAPI.getCurrentLifecycleStage();
     * console.log(stage);
     * ```
     */
    getCurrentLifecycleStage(): LifecycleStages {
        const lifecycleService = this._injector.get(LifecycleService);
        return lifecycleService.stage;
    }

    /**
     * Undo an editing on the currently focused document.
     * @returns {Promise<boolean>} undo result
     *
     * @example
     * ```ts
     * await univerAPI.undo();
     * ```
     */
    undo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    /**
     * Redo an editing on the currently focused document.
     * @returns {Promise<boolean>} redo result
     *
     * @example
     * ```ts
     * await univerAPI.redo();
     * ```
     */
    redo(): Promise<boolean> {
        return this._commandService.executeCommand(RedoCommand.id);
    }

    /**
     * Toggle dark mode on or off.
     * @param {boolean} isDarkMode - Whether the dark mode is enabled.
     * @internal
     * @example
     * ```ts
     * univerAPI.toggleDarkMode(true);
     * ```
     */
    toggleDarkMode(isDarkMode: boolean): void {
        const themeService = this._injector.get(ThemeService);
        themeService.setDarkMode(isDarkMode);
    }

    /**
     * Register a callback that will be triggered before invoking a command.
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event) => {})` instead.
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
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {})` instead.
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    /**
     * Execute a command with the given id and parameters.
     * @param id Identifier of the command.
     * @param params Parameters of this execution.
     * @param options Options of this execution.
     * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
     *
     * @example
     * ```ts
     * univerAPI.executeCommand('sheet.command.set-range-values', {
     *   value: { v: "Hello, Univer!" },
     *   range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 }
     * });
     * ```
     */
    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> {
        return this._commandService.executeCommand(id, params, options);
    }

    /**
     * Execute a command with the given id and parameters synchronously.
     * @param id Identifier of the command.
     * @param params Parameters of this execution.
     * @param options Options of this execution.
     * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
     *
     * @example
     * ```ts
     * univerAPI.syncExecuteCommand('sheet.command.set-range-values', {
     *   value: { v: "Hello, Univer!" },
     *   range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 }
     * });
     * ```
     */
    syncExecuteCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): R {
        return this._commandService.syncExecuteCommand(id, params, options);
    }

    /**
     * Get hooks.
     * @deprecated use `addEvent` instead.
     * @returns {FHooks} FHooks instance
     */
    getHooks(): FHooks {
        return this._injector.createInstance(FHooks);
    }

    get Enum(): FEnum {
        return FEnum.get();
    }

    get Event(): FEventName {
        return FEventName.get();
    }

    get Util(): FUtil {
        return FUtil.get();
    }

    /**
     * Add an event listener
     * @param {string} event key of event
     * @param {(params: IEventParamConfig[typeof event]) => void} callback callback when event triggered
     * @returns {Disposable} The Disposable instance, for remove the listener
     * @example
     * ```ts
     * // Add life cycle changed event listener
     * const disposable = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
     *   const { stage } = params;
     *   console.log('life cycle changed', params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    addEvent<T extends keyof IEventParamConfig>(event: T, callback: (params: IEventParamConfig[T]) => void): IDisposable {
        if (!event || !callback) throw new Error('Cannot add empty event');
        return this._eventRegistry.addEvent(event, callback);
    }

    /**
     * Fire an event, used in internal only.
     * @param {string} event key of event
     * @param {any} params params of event
     * @returns {boolean} should cancel
     * @example
     * ```ts
     * this.fireEvent(univerAPI.Event.LifeCycleChanged, params);
     * ```
     */
    protected fireEvent<T extends keyof IEventParamConfig>(event: T, params: IEventParamConfig[T]): boolean | undefined {
        return this._eventRegistry.fireEvent(event, params);
    }

    getUserManager(): FUserManager {
        return this._injector.createInstance(FUserManager);
    }

    /**
     * Create a new blob.
     * @returns {FBlob} The new blob instance
     * @example
     * ```ts
     * const blob = univerAPI.newBlob();
     * ```
     */
    newBlob(): FBlob {
        return this._injector.createInstance(FBlob);
    }

    /**
     * Create a new color.
     * @returns {ColorBuilder} The new color instance
     * @example
     * ```ts
     * const color = univerAPI.newColor();
     * ```
     * @deprecated
     */
    newColor(): ColorBuilder {
        return new ColorBuilder();
    }

    /**
     * Create a new rich text.
     * @param {IDocumentData} data
     * @returns {RichTextBuilder} The new rich text instance
     * @example
     * ```ts
     * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } });
     * const range = univerAPI.getActiveWorkbook().getActiveSheet().getRange('A1');
     * range.setRichTextValueForCell(richText);
     * ```
     */
    newRichText(data?: IDocumentData): RichTextBuilder {
        return RichTextBuilder.create(data);
    }

    /**
     * Create a new rich text value.
     * @param {IDocumentData} data - The rich text data
     * @returns {RichTextValue} The new rich text value instance
     * @example
     * ```ts
     * const richTextValue = univerAPI.newRichTextValue({ body: { dataStream: 'Hello World\r\n' } });
     * const range = univerAPI.getActiveWorkbook().getActiveSheet().getRange('A1');
     * range.setRichTextValueForCell(richTextValue);
     * ```
     */
    newRichTextValue(data: IDocumentData): RichTextValue {
        return RichTextValue.create(data);
    }

    /**
     * Create a new paragraph style.
     * @param {IParagraphStyle} style - The paragraph style
     * @returns {ParagraphStyleBuilder} The new paragraph style instance
     * @example
     * ```ts
     * const richText = univerAPI.newRichText({ body: { dataStream: 'Hello World\r\n' } });
     * const paragraphStyle = univerAPI.newParagraphStyle({ textStyle: { ff: 'Arial', fs: 12, it: univerAPI.Enum.BooleanNumber.TRUE, bl: univerAPI.Enum.BooleanNumber.TRUE } });
     * richText.insertParagraph(paragraphStyle);
     * const range = univerAPI.getActiveWorkbook().getActiveSheet().getRange('A1');
     * range.setRichTextValueForCell(richText);
     * ```
     */
    newParagraphStyle(style?: IParagraphStyle): ParagraphStyleBuilder {
        return ParagraphStyleBuilder.create(style);
    }

    /**
     * Create a new paragraph style value.
     * @param {IParagraphStyle} style - The paragraph style
     * @returns {ParagraphStyleValue} The new paragraph style value instance
     * @example
     * ```ts
     * const paragraphStyleValue = univerAPI.newParagraphStyleValue();
     * ```
     */
    newParagraphStyleValue(style?: IParagraphStyle): ParagraphStyleValue {
        return ParagraphStyleValue.create(style);
    }

    /**
     * Create a new text style.
     * @param {ITextStyle} style - The text style
     * @returns {TextStyleBuilder} The new text style instance
     * @example
     * ```ts
     * const textStyle = univerAPI.newTextStyle();
     * ```
     */
    newTextStyle(style?: ITextStyle): TextStyleBuilder {
        return TextStyleBuilder.create(style);
    }

    /**
     * Create a new text style value.
     * @param {ITextStyle} style - The text style
     * @returns {TextStyleValue} The new text style value instance
     * @example
     * ```ts
     * const textStyleValue = univerAPI.newTextStyleValue();
     * ```
     */
    newTextStyleValue(style?: ITextStyle): TextStyleValue {
        return TextStyleValue.create(style);
    }

    /**
     * Create a new text decoration.
     * @param {ITextDecoration} decoration - The text decoration
     * @returns {TextDecorationBuilder} The new text decoration instance
     * @example
     * ```ts
     * const decoration = univerAPI.newTextDecoration();
     * ```
     */
    newTextDecoration(decoration?: ITextDecoration): TextDecorationBuilder {
        return new TextDecorationBuilder(decoration);
    }
}
