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

import type { DocumentDataModel, ICustomRangeForInterceptor, IDocumentData, IInterceptor } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';

import {
    CustomRangeType,
    ICommandService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DocsRenameMutation } from '../commands/mutations/docs-rename.mutation';
import { SetTextSelectionsOperation } from '../commands/operations/text-selection.operation';
import { UniverDocsPlugin } from '../plugin';
import { DocInterceptorService } from '../services/doc-interceptor/doc-interceptor.service';
import { DOC_INTERCEPTOR_POINT } from '../services/doc-interceptor/interceptor-const';
import { DocSelectionManagerService } from '../services/doc-selection-manager.service';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { DocStateEmitService } from '../services/doc-state-emit.service';
import { DocViewModelManagerService } from '../services/doc-view-model-manager.service';
import { addCustomRangeBySelectionFactory, deleteCustomRangeFactory } from '../utils/custom-range-factory';
import { replaceSelectionFactory } from '../utils/replace-selection-factory';

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function registerRenderManagerForDoc(
    injector: ReturnType<Univer['__getInjector']>,
    doc: DocumentDataModel
) {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const context: IRenderContext<DocumentDataModel> = {
        unitId: doc.getUnitId(),
        unit: doc,
    } as never;

    const skeletonManager = new DocSkeletonManagerService(
        context,
        injector.get(LocaleService),
        univerInstanceService
    );

    injector.add([IRenderManagerService, {
        useValue: {
            getRenderById: (unitId: string) => unitId === doc.getUnitId()
                ? ({
                    with: () => skeletonManager,
                } as never)
                : null,
        } as never,
    }]);

    return skeletonManager;
}

function createTestDocData(id: string): IDocumentData {
    return {
        id,
        body: {
            dataStream: 'Hello\r\n',
            customRanges: [{
                startIndex: 0,
                endIndex: 4,
                rangeId: 'range-1',
                rangeType: CustomRangeType.HYPERLINK,
                wholeEntity: true,
                properties: { url: 'https://example.invalid' },
            }],
        },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

describe('docs integration', () => {
    let univer: Univer;
    let injector: ReturnType<Univer['__getInjector']>;

    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
        injector.get(LifecycleService).stage = LifecycleStages.Starting;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('renames doc through command service mutation', async () => {
        univer.registerPlugin(UniverDocsPlugin);
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createTestDocData('doc-1')
        );

        const univerInstanceService = injector.get(IUniverInstanceService);
        univerInstanceService.focusUnit(doc.getUnitId());

        const commandService = injector.get(ICommandService);
        const ok = await commandService.executeCommand(DocsRenameMutation.id, {
            unitId: doc.getUnitId(),
            name: 'Renamed',
        });

        expect(ok).toBeTruthy();
        expect(doc.getTitle()).toBe('Renamed');
    });

    it('manages selections and emits selection operations via real command flow', async () => {
        univer.registerPlugin(UniverDocsPlugin);
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createTestDocData('doc-2')
        );

        const univerInstanceService = injector.get(IUniverInstanceService);
        univerInstanceService.focusUnit(doc.getUnitId());

        const commandService = injector.get(ICommandService);

        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: doc.getUnitId(),
            subUnitId: doc.getUnitId(),
        });

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
                isActive: true,
                segmentId: '',
                style: null as never,
            },
            {
                startOffset: 0,
                endOffset: 2,
                collapsed: false,
                isActive: false,
                segmentId: '',
                style: null as never,
            },
        ]);

        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(5);
        expect(selectionManager.getDocRanges()?.map((r) => r.startOffset)).toEqual([0, 5]);

        const refreshLogs: unknown[] = [];
        const refreshSub = selectionManager.refreshSelection$.subscribe((v) => v && refreshLogs.push(v));
        selectionManager.replaceDocRanges([
            { startOffset: 1, endOffset: 1, collapsed: true, segmentId: '' },
        ] as never);

        expect(refreshLogs.length).toBeGreaterThan(0);
        refreshSub.unsubscribe();

        const executed: Array<{ id: string; params: unknown }> = [];
        const dispose = commandService.onCommandExecuted((info) => executed.push({ id: info.id, params: info.params }));

        selectionManager.__replaceTextRangesWithNoRefresh(
            {
                segmentId: '',
                segmentPage: -1,
                style: null as never,
                textRanges: [{ startOffset: 2, endOffset: 3, collapsed: false, segmentId: '' }] as never,
                rectRanges: [],
                isEditing: true,
            },
            { unitId: doc.getUnitId(), subUnitId: doc.getUnitId() }
        );

        await waitNextTick();
        expect(executed.some((e) => e.id === SetTextSelectionsOperation.id)).toBe(true);
        dispose.dispose();
    });

    it('replaces a selection through the factory-generated rich text mutation', async () => {
        univer.registerPlugin(UniverDocsPlugin);
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createTestDocData('doc-2a')
        );

        const univerInstanceService = injector.get(IUniverInstanceService);
        univerInstanceService.focusUnit(doc.getUnitId());
        const skeletonManager = registerRenderManagerForDoc(injector, doc);

        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: doc.getUnitId(),
            subUnitId: doc.getUnitId(),
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 5,
            endOffset: 5,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const docStateEmitService = injector.get(DocStateEmitService);
        const stateChanges: unknown[] = [];
        const sub = docStateEmitService.docStateChangeParams$.subscribe((value) => value && stateChanges.push(value));

        const mutation = replaceSelectionFactory(injector as never, {
            unitId: doc.getUnitId(),
            body: {
                dataStream: ' world',
            },
        });

        expect(mutation).not.toBe(false);
        if (mutation === false) {
            throw new Error('Expected replaceSelectionFactory to create a mutation.');
        }
        expect(mutation.params.textRanges?.[0]?.startOffset).toBe(11);

        const commandService = injector.get(ICommandService);
        const ok = await commandService.executeCommand(mutation.id, {
            ...mutation.params,
            trigger: 'integration-spec' as never,
        });

        await waitNextTick();

        expect(ok).toBeTruthy();
        expect(doc.getBody()?.dataStream).toBe('Hello world\r\n');
        expect(stateChanges).toHaveLength(1);

        sub.unsubscribe();
        skeletonManager.dispose();
    });

    it('adds and removes custom ranges through the same mutation pipeline', async () => {
        univer.registerPlugin(UniverDocsPlugin);
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createTestDocData('doc-2b')
        );

        const univerInstanceService = injector.get(IUniverInstanceService);
        univerInstanceService.focusUnit(doc.getUnitId());
        const skeletonManager = registerRenderManagerForDoc(injector, doc);

        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: doc.getUnitId(),
            subUnitId: doc.getUnitId(),
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 4,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const commandService = injector.get(ICommandService);
        const addMutation = addCustomRangeBySelectionFactory(injector as never, {
            unitId: doc.getUnitId(),
            rangeId: 'range-2',
            rangeType: CustomRangeType.HYPERLINK,
            wholeEntity: true,
            properties: {
                url: 'https://added.invalid',
            },
        });

        expect(addMutation).not.toBe(false);
        if (addMutation === false) {
            throw new Error('Expected addCustomRangeBySelectionFactory to create a mutation.');
        }
        await commandService.executeCommand(addMutation.id, addMutation.params);

        expect(doc.getBody()?.customRanges?.find((range) => range.rangeId === 'range-2')?.properties).toEqual({
            url: 'https://added.invalid',
        });

        const deleteMutation = deleteCustomRangeFactory(injector as never, {
            unitId: doc.getUnitId(),
            rangeId: 'range-2',
        });

        expect(deleteMutation).not.toBe(false);
        if (deleteMutation === false) {
            throw new Error('Expected deleteCustomRangeFactory to create a mutation.');
        }
        await commandService.executeCommand(deleteMutation.id, deleteMutation.params);

        expect(doc.getBody()?.customRanges?.some((range) => range.rangeId === 'range-2')).toBe(false);
        skeletonManager.dispose();
    });

    it('builds skeleton/view-model and applies interceptors for custom ranges', () => {
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createTestDocData('doc-3')
        );

        const univerInstanceService = injector.get(IUniverInstanceService);
        univerInstanceService.focusUnit(doc.getUnitId());

        const context: IRenderContext<DocumentDataModel> = {
            unitId: doc.getUnitId(),
            unit: doc,
        } as never;

        const skeletonManager = new DocSkeletonManagerService(
            context,
            injector.get(LocaleService),
            univerInstanceService
        );

        const viewModelManager = new DocViewModelManagerService(context, univerInstanceService);
        expect(viewModelManager.getViewModel(doc.getUnitId())).toBeDefined();

        const interceptorService = new DocInterceptorService(context, skeletonManager);
        interceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
            priority: 10,
            handler: (range, ctx, next) => {
                const nextRange = next(range);
                return nextRange ? { ...nextRange, properties: { ...nextRange.properties, unitId: ctx.unitId } } : nextRange;
            },
        } as IInterceptor<ICustomRangeForInterceptor, {
            index: number;
            unitId: string;
            customRanges: ICustomRangeForInterceptor[];
        }>);

        interceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
            priority: -10,
            handler: (range, _ctx, next) => {
                const nextRange = next(range);
                return nextRange ? { ...nextRange, properties: { ...nextRange.properties, tagged: true } } : nextRange;
            },
        } as IInterceptor<ICustomRangeForInterceptor, {
            index: number;
            unitId: string;
            customRanges: ICustomRangeForInterceptor[];
        }>);

        const range = skeletonManager.getViewModel().getCustomRange(1);
        expect(range?.rangeId).toBe('range-1');
        expect(range?.properties).toMatchObject({ unitId: doc.getUnitId(), tagged: true });

        const docStateEmitService = new DocStateEmitService();
        const values: unknown[] = [];
        const sub = docStateEmitService.docStateChangeParams$.subscribe((v) => v && values.push(v));
        docStateEmitService.emitStateChangeInfo({
            commandId: 'test',
            unitId: doc.getUnitId(),
            trigger: null,
            redoState: { actions: [], textRanges: null },
            undoState: { actions: [], textRanges: null },
        });
        expect(values.length).toBe(1);
        sub.unsubscribe();

        interceptorService.dispose();
        viewModelManager.dispose();
        skeletonManager.dispose();
    });
});
