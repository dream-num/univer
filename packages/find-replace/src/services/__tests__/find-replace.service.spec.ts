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

import type { IFindMatch, IFindMoveParams, IFindQuery, IReplaceAllResult } from '../find-replace.service';
import { awaitTime, ICommandService, IContextService, Inject, Injector, IUniverInstanceService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { FindBy, FindDirection, FindModel, FindReplaceService, FindScope } from '../find-replace.service';

class TestUniverInstanceService {
    readonly focused$ = new Subject<unknown>();
    focusedUnitId: string | null = 'u1';

    getFocusedUnit() {
        return this.focusedUnitId ? { getUnitId: () => this.focusedUnitId } : null;
    }
}

class TestCommandService {
    onCommandExecuted() {
        return { dispose() {} };
    }
}

class TestContextService {
    readonly values: Array<{ key: unknown; value: unknown }> = [];

    setContextValue(key: unknown, value: unknown): void {
        this.values.push({ key, value });
    }
}

interface ITestModelConfig {
    unitId: string;
    matches: IFindMatch[];
    replaceAllResult?: IReplaceAllResult;
}

class TestFindModel extends FindModel {
    readonly matchesUpdate$ = new Subject<IFindMatch[]>();
    readonly activelyChangingMatch$ = new Subject<IFindMatch>();
    readonly nextParams: Array<IFindMoveParams | undefined> = [];
    readonly previousParams: Array<IFindMoveParams | undefined> = [];
    readonly replaceCalls: string[] = [];
    readonly replaceAllCalls: string[] = [];
    nextQueue: Array<IFindMatch | null> = [];
    previousQueue: Array<IFindMatch | null> = [];
    focusCount = 0;

    constructor(
        readonly unitId: string,
        private _matches: IFindMatch[],
        private readonly _replaceAllResult: IReplaceAllResult = { success: _matches.length, failure: 0 }
    ) {
        super();
    }

    getMatches(): IFindMatch[] {
        return this._matches;
    }

    setMatches(matches: IFindMatch[]): void {
        this._matches = matches;
        this.matchesUpdate$.next(matches);
    }

    moveToNextMatch(params?: IFindMoveParams): IFindMatch | null {
        this.nextParams.push(params);
        return this.nextQueue.length ? this.nextQueue.shift()! : this._matches[0] ?? null;
    }

    moveToPreviousMatch(params?: IFindMoveParams): IFindMatch | null {
        this.previousParams.push(params);
        return this.previousQueue.length ? this.previousQueue.shift()! : this._matches.at(-1) ?? null;
    }

    replace(replaceString: string): Promise<boolean> {
        this.replaceCalls.push(replaceString);
        return Promise.resolve(this._matches.length > 0);
    }

    replaceAll(replaceString: string): Promise<IReplaceAllResult> {
        this.replaceAllCalls.push(replaceString);
        return Promise.resolve(this._replaceAllResult);
    }

    focusSelection(): void {
        this.focusCount++;
    }
}

class TestFindReplaceProvider {
    readonly queries: IFindQuery[] = [];
    readonly models: TestFindModel[] = [];
    modelConfigs: ITestModelConfig[] = [];
    terminateCount = 0;

    constructor(@Inject(Injector) private readonly _injector: Injector) {}

    async find(query: IFindQuery): Promise<FindModel[]> {
        this.queries.push(query);
        this.models.splice(0, this.models.length, ...this.modelConfigs.map((config) =>
            this._injector.createInstance(TestFindModel, config.unitId, config.matches, config.replaceAllResult)
        ));
        return this.models;
    }

    terminate(): void {
        this.terminateCount++;
    }
}

function createService(registerProvider = true) {
    const injector = new Injector();
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IContextService, { useClass: TestContextService as never }]);
    injector.add([TestFindReplaceProvider]);
    injector.add([FindReplaceService]);
    const service = injector.get(FindReplaceService);
    const provider = injector.get(TestFindReplaceProvider);
    if (registerProvider) {
        service.registerFindReplaceProvider(provider);
    }
    return {
        injector,
        service,
        provider,
        contextService: injector.get(IContextService) as unknown as TestContextService,
        univerInstanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
    };
}

describe('FindReplaceService', () => {
    it('should start session and move to next match', async () => {
        const { service, provider } = createService();
        const match1: IFindMatch = { provider: 'p', unitId: 'u1', range: { i: 1 }, replaceable: true } as any;
        const match2: IFindMatch = { provider: 'p', unitId: 'u1', range: { i: 2 }, replaceable: false } as any;
        provider.modelConfigs = [{ unitId: 'u1', matches: [match1, match2], replaceAllResult: { success: 2, failure: 0 } }];

        expect(service.start(false)).toBe(true);

        service.changeFindString('hello');
        service.changeFindDirection(FindDirection.COLUMN);
        service.changeFindScope(FindScope.UNIT);
        service.changeFindBy(FindBy.FORMULA);

        service.find();
        await awaitTime(0);

        service.moveToNextMatch();
        expect(service.getCurrentMatch()).toEqual(match1);

        const replaceables = await new Promise<IFindMatch[]>((resolve) => {
            service.replaceables$.subscribe((r) => {
                if (r.length) resolve(r);
            });
        });
        expect(replaceables).toEqual([match1]);

        service.terminate();
        service.dispose();
    });

    it('should search with the typed replace query on the first navigation in replace mode', async () => {
        const { service, provider, contextService } = createService();
        const match: IFindMatch = { provider: 'p', unitId: 'u1', range: { row: 1 }, replaceable: true } as any;
        provider.modelConfigs = [{ unitId: 'u1', matches: [match] }];
        const focusSignals: number[] = [];
        service.focusSignal$.subscribe(() => focusSignals.push(focusSignals.length + 1));

        expect(service.start(true)).toBe(true);
        service.changeInputtingFindString('invoice');
        service.moveToNextMatch();
        await awaitTime(0);

        expect(provider.queries.at(-1)).toMatchObject({
            findString: 'invoice',
            replaceRevealed: true,
        });
        expect(service.getCurrentMatch()).toEqual(match);
        expect(focusSignals).toEqual([1]);
        expect(contextService.values.map(({ value }) => value)).toContain(true);

        service.terminate();
        service.dispose();
    });

    it('should navigate across find models when the current unit has no next or previous match', async () => {
        const { service, provider } = createService();
        const match1: IFindMatch = { provider: 'p', unitId: 'u1', range: { row: 1 }, replaceable: true } as any;
        const match2: IFindMatch = { provider: 'p', unitId: 'u2', range: { row: 2 }, replaceable: true } as any;
        provider.modelConfigs = [
            { unitId: 'u1', matches: [match1] },
            { unitId: 'u2', matches: [match2] },
        ];

        expect(service.start()).toBe(true);
        service.changeFindString('total');
        service.find();
        await awaitTime(0);

        const [firstModel, secondModel] = provider.models;
        firstModel.nextQueue = [null];
        secondModel.nextQueue = [match2];
        service.moveToNextMatch();
        expect(service.getCurrentMatch()).toEqual(match2);
        expect(secondModel.nextParams).toContainEqual({ ignoreSelection: true });

        secondModel.previousQueue = [null];
        firstModel.previousQueue = [match1];
        service.moveToPreviousMatch();
        expect(service.getCurrentMatch()).toEqual(match1);
        expect(firstModel.previousParams).toContainEqual({ ignoreSelection: true });

        service.terminate();
        service.dispose();
    });

    it('should aggregate replace-all failures without clearing the current search session', async () => {
        const { service, provider } = createService();
        const match1: IFindMatch = { provider: 'p', unitId: 'u1', range: { row: 1 }, replaceable: true } as any;
        const match2: IFindMatch = { provider: 'p', unitId: 'u1', range: { row: 2 }, replaceable: true } as any;
        provider.modelConfigs = [
            { unitId: 'u1', matches: [match1], replaceAllResult: { success: 2, failure: 0 } },
            { unitId: 'u2', matches: [match2], replaceAllResult: { success: 0, failure: 1 } },
        ];

        expect(service.start()).toBe(true);
        service.changeFindString('draft');
        service.changeReplaceString('final');
        service.find();
        await awaitTime(0);

        const terminateCountBeforeReplaceAll = provider.terminateCount;
        await expect(service.replaceAll()).resolves.toEqual({ success: 2, failure: 1 });
        expect(provider.models.map((model) => model.replaceAllCalls)).toEqual([['final'], ['final']]);
        expect(service.getCurrentMatch()).toEqual(match1);
        expect(provider.terminateCount).toBe(terminateCountBeforeReplaceAll);

        service.terminate();
        service.dispose();
    });

    it('should report no matches and clear replaceable results when providers find nothing', async () => {
        const { service, provider } = createService();
        provider.modelConfigs = [{ unitId: 'u1', matches: [] }];
        const replaceableSnapshots: IFindMatch[][] = [];
        service.replaceables$.subscribe((replaceables) => replaceableSnapshots.push(replaceables));

        expect(service.start()).toBe(true);
        service.changeFindString('missing');
        service.find();
        await awaitTime(0);

        expect(service.getCurrentMatch()).toBeNull();
        expect(replaceableSnapshots.at(-1)).toEqual([]);

        service.terminate();
        service.dispose();
    });

    it('should fail commands that require an active session when no provider has started one', async () => {
        const { service } = createService(false);

        expect(service.start()).toBe(false);
        expect(await service.replace()).toBe(false);
        await expect(service.replaceAll()).rejects.toThrow('model is not initialized');

        service.dispose();
    });
});
