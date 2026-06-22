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

import type { ICommand, IWorkbookData, Workbook, Worksheet } from '@univerjs/core';
import type { FFormula } from '@univerjs/engine-formula/facade';
import type { IMessageProtocol } from '@univerjs/rpc';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    CalculateController,
    ErrorType,
    FormulaDataModel,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    UniverFormulaEnginePlugin,
} from '@univerjs/engine-formula';
import {
    ChannelService,
    DataSyncPrimaryController,
    DataSyncReplicaController,
    IRemoteInstanceService,
    IRemoteSyncService,
    IRPCChannelService,
    RemoteSyncPrimaryService,
    WebWorkerRemoteInstanceService,
} from '@univerjs/rpc';
import { SetRangeValuesMutation, UniverSheetsPlugin } from '@univerjs/sheets';
import { ReplaySubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import formulaEnUS from '../../locale/en-US';
import { UniverRemoteSheetsFormulaPlugin, UniverSheetsFormulaPlugin } from '../../plugin';
import '@univerjs/engine-formula/facade';

const unitId = 'test';
const subUnitId = 'sheet1';

function createPairedMessageProtocols(): [IMessageProtocol, IMessageProtocol] {
    const mainToWorker$ = new ReplaySubject<unknown>(1);
    const workerToMain$ = new ReplaySubject<unknown>(1);

    return [
        {
            send(message: unknown) {
                mainToWorker$.next(message);
            },
            onMessage: workerToMain$.asObservable(),
        },
        {
            send(message: unknown) {
                workerToMain$.next(message);
            },
            onMessage: mainToWorker$.asObservable(),
        },
    ];
}

function waitForMicrotasks(count = 4): Promise<void> {
    let promise = Promise.resolve();
    for (let i = 0; i < count; i++) {
        promise = promise.then(() => undefined);
    }

    return promise;
}

function registerCommand(commandService: ICommandService, command: ICommand) {
    try {
        commandService.registerCommand(command);
    } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('has been registered before')) {
            throw error;
        }
    }
}

async function waitForCondition(condition: () => boolean): Promise<void> {
    for (let i = 0; i < 20; i++) {
        if (condition()) {
            return;
        }

        await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }

    throw new Error('Timed out waiting for condition.');
}

function createWorkbookData(): IWorkbookData {
    const sourceCellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {};

    for (let row = 2; row <= 9; row++) {
        sourceCellData[row] = {};
        for (let column = 2; column <= 6; column++) {
            sourceCellData[row]![column] = {
                v: row + column,
                t: 2,
            };
        }
    }

    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: [subUnitId],
        styles: {},
        sheets: {
            [subUnitId]: {
                id: subUnitId,
                name: 'Sheet1',
                rowCount: 30,
                columnCount: 20,
                cellData: {
                    ...sourceCellData,
                    12: {
                        6: {
                            f: '=C3:G10',
                        },
                    },
                },
            },
        },
    };
}

function createWorkerFormulaTestBed() {
    const [mainProtocol, workerProtocol] = createPairedMessageProtocols();

    class MainRPCPlugin extends Plugin {
        static override pluginName = 'test-main-rpc-plugin';

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            this._injector.add([IRPCChannelService, {
                // eslint-disable-next-line react/no-unnecessary-use-prefix
                useFactory: () => new ChannelService(mainProtocol),
            }]);
            this._injector.add([DataSyncPrimaryController]);
            this._injector.add([IRemoteSyncService, { useClass: RemoteSyncPrimaryService }]);
            this._injector.get(DataSyncPrimaryController);
        }
    }

    class WorkerRPCPlugin extends Plugin {
        static override pluginName = 'test-worker-rpc-plugin';

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            this._injector.add([IRPCChannelService, {
                // eslint-disable-next-line react/no-unnecessary-use-prefix
                useFactory: () => new ChannelService(workerProtocol),
            }]);
            this._injector.add([IRemoteInstanceService, { useClass: WebWorkerRemoteInstanceService }]);
            this._injector.add([DataSyncReplicaController]);
            this._injector.get(DataSyncReplicaController);
        }
    }

    const workerUniver = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: formulaEnUS,
        },
        logLevel: LogLevel.SILENT,
    });
    workerUniver.registerPlugins([
        [UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true }],
        [UniverFormulaEnginePlugin],
        [WorkerRPCPlugin],
        [UniverRemoteSheetsFormulaPlugin],
    ]);

    const mainUniver = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: formulaEnUS,
        },
        logLevel: LogLevel.SILENT,
    });
    mainUniver.registerPlugins([
        [MainRPCPlugin],
        [UniverSheetsPlugin, { notExecuteFormula: true }],
        [UniverFormulaEnginePlugin, { notExecuteFormula: true }],
        [UniverSheetsFormulaPlugin, { notExecuteFormula: true }],
    ]);

    const mainInjector = mainUniver.__getInjector();
    const workerInjector = workerUniver.__getInjector();
    const mainCommandService = mainInjector.get(ICommandService);
    const workerCommandService = workerInjector.get(ICommandService);

    mainInjector.get(ILogService).setLogLevel(LogLevel.SILENT);
    workerInjector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const sheet = mainUniver.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

    return {
        commandService: mainCommandService,
        formulaDataModel: mainInjector.get(FormulaDataModel),
        mainUniver,
        sheet,
        workerCommandService,
        workerFormulaEngine: FUniver.newAPI(workerUniver).getFormula() as FFormula,
        workerInjector,
        workerInstanceService: workerInjector.get(IUniverInstanceService),
        workerUniver,
    };
}

describe('Array formula SPILL with worker formula calculation', () => {
    let testBed: ReturnType<typeof createWorkerFormulaTestBed>;
    let commandService: ICommandService;
    let formulaDataModel: FormulaDataModel;
    let worksheet: Worksheet;

    beforeEach(() => {
        testBed = createWorkerFormulaTestBed();
        commandService = testBed.commandService;
        formulaDataModel = testBed.formulaDataModel;
        worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
    });

    afterEach(() => {
        testBed.mainUniver.dispose();
        testBed.workerUniver.dispose();
    });

    async function calculateInWorker() {
        await waitForCondition(() => testBed.workerInstanceService.getUnit(unitId) != null);
        [
            SetArrayFormulaDataMutation,
            SetFormulaCalculationNotificationMutation,
            SetFormulaCalculationResultMutation,
            SetFormulaCalculationStartMutation,
            SetRangeValuesMutation,
        ].forEach((command) => {
            registerCommand(commandService, command);
            registerCommand(testBed.workerCommandService, command);
        });
        testBed.workerInjector.get(CalculateController);

        const calculationEnd = testBed.workerFormulaEngine.onCalculationEnd();

        // Also wait for the calculation result to be synced back to the main thread.
        const resultSyncedToMain = new Promise<void>((resolve) => {
            const disposable = commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetFormulaCalculationResultMutation.id) {
                    disposable.dispose();
                    resolve();
                }
            });
        });

        testBed.workerCommandService.syncExecuteCommand(SetFormulaCalculationStartMutation.id, { forceCalculation: true }, { onlyLocal: true });
        await calculationEnd;
        await resultSyncedToMain;
        await waitForMicrotasks(2);
    }

    async function setCell(row: number, column: number, value: number) {
        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId,
            subUnitId,
            cellValue: {
                [row]: {
                    [column]: {
                        v: value,
                        t: 2,
                    },
                },
            },
        });
    }

    it('should preserve multiple real blockers inside a spilled array reference formula', async () => {
        await calculateInWorker();

        expect(formulaDataModel.getArrayFormulaRange()[unitId]?.[subUnitId]?.[12]?.[6]).toEqual({
            startRow: 12,
            startColumn: 6,
            endRow: 19,
            endColumn: 10,
        });

        await setCell(14, 9, 333);
        await calculateInWorker();

        expect(worksheet.getCellRaw(12, 6)?.v).toBe(ErrorType.SPILL);
        expect(worksheet.getCellRaw(14, 9)?.v).toBe(333);
        expect(formulaDataModel.getArrayFormulaCellData()[unitId]?.[subUnitId]?.[14]?.[9]).toBeUndefined();

        await setCell(15, 9, 444);
        await calculateInWorker();

        expect(worksheet.getCellRaw(12, 6)?.v).toBe(ErrorType.SPILL);
        expect(worksheet.getCellRaw(14, 9)?.v).toBe(333);
        expect(worksheet.getCellRaw(15, 9)?.v).toBe(444);
        expect(formulaDataModel.getArrayFormulaCellData()[unitId]?.[subUnitId]?.[14]?.[9]).toBeUndefined();
        expect(formulaDataModel.getArrayFormulaCellData()[unitId]?.[subUnitId]?.[15]?.[9]).toBeUndefined();
    });
});
