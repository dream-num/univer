/**
 * Copyright 2023 DreamNum Inc.
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

import { ComponentManager } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import { TextFinder } from '../domain';
import { FindModal } from '../views/ui/FindModal';

export class FindModalController {
    private _findModal: FindModal | null = null;

    constructor(
        @Inject(TextFinder) private _textFinder: TextFinder,
        @Inject(ComponentManager) private _componentManager: ComponentManager
    ) {
        this._initialize();
    }

    getComponent(ref: FindModal) {
        this._findModal = ref;
    }

    showModal(show: boolean) {
        this._findModal?.showFindModal(show);
    }

    findNext(text: string) {
        const res = this._textFinder.searchText(text);
        if (!res) return { count: 0, current: 0 };
        this._textFinder.findNext();
        return this._getCountInfo();
    }

    findPrevious(text: string) {
        const res = this._textFinder.searchText(text);
        if (!res) return { count: 0, current: 0 };
        this._textFinder.findPrevious();
        return this._getCountInfo();
    }

    replaceText(text: string) {
        if (!this._textFinder) return;
        const replaceCount = this._textFinder.replaceWith(text);
        return {
            ...this._getCountInfo(),
            replaceCount,
        };
    }

    replaceAll(text: string) {
        if (!this._textFinder) return;
        const replaceCount = this._textFinder.replaceAllWith(text);
        return {
            ...this._getCountInfo(),
            replaceCount,
        };
    }

    matchCase(matchCase: boolean) {
        if (!this._textFinder) return;
        this._textFinder.matchCase(matchCase);
    }

    matchEntireCell(matchEntire: boolean) {
        if (!this._textFinder) return;
        this._textFinder.matchEntireCell(matchEntire);
    }

    private _getCountInfo() {
        const count = this._textFinder?.getCount() ?? 0;
        const current = this._textFinder?.getCurrentIndex() ?? 0;
        return {
            count,
            current: current + 1,
        };
    }

    private _initialize() {
        this._componentManager.register(FindModal.name, FindModal);
    }
}
