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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { ComponentManager, ISidebarService } from '@univerjs/ui';
import { ParagraphSettingIndex } from '../views/paragraph-setting/index';

const paragraphSettingIndexKey = 'doc_ui_paragraph-setting-panel';

export class DocParagraphSettingController extends Disposable {
    private _id: 'DocParagraphSetting';

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(ISidebarService) private _sidebarService: ISidebarService

    ) {
        super();
        this._init();
    }

    private _init() {
        this.disposeWithMe(this._componentManager.register(paragraphSettingIndexKey, ParagraphSettingIndex));
    }

    public openPanel() {
        const props = {
            header: { title: 'doc.slider.paragraphSetting' },
            id: this._id,
            children: {
                label: paragraphSettingIndexKey,
            },
            width: 300,
        };
        this._sidebarService.open(props);
    }

    public closePanel() {
        this._sidebarService.close(this._id);
    }
}
