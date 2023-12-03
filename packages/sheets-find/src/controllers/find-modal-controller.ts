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
