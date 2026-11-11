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

import type { IDocumentData, Injector } from '@univerjs/core';
import { DocumentDataModel, LocaleService, PRESET_LIST_TYPE, Univer } from '@univerjs/core';
import { afterEach } from 'vitest';
import type { IDocumentSkeletonPage } from '../../../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../../../view-model/data-stream-tree-node';
import type { ILayoutContext } from '../../../tools';
import { DocumentViewModel } from '../../../../view-model/document-view-model';
import { Hyphen } from '../../../hyphenation/hyphen';
import { LanguageDetector } from '../../../hyphenation/language-detector';
import { createSkeletonPage } from '../../../model/page';
import { getNullSkeleton, prepareSectionBreakConfig } from '../../../tools';

export interface IParagraphLayoutTestBed {
    injector: Injector;
    dataModel: DocumentDataModel;
    viewModel: DocumentViewModel;
    ctx: ILayoutContext;
    paragraphNode: DataStreamTreeNode;
    sectionBreakConfig: ISectionBreakConfig;
    curPage: IDocumentSkeletonPage;
}

const runtimes = new Set<Univer>();
afterEach(() => {
    for (const runtime of runtimes) {
        runtime.dispose();
    }
    runtimes.clear();
});

function createDocModel(
    injector: Injector,
    content: string,
    overrides: { body?: Record<string, unknown>; documentStyle?: Record<string, unknown>; [key: string]: unknown } = {}
): DocumentDataModel {
    const dataStream = `${content}\r\n`;
    const bodyOverride = (overrides.body ?? {}) as Record<string, unknown>;
    const documentStyleOverride = (overrides.documentStyle ?? {}) as Record<string, unknown>;
    const documentData = {
        id: 'test-doc',
        drawings: {},
        drawingsOrder: [] as string[],
        ...overrides,
        body: {
            dataStream,
            textRuns: [{ st: 0, ed: dataStream.length, ts: {} }],
            paragraphs: [{ startIndex: content.length, paragraphId: 'para_layout_test' }],
            sectionBreaks: [{ sectionId: 'section_fixture_1026', startIndex: content.length + 1 }],
            ...bodyOverride,
        },
        documentStyle: {
            pageSize: { width: 400, height: 600 },
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
            ...documentStyleOverride,
        },
    };
    injector.add([DocumentDataModel, { useFactory: () => injector.createInstance(DocumentDataModel, documentData as unknown as Partial<IDocumentData>) }]);
    return injector.get(DocumentDataModel);
}

function createLayoutContext(viewModel: DocumentViewModel, localeService: LocaleService): ILayoutContext {
    const dataModel = viewModel.getDataModel();
    const { documentStyle, drawings, lists: customLists = {} } = dataModel;
    const lists = { ...PRESET_LIST_TYPE, ...customLists };
    const { headerTreeMap, footerTreeMap } = viewModel.getHeaderFooterTreeMap();

    const docsConfig = {
        headerTreeMap,
        footerTreeMap,
        lists,
        drawings,
        localeService,
        paragraphLineGapDefault: documentStyle.paragraphLineGapDefault ?? 0,
        defaultTabStop: documentStyle.defaultTabStop ?? 10.5,
        documentTextStyle: documentStyle.textStyle ?? {},
    };

    const skeleton = getNullSkeleton();
    const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeleton;

    const skeletonResourceReference = {
        skeHeaders,
        skeFooters,
        skeListLevel,
        drawingAnchor,
    };

    return {
        viewModel,
        dataModel,
        skeleton,
        skeletonResourceReference,
        docsConfig,
        layoutStartPointer: { '': null },
        isDirty: false,
        floatObjectsCache: new Map(),
        paragraphConfigCache: new Map(),
        sectionBreakConfigCache: new Map(),
        paragraphsOpenNewPage: new Set(),
        paginationMetrics: {
            constrainedParagraphs: 0,
            noConstraintParagraphs: 0,
            measuredLineCount: 0,
            retryCount: 0,
            movedLineCount: 0,
            keepNextScanCount: 0,
            peakCheckpointLineCount: 0,
        },
        hyphen: Hyphen.getInstance(),
        languageDetector: LanguageDetector.getInstance(),
    } as ILayoutContext;
}

function getFirstParagraphNode(viewModel: DocumentViewModel): DataStreamTreeNode {
    const sectionNode = viewModel.getChildren()[0];
    return sectionNode.children[0];
}

function createInitialPage(ctx: ILayoutContext, sectionBreakConfig: ISectionBreakConfig): IDocumentSkeletonPage {
    return createSkeletonPage(ctx, sectionBreakConfig, ctx.skeletonResourceReference);
}

export interface ISectionLayoutTestBed {
    injector: Injector;
    dataModel: DocumentDataModel;
    viewModel: DocumentViewModel;
    ctx: ILayoutContext;
    sectionNode: DataStreamTreeNode;
    sectionBreakConfig: ISectionBreakConfig;
    curPage: IDocumentSkeletonPage;
}

export function createParagraphLayoutTestBed(
    content: string,
    overrides: { body?: Record<string, unknown>; documentStyle?: Record<string, unknown>; [key: string]: unknown } = {}
): IParagraphLayoutTestBed {
    const univer = new Univer();
    runtimes.add(univer);
    const injector = univer.__getInjector();
    const dataModel = createDocModel(injector, content, overrides);
    injector.add([DocumentViewModel, { useFactory: () => injector.createInstance(DocumentViewModel, dataModel) }]);
    const viewModel = injector.get(DocumentViewModel);
    const ctx = createLayoutContext(viewModel, injector.get(LocaleService));
    const paragraphNode = getFirstParagraphNode(viewModel);
    const sectionBreakConfig = prepareSectionBreakConfig(ctx, 0);
    const curPage = createInitialPage(ctx, sectionBreakConfig);

    return {
        injector,
        dataModel,
        viewModel,
        ctx,
        paragraphNode,
        sectionBreakConfig,
        curPage,
    };
}

export function createSectionLayoutTestBed(
    contents: string[],
    overrides: { body?: Record<string, unknown>; documentStyle?: Record<string, unknown>; [key: string]: unknown } = {}
): ISectionLayoutTestBed {
    const dataStream = `${contents.join('\r')}\r\n`;
    let currentIndex = 0;
    const paragraphs = contents.map((content) => {
        currentIndex += content.length;
        const startIndex = currentIndex;
        currentIndex += 1; // \r
        return { startIndex };
    });

    const bodyOverride = (overrides.body ?? {}) as Record<string, unknown>;
    const documentStyleOverride = (overrides.documentStyle ?? {}) as Record<string, unknown>;
    const documentData = {
        id: 'test-doc',
        drawings: {},
        drawingsOrder: [] as string[],
        ...overrides,
        body: {
            dataStream,
            textRuns: [{ st: 0, ed: dataStream.length, ts: {} }],
            paragraphs,
            sectionBreaks: [{ sectionId: 'section_fixture_1027', startIndex: dataStream.length - 1 }],
            ...bodyOverride,
        },
        documentStyle: {
            pageSize: { width: 400, height: 600 },
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
            ...documentStyleOverride,
        },
    };

    const univer = new Univer();
    runtimes.add(univer);
    const injector = univer.__getInjector();
    injector.add([DocumentDataModel, { useFactory: () => injector.createInstance(DocumentDataModel, documentData as unknown as Partial<IDocumentData>) }]);
    injector.add([DocumentViewModel, { useFactory: () => injector.createInstance(DocumentViewModel, injector.get(DocumentDataModel)) }]);
    const dataModel = injector.get(DocumentDataModel);
    const viewModel = injector.get(DocumentViewModel);
    const ctx = createLayoutContext(viewModel, injector.get(LocaleService));
    const sectionNode = viewModel.getChildren()[0];
    const sectionBreakConfig = prepareSectionBreakConfig(ctx, 0);
    const curPage = createInitialPage(ctx, sectionBreakConfig);

    return {
        injector,
        dataModel,
        viewModel,
        ctx,
        sectionNode,
        sectionBreakConfig,
        curPage,
    };
}
