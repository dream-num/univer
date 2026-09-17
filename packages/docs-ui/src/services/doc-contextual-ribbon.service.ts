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

import { Disposable } from '@univerjs/core';
import { IRibbonService } from '@univerjs/ui';

/** Coordinates the document's containing table and selected content control, not global ribbon priority. */
export class DocContextualRibbonService extends Disposable {
    private _tableTab: string | null = null;
    private _contentControlTab: string | null = null;
    private _activeTab = '';

    constructor(@IRibbonService private readonly _ribbonService: IRibbonService) {
        super();
        this.disposeWithMe(this._ribbonService.activatedTab$.subscribe((tab) => this._activeTab = tab));
    }

    setTableTab(tab: string, visible: boolean): void {
        this._setTab('table', tab, visible);
    }

    setContentControlTab(tab: string, visible: boolean): void {
        this._setTab('contentControl', tab, visible);
    }

    private _setTab(context: 'table' | 'contentControl', tab: string, visible: boolean): void {
        const previousTab = context === 'table' ? this._tableTab : this._contentControlTab;
        const nextTab = visible ? tab : null;
        if (previousTab === nextTab) {
            return;
        }

        const previousContext = this._contentControlTab ?? this._tableTab;
        const activeTab = this._activeTab;
        if (context === 'table') {
            this._tableTab = nextTab;
        } else {
            this._contentControlTab = nextTab;
        }

        if (previousTab) {
            this._ribbonService.hideContextualTab(previousTab);
        }
        if (nextTab) {
            this._ribbonService.showContextualTab(nextTab);
        }

        const nextContext = this._contentControlTab ?? this._tableTab;
        // Entering a control activates its tools. Leaving it must respect a manually chosen tab.
        if (nextContext && nextContext !== previousContext
            && (visible || !previousContext || activeTab === previousContext)) {
            this._ribbonService.setActivatedTab(nextContext);
        }
    }

    override dispose(): void {
        if (this._contentControlTab) {
            this.setContentControlTab(this._contentControlTab, false);
        }
        if (this._tableTab) {
            this.setTableTab(this._tableTab, false);
        }
        super.dispose();
    }
}
