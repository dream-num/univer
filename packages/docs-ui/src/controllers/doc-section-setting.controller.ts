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

import { Disposable, Inject } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { DOC_SECTION_SETTING_COMPONENT } from '../views/section-setting/component-name';

export class DocSectionSettingController extends Disposable {
    private readonly _panelId = 'DocSectionSetting';

    constructor(@Inject(ISidebarService) private readonly _sidebarService: ISidebarService) {
        super();
    }

    openPanel(): void {
        this._sidebarService.open({
            header: { title: 'docs-ui.doc.slider.sectionSetting' },
            id: this._panelId,
            children: { label: DOC_SECTION_SETTING_COMPONENT },
            width: 300,
        });
    }

    closePanel(): void {
        this._sidebarService.close(this._panelId);
    }
}
