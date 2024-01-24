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

import type { LocaleType } from '@univerjs/core';
import { LocaleService, RxDisposable } from '@univerjs/core';
import { Inject, Injector, Optional } from '@wendellhu/redi';
import { ILayoutService } from '@univerjs/ui';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';

import type { IUniverDocsUIConfig } from '../basics';
import { DocContainerUIController } from './doc-container-ui-controller';

export class AppUIController extends RxDisposable {
    private _docContainerController: DocContainerUIController;

    constructor(
        _config: IUniverDocsUIConfig,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _injector: Injector,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();
        this._docContainerController = this._injector.createInstance(DocContainerUIController, _config);
        this._registerContainer();
    }

    private _registerContainer() {
        if (this._layoutService) {
            this.disposeWithMe(
                // the content editable div should be regarded as part of the applications container
                this._layoutService.registerContainerElement(this._textSelectionRenderManager.__getEditorContainer())
            );
        }
    }

    /**
     * Change language
     * @param {string} locale new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.setLocale(locale as LocaleType);
    };

    getDocContainerController() {
        return this._docContainerController;
    }
}
