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

import type { IMessageProps } from '@univerjs/design';
import { ICommandService, IConfigService, Injector, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { ERROR_RANGE, SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import { afterEach, describe, expect, it } from 'vitest';
import { SheetsHyperLinkResolverService } from '../resolver.service';

class TestCommandService {
    readonly commands: Array<{ id: string; params: any }> = [];
    activateResult = true;

    async executeCommand(id: string, params: any): Promise<boolean> {
        this.commands.push({ id, params });
        return id === SetWorksheetActiveOperation.id ? this.activateResult : true;
    }
}

class TestDefinedNamesService {
    namedRanges = new Map<string, { formulaOrRefString: string }>();
    worksheetsByRef: any[] = [];
    readonly focusedRanges: Array<{ unitId: string; rangeId: string }> = [];

    getValueById(_unitId: string, rangeId: string): { formulaOrRefString: string } | undefined {
        return this.namedRanges.get(rangeId);
    }

    getWorksheetByRef(): any {
        return this.worksheetsByRef.shift();
    }

    focusRange(unitId: string, rangeId: string): void {
        this.focusedRanges.push({ unitId, rangeId });
    }
}

class TestMessageService {
    readonly messages: IMessageProps[] = [];

    show(options: IMessageProps): void {
        this.messages.push(options);
    }
}

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class TestConfigService {
    configs: any[] = [];

    getConfig(): any {
        return this.configs.length ? this.configs.shift() : undefined;
    }
}

class TestUniverInstanceService {
    currentUnit: any = null;
    unit: any = null;

    getCurrentUnitOfType(): any {
        return this.currentUnit;
    }

    getUnit(): any {
        return this.unit ?? this.currentUnit;
    }
}

function createWorksheet(sheetId: string, options?: { hidden?: boolean }) {
    return {
        getSheetId: () => sheetId,
        getMergeData: () => [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
        getMaxColumns: () => 10,
        getMaxRows: () => 10,
        isSheetHidden: () => !!options?.hidden,
    };
}

function createWorkbook(options?: {
    activeSheet?: any;
    targetSheet?: any;
    hiddenSheets?: string[];
}) {
    return {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => options?.activeSheet ?? createWorksheet('sheet-1'),
        getSheetBySheetId: (sheetId: string) => (options?.targetSheet?.getSheetId() === sheetId ? options.targetSheet : null),
        getHiddenWorksheets: () => options?.hiddenSheets ?? [],
    };
}

function createResolver() {
    const injector = new Injector();

    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IDefinedNamesService, { useClass: TestDefinedNamesService as never }]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IConfigService, { useClass: TestConfigService as never }]);
    injector.add([SheetsHyperLinkResolverService]);

    return {
        resolver: injector.get(SheetsHyperLinkResolverService),
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
        definedNamesService: injector.get(IDefinedNamesService) as unknown as TestDefinedNamesService,
        messageService: injector.get(IMessageService) as unknown as TestMessageService,
        configService: injector.get(IConfigService) as unknown as TestConfigService,
        univerInstanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
    };
}

const originalOpen = window.open;
const waitForNavigationJobs = () => new Promise((resolve) => setTimeout(resolve));

describe('SheetsHyperLinkResolverService', () => {
    afterEach(() => {
        window.open = originalOpen;
    });

    it('should navigate to sheet ranges and execute selection and scroll commands', async () => {
        const { resolver, commandService, univerInstanceService } = createResolver();
        const targetSheet = createWorksheet('sheet-2');
        univerInstanceService.currentUnit = createWorkbook({ targetSheet });

        await resolver.navigateToRange('unit-1', 'sheet-2', { startRow: 1, endRow: 20, startColumn: 1, endColumn: 20 }, true);

        expect(commandService.commands).toEqual([
            { id: SetWorksheetActiveOperation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-2' } },
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-2',
                    selections: [{ range: { startRow: 1, endRow: 9, startColumn: 1, endColumn: 9 }, primary: null }],
                },
            },
            {
                id: ScrollToRangeOperation.id,
                params: { range: { startRow: 1, endRow: 9, startColumn: 1, endColumn: 9 }, forceTop: true },
            },
        ]);
    });

    it('should show user-facing errors when target sheets or defined names are invalid', async () => {
        const { resolver, definedNamesService, messageService, univerInstanceService } = createResolver();
        univerInstanceService.currentUnit = createWorkbook({ hiddenSheets: ['sheet-hidden'] });
        definedNamesService.namedRanges.set('named-range', { formulaOrRefString: 'Sheet1!A1' });
        definedNamesService.worksheetsByRef.push(null, createWorksheet('sheet-hidden', { hidden: true }), createWorksheet('sheet-1'));

        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'missing-range' } } as any);
        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'named-range' } } as any);
        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'named-range' } } as any);
        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'named-range' } } as any);

        await resolver.navigateToSheetById('unit-1', 'sheet-missing');
        await resolver.navigateToSheetById('unit-1', 'sheet-hidden');

        expect(messageService.messages).toEqual([
            { content: 'sheets-hyper-link-ui.message.refError', type: 'error' },
            { content: 'sheets-hyper-link-ui.message.hiddenSheet', type: 'error' },
            { content: 'sheets-hyper-link-ui.message.noSheet', type: 'error' },
            { content: 'sheets-hyper-link-ui.message.noSheet', type: 'error' },
        ]);
        expect(definedNamesService.focusedRanges).toEqual([{ unitId: 'unit-1', rangeId: 'named-range' }]);
    });

    it('should open external links via configured handlers or fallback window.open', async () => {
        const { resolver, configService } = createResolver();
        const navigatedUrls: string[] = [];
        const openedUrls: any[] = [];
        window.open = ((...args: any[]) => {
            openedUrls.push(args);
            return null;
        }) as typeof window.open;
        configService.configs.push(
            { urlHandler: { navigateToOtherWebsite: (url: string) => navigatedUrls.push(url) } },
            undefined
        );

        await resolver.navigateToOtherWebsite('https://univer.ai');
        await resolver.navigateToOtherWebsite('https://openai.com');
        await resolver.navigateToOtherWebsite('javascript:alert(1)');
        resolver.navigate({ type: SheetHyperLinkType.URL, url: 'https://example.com' } as any);

        expect(navigatedUrls).toEqual(['https://univer.ai']);
        expect(openedUrls).toEqual([
            ['https://openai.com', '_blank', 'noopener noreferrer'],
            ['https://example.com', '_blank', 'noopener noreferrer'],
        ]);
    });

    it('should interpret workbook-style links through the public navigate entry', async () => {
        const { resolver, commandService, univerInstanceService } = createResolver();
        univerInstanceService.currentUnit = createWorkbook({ targetSheet: createWorksheet('sheet-2') });

        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { gid: 'sheet-2', range: 'B2:C3' } } as any);
        await waitForNavigationJobs();

        expect(commandService.commands.map((command) => command.id)).toEqual([
            SetWorksheetActiveOperation.id,
            SetSelectionsOperation.id,
            ScrollToRangeOperation.id,
        ]);
    });

    it('should ignore invalid workbook targets without executing navigation commands', async () => {
        const { resolver, commandService, univerInstanceService } = createResolver();

        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { gid: 'sheet-1' } } as any);
        await resolver.navigateToSheetById('unit-1', 'sheet-1');

        univerInstanceService.currentUnit = createWorkbook({ activeSheet: null });
        await resolver.navigateToSheetById('unit-1', 'sheet-1');

        univerInstanceService.currentUnit = createWorkbook({ targetSheet: createWorksheet('sheet-2') });
        commandService.activateResult = false;
        await resolver.navigateToSheetById('unit-1', 'sheet-2');

        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { gid: 'sheet-2', range: ERROR_RANGE } } as any);
        await Promise.resolve();

        expect(commandService.commands).toEqual([
            { id: SetWorksheetActiveOperation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-2' } },
        ]);
    });

    it('should stay on the current worksheet when the hyperlink already points there', async () => {
        const { resolver, commandService, univerInstanceService } = createResolver();
        const activeSheet = createWorksheet('sheet-1');
        univerInstanceService.currentUnit = createWorkbook({ activeSheet });

        const result = await resolver.navigateToSheetById('unit-1', 'sheet-1');

        expect(result).toBe(activeSheet);
        expect(commandService.commands).toEqual([]);
    });
});
