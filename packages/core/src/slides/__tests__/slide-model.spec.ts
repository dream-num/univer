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

import type { ISlideData, ISlidePage } from '../../types/interfaces';
import type { SlideDataModel } from '../slide-model';
import { afterEach, describe, expect, it } from 'vitest';
import { UniverInstanceType } from '../../common/unit';
import { PageElementType, PageType } from '../../types/interfaces';
import { Univer } from '../../univer';

const slideSnapshotFactory = (): Partial<ISlideData> => ({
    id: 'slide-unit',
    title: 'Quarterly review',
    pageSize: { width: 960, height: 540 },
    body: {
        pageOrder: ['page-1', 'page-2'],
        pages: {
            'page-1': {
                id: 'page-1',
                pageType: PageType.SLIDE,
                zIndex: 1,
                title: 'Overview',
                description: 'Overview slide',
                pageBackgroundFill: { rgb: '#ffffff' },
                pageElements: {
                    'element-1': {
                        id: 'element-1',
                        zIndex: 1,
                        title: 'Intro',
                        description: 'Hero copy',
                        type: PageElementType.TEXT,
                        richText: { text: 'Hello Univer' },
                    },
                },
            },
            'page-2': {
                id: 'page-2',
                pageType: PageType.SLIDE,
                zIndex: 2,
                title: 'Roadmap',
                description: 'Roadmap slide',
                pageBackgroundFill: { rgb: '#f5f5f5' },
                pageElements: {},
            },
        },
    },
});

describe('SlideDataModel', () => {
    let univer: Univer;

    afterEach(() => {
        univer?.dispose();
    });

    it('should manage pages and active-page state through the real unit creation flow', () => {
        univer = new Univer();
        const slide = univer.createUnit<Partial<ISlideData>, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, slideSnapshotFactory());
        const activePages: string[] = [];
        const names: string[] = [];
        const activePageSubscription = slide.activePage$.subscribe((page) => {
            if (page) {
                activePages.push(page.id);
            }
        });
        const nameSubscription = slide.name$.subscribe((name) => names.push(name));

        expect(slide.getUnitId()).toBe('slide-unit');
        expect(slide.getSnapshot().title).toBe('Quarterly review');
        expect(slide.getPages()).toHaveProperty('page-1');
        expect(slide.getPageOrder()).toEqual(['page-1', 'page-2']);
        expect(slide.getPage('page-1')?.title).toBe('Overview');
        expect(slide.getElementsByPage('page-1')).toHaveProperty('element-1');
        expect(slide.getElement('page-1', 'element-1')).toMatchObject({
            id: 'element-1',
            type: PageElementType.TEXT,
        });
        expect(slide.getPageSize()).toEqual({ width: 960, height: 540 });
        expect(slide.getActivePage()?.id).toBe('page-1');
        expect(slide.getRev()).toBe(0);

        slide.incrementRev();
        slide.setRev(5);
        expect(slide.getRev()).toBe(0);

        slide.setActivePage(slide.getPage('page-2')!);
        expect(slide.getActivePage()?.id).toBe('page-2');
        expect(activePages).toEqual(['page-2']);

        const blankPage = slide.getBlankPage();
        expect(blankPage).toMatchObject({
            pageType: PageType.SLIDE,
            zIndex: 10,
            pageBackgroundFill: { rgb: 'rgb(255,255,255)' },
        });

        slide.appendPage(blankPage);
        expect(slide.getPageOrder()).toEqual(['page-1', 'page-2', blankPage.id]);
        expect(slide.getPage(blankPage.id)).toEqual(blankPage);

        const updatedPage: ISlidePage = {
            ...blankPage,
            title: 'Agenda',
            description: 'Agenda slide',
        };
        slide.updatePage(blankPage.id, updatedPage);
        expect(slide.getPage(blankPage.id)).toEqual(updatedPage);

        slide.setName('Quarterly review - updated');
        expect(slide.getSnapshot().title).toBe('Quarterly review - updated');
        expect(slide.getUnitId()).toBe('slide-unit');
        expect(names.at(-1)).toBe('Quarterly review - updated');

        activePageSubscription.unsubscribe();
        nameSubscription.unsubscribe();
    });

    it('should keep empty slide snapshots stable when page collections are absent', () => {
        univer = new Univer();
        const slide = univer.createUnit<Partial<ISlideData>, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, {
            id: 'empty-slide',
            title: 'Empty deck',
        });

        const blankPage = slide.getBlankPage();

        expect(slide.getActivePage()).toBeNull();
        expect(slide.getPages()).toBeUndefined();
        expect(slide.getPageOrder()).toBeUndefined();
        expect(slide.getPage(blankPage.id)).toBeUndefined();

        slide.appendPage(blankPage);
        slide.updatePage(blankPage.id, blankPage);

        expect(slide.getPages()).toBeUndefined();
        expect(slide.getSnapshot()).toMatchObject({
            id: 'empty-slide',
            title: 'Empty deck',
        });
    });
});
