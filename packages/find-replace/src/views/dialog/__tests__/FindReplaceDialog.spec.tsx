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

import type { IDisposable, Injector, Nullable } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import type { TestMessageService } from '../../../__tests__/create-test-bed';
import type {
    IFindMatch,
    IFindMoveParams,
    IFindQuery,
    IFindReplaceState,
    IReplaceAllResult,
} from '../../../services/find-replace.service';
import { awaitTime, ICommandService, toDisposable } from '@univerjs/core';
import { ILayoutService, IMessageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestBed } from '../../../__tests__/create-test-bed';
import {
    ReplaceAllMatchesCommand,
    ReplaceCurrentMatchCommand,
} from '../../../commands/commands/replace.command';
import {
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
} from '../../../commands/operations/find-replace.operation';
import {
    FindBy,
    FindDirection,
    FindModel,
    FindReplaceService,
    FindScope,
    IFindReplaceService,
} from '../../../services/find-replace.service';
import { FindReplaceDialog } from '../FindReplaceDialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface ICellText {
    id: string;
    text: string;
}

interface ICellRange {
    id: string;
}

const INITIAL_ROWS: ICellText[] = [
    { id: 'A1', text: 'apple' },
    { id: 'A2', text: 'pineapple' },
    { id: 'A3', text: 'Apple' },
    { id: 'A4', text: 'banana' },
];

const FIND_LABEL = 'find-replace.dialog.find';
const REPLACE_LABEL = 'find-replace.dialog.replace';
const REPLACE_ALL_LABEL = 'find-replace.dialog.replace-all';
const ADVANCED_LABEL = 'find-replace.dialog.advanced-finding';

class TextFindModel extends FindModel {
    private readonly _matchesUpdate$ = new BehaviorSubject<IFindMatch<ICellRange>[]>([]);
    private readonly _activelyChangingMatch$ = new Subject<IFindMatch<ICellRange>>();
    private _matches: IFindMatch<ICellRange>[] = [];
    private _position = -1;

    override readonly unitId = 'test';
    override readonly matchesUpdate$ = this._matchesUpdate$.asObservable();
    override readonly activelyChangingMatch$ = this._activelyChangingMatch$.asObservable();

    constructor(
        private readonly _rows: ICellText[],
        private readonly _query: IFindQuery
    ) {
        super();
        this._refreshMatches();
    }

    override dispose(): void {
        this._matchesUpdate$.complete();
        this._activelyChangingMatch$.complete();
        super.dispose();
    }

    override getMatches(): IFindMatch<ICellRange>[] {
        return this._matches;
    }

    override moveToNextMatch(params?: IFindMoveParams): IFindMatch<ICellRange> | null {
        if (this._matches.length === 0) {
            return null;
        }

        if (params?.stayIfOnMatch && this._position >= 0) {
            return this._emitCurrent();
        }

        if (params?.ignoreSelection) {
            this._position = 0;
        } else {
            this._position = this._position + 1;
            if (this._position >= this._matches.length) {
                this._position = params?.loop ? 0 : this._matches.length - 1;
            }
        }

        return this._emitCurrent();
    }

    override moveToPreviousMatch(params?: IFindMoveParams): IFindMatch<ICellRange> | null {
        if (this._matches.length === 0) {
            return null;
        }

        if (params?.ignoreSelection) {
            this._position = this._matches.length - 1;
        } else {
            this._position = this._position - 1;
            if (this._position < 0) {
                this._position = params?.loop ? this._matches.length - 1 : 0;
            }
        }

        return this._emitCurrent();
    }

    override async replace(replaceString: string): Promise<boolean> {
        const match = this._matches[this._position];
        if (!match) {
            return false;
        }

        const row = this._rows.find((item) => item.id === match.range.id);
        if (!row) {
            return false;
        }

        row.text = replaceString;
        this._refreshMatches();
        return true;
    }

    override async replaceAll(replaceString: string): Promise<IReplaceAllResult> {
        const ids = new Set(this._matches.map((match) => match.range.id));
        this._rows.forEach((row) => {
            if (ids.has(row.id)) {
                row.text = replaceString;
            }
        });
        const success = ids.size;
        this._refreshMatches();
        return { success, failure: 0 };
    }

    override focusSelection(): void {
        const match = this._matches[this._position];
        if (match) {
            this._activelyChangingMatch$.next(match);
        }
    }

    private _emitCurrent(): IFindMatch<ICellRange> {
        const match = this._matches[this._position];
        this._activelyChangingMatch$.next(match);
        return match;
    }

    private _refreshMatches(): void {
        this._matches = this._rows
            .filter((row) => this._doesRowMatch(row))
            .map((row) => ({
                provider: 'text-provider',
                unitId: this.unitId,
                range: { id: row.id },
                replaceable: true,
            }));
        this._position = this._matches.length > 0 ? Math.min(Math.max(this._position, 0), this._matches.length - 1) : -1;
        this._matchesUpdate$.next(this._matches);
    }

    private _doesRowMatch(row: ICellText): boolean {
        const source = this._query.caseSensitive ? row.text : row.text.toLocaleLowerCase();
        const target = this._query.caseSensitive ? this._query.findString : this._query.findString.toLocaleLowerCase();
        return this._query.matchesTheWholeCell ? source === target : source.includes(target);
    }
}

class TestFindReplaceProvider {
    readonly rows = INITIAL_ROWS.map((row) => ({ ...row }));
    readonly queries: IFindQuery[] = [];

    async find(query: IFindQuery): Promise<FindModel[]> {
        this.queries.push({ ...query });
        return [new TextFindModel(this.rows, query)];
    }

    terminate(): void {
    }
}

class TestLayoutService {
    private _focused = false;
    readonly rootContainerElement = document.body;

    get isFocused() {
        return this._focused;
    }

    focus() {
        this._focused = true;
    }

    registerFocusHandler(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerRootContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContentElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    registerContainerElement(): IDisposable {
        return toDisposable(() => undefined);
    }

    getContentElement() {
        return document.body;
    }

    checkElementInCurrentContainers() {
        return true;
    }

    checkContentIsFocused() {
        return this._focused;
    }
}

function createDialogTestBed() {
    const testBed = createTestBed(undefined, [
        [IFindReplaceService, { useClass: FindReplaceService }],
        [ILayoutService, { useClass: TestLayoutService as never }],
        [TestFindReplaceProvider],
    ]);

    const commandService = testBed.get(ICommandService);
    [
        OpenFindDialogOperation,
        OpenReplaceDialogOperation,
        ReplaceCurrentMatchCommand,
        ReplaceAllMatchesCommand,
    ].forEach((command) => commandService.registerCommand(command));

    const provider = testBed.get(TestFindReplaceProvider);
    const findReplaceService = testBed.get(IFindReplaceService);
    findReplaceService.registerFindReplaceProvider(provider);

    return {
        ...testBed,
        commandService,
        provider,
        findReplaceService,
    };
}

function renderDialog(injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <FindReplaceDialog />
            </RediContext.Provider>
        );
    });
    return { container, root };
}

function getInputs(container: HTMLElement): HTMLInputElement[] {
    return Array.from(container.querySelectorAll('input[type="text"]'));
}

function getButton(container: HTMLElement, text: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === text);
    if (!button) {
        throw new Error(`Button "${text}" was not found.`);
    }

    return button as HTMLButtonElement;
}

function getLink(container: HTMLElement, text: string): HTMLElement {
    const link = Array.from(container.querySelectorAll('a')).find((item) => item.textContent?.trim() === text);
    if (!link) {
        throw new Error(`Link "${text}" was not found.`);
    }

    return link as HTMLElement;
}

function setInputValue(input: HTMLInputElement, value: string): void {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function flushSearch() {
    await act(async () => {
        await awaitTime(260);
    });
}

describe('FindReplaceDialog', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('runs a find session from the simple dialog input', async () => {
        const testBed = createDialogTestBed();
        await act(async () => {
            testBed.commandService.syncExecuteCommand(OpenFindDialogOperation.id);
        });

        const rendered = renderDialog(testBed.univer.__getInjector());
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            setInputValue(getInputs(container!)[0], 'apple');
        });
        await act(async () => {
            await awaitTime(560);
        });
        await flushSearch();

        expect(testBed.provider.queries.at(-1)).toMatchObject({
            findString: 'apple',
            replaceRevealed: false,
            findDirection: FindDirection.ROW,
            findScope: FindScope.SUBUNIT,
            findBy: FindBy.VALUE,
            caseSensitive: false,
            matchesTheWholeCell: false,
        });
        expect(readCurrentMatch(testBed.findReplaceService)?.range).toEqual({ id: 'A1' });
        expect(readState(testBed.findReplaceService)).toMatchObject({ matchesCount: 3, matchesPosition: 1 });
    });

    it('reveals replace controls from the advanced link without restarting the session', async () => {
        const testBed = createDialogTestBed();
        await act(async () => {
            testBed.commandService.syncExecuteCommand(OpenFindDialogOperation.id);
        });

        const rendered = renderDialog(testBed.univer.__getInjector());
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            getLink(container!, ADVANCED_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(testBed.findReplaceService.replaceRevealed).toBe(true);
        expect(getButton(container!, FIND_LABEL).disabled).toBe(true);
        expect(getButton(container!, REPLACE_LABEL).disabled).toBe(true);
        expect(getButton(container!, REPLACE_ALL_LABEL).disabled).toBe(true);
        expect(getInputs(container!)).toHaveLength(2);
    });

    it('replaces the selected result and then replaces all remaining results', async () => {
        const testBed = createDialogTestBed();
        await act(async () => {
            testBed.commandService.syncExecuteCommand(OpenReplaceDialogOperation.id);
        });

        const rendered = renderDialog(testBed.univer.__getInjector());
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            const inputs = getInputs(container!);
            setInputValue(inputs[0], 'apple');
            setInputValue(inputs[1], 'orange');
            getButton(container!, FIND_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(readState(testBed.findReplaceService)).toMatchObject({ matchesCount: 3, matchesPosition: 1 });

        await act(async () => {
            getButton(container!, REPLACE_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(testBed.provider.rows.map((row) => row.text)).toEqual(['orange', 'pineapple', 'Apple', 'banana']);

        await act(async () => {
            getButton(container!, REPLACE_ALL_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(testBed.provider.rows.map((row) => row.text)).toEqual(['orange', 'orange', 'orange', 'banana']);
        expect((testBed.get(IMessageService) as TestMessageService).messages.at(-1)?.content).toBe('find-replace.replace.all-success');
    });

    it('moves to the next result when finding the same replace dialog input again', async () => {
        const testBed = createDialogTestBed();
        await act(async () => {
            testBed.commandService.syncExecuteCommand(OpenReplaceDialogOperation.id);
        });

        const rendered = renderDialog(testBed.univer.__getInjector());
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            const inputs = getInputs(container!);
            setInputValue(inputs[0], 'apple');
            getButton(container!, FIND_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(testBed.provider.queries).toHaveLength(1);
        expect(readCurrentMatch(testBed.findReplaceService)?.range).toEqual({ id: 'A1' });
        expect(readState(testBed.findReplaceService)).toMatchObject({ matchesCount: 3, matchesPosition: 1 });

        await act(async () => {
            getButton(container!, FIND_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(testBed.provider.queries).toHaveLength(1);
        expect(readCurrentMatch(testBed.findReplaceService)?.range).toEqual({ id: 'A2' });
        expect(readState(testBed.findReplaceService)).toMatchObject({ matchesCount: 3, matchesPosition: 2 });
    });

    it('uses the replace dialog options when searching', async () => {
        const testBed = createDialogTestBed();
        await act(async () => {
            testBed.commandService.syncExecuteCommand(OpenReplaceDialogOperation.id);
        });

        const rendered = renderDialog(testBed.univer.__getInjector());
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            const inputs = getInputs(container!);
            setInputValue(inputs[0], 'Apple');
            const checkboxes = Array.from(container!.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
            checkboxes.forEach((checkbox) => checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true })));
            getButton(container!, FIND_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(testBed.provider.queries.at(-1)).toMatchObject({
            findString: 'Apple',
            replaceRevealed: true,
            caseSensitive: true,
            matchesTheWholeCell: true,
        });
        expect(readState(testBed.findReplaceService)).toMatchObject({ matchesCount: 1, matchesPosition: 1 });
        expect(readCurrentMatch(testBed.findReplaceService)?.range).toEqual({ id: 'A3' });
    });

    it('warns and keeps replace actions disabled when a replace dialog search has no results', async () => {
        const testBed = createDialogTestBed();
        await act(async () => {
            testBed.commandService.syncExecuteCommand(OpenReplaceDialogOperation.id);
        });

        const rendered = renderDialog(testBed.univer.__getInjector());
        root = rendered.root;
        container = rendered.container;

        await act(async () => {
            const inputs = getInputs(container!);
            setInputValue(inputs[0], 'kiwi');
            setInputValue(inputs[1], 'orange');
            getButton(container!, FIND_LABEL).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        await flushSearch();

        expect(testBed.provider.queries.at(-1)).toMatchObject({
            findString: 'kiwi',
            replaceRevealed: true,
        });
        expect(readState(testBed.findReplaceService)).toMatchObject({ matchesCount: 0, matchesPosition: 0 });
        expect(readCurrentMatch(testBed.findReplaceService)).toBeNull();
        expect((testBed.get(IMessageService) as TestMessageService).messages.at(-1)?.content).toBe('find-replace.dialog.no-match');
        expect(getButton(container!, REPLACE_LABEL).disabled).toBe(true);
        expect(getButton(container!, REPLACE_ALL_LABEL).disabled).toBe(true);
        expect(testBed.provider.rows.map((row) => row.text)).toEqual(INITIAL_ROWS.map((row) => row.text));
    });
});

function readState(findReplaceService: IFindReplaceService): IFindReplaceState {
    let value!: IFindReplaceState;
    const subscription = findReplaceService.state$.subscribe((state) => {
        value = state;
    });
    subscription.unsubscribe();
    return value;
}

function readCurrentMatch(findReplaceService: IFindReplaceService): Nullable<IFindMatch> {
    let value: Nullable<IFindMatch> = null;
    const subscription = findReplaceService.currentMatch$.subscribe((match) => {
        value = match;
    });
    subscription.unsubscribe();
    return value;
}
