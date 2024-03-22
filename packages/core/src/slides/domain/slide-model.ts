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

import { Tools } from '../../shared';
import { DEFAULT_SLIDE } from '../../types/const';
import type { ISlideData, ISlidePage } from '../../types/interfaces';
import { PageType } from '../../types/interfaces';

export class SlideDataModel {
    private _snapshot: ISlideData;

    private _unitId: string;

    constructor(snapshot: Partial<ISlideData>) {
        this._snapshot = { ...DEFAULT_SLIDE, ...snapshot };
        this._unitId = this._snapshot.id ?? Tools.generateRandomId(6);
    }

    getContainer() {
        return this._snapshot.container;
    }

    getParentRenderUnitId() {
        return this._snapshot.parentRenderUnitId;
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }

    getPages() {
        return this._snapshot.body?.pages;
    }

    getPageOrder() {
        return this._snapshot.body?.pageOrder;
    }

    getPage(pageId: string) {
        const pages = this.getPages();
        return pages?.[pageId];
    }

    getElementsByPage(pageId: string) {
        return this.getPage(pageId)?.pageElements;
    }

    getElement(pageId: string, elementId: string) {
        return this.getElementsByPage(pageId)?.[elementId];
    }

    getPageSize() {
        return this._snapshot.pageSize;
    }

    addPage(): ISlidePage {
        return {
            id: 'cover_1',
            pageType: PageType.SLIDE,
            zIndex: 1,
            title: 'cover',
            description: 'this is first page, cover',
            pageBackgroundFill: {
                rgb: 'rgb(255,255,255)',
            },
            pageElements: {},
        };
    }
}
