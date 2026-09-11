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

import type { IDisposable, ITextRangeParam } from '@univerjs/core';
import type { ILinkInfo } from '../hyper-link-popup.service';
import { MOBILE_DOC_ELEMENT_MENU } from '@univerjs/docs-ui';
import { MobileDocHyperLinkEdit } from '../../views/MobileDocHyperLinkEdit';
import { MobileDocLinkPopup } from '../../views/MobileDocLinkPopup';
import { DocHyperLinkPopupService } from '../hyper-link-popup.service';

export class MobileDocHyperLinkPopupService extends DocHyperLinkPopupService {
    protected override _openEditSurface(_activeRange: ITextRangeParam, _unitId: string): IDisposable {
        return this._dialogService.open({
            id: 'doc-mobile-hyper-link-editor',
            title: { title: this._localeService.t('docs-hyper-link-ui.menu.tooltip') },
            children: { label: MobileDocHyperLinkEdit.componentKey },
            maskClosable: false,
            onClose: () => this.hideEditPopup(),
        });
    }

    protected override _openInfoSurface(info: ILinkInfo): IDisposable {
        if (this.canEditLink(info.unitId, info)) {
            return super._openInfoSurface(info, MOBILE_DOC_ELEMENT_MENU);
        }
        return this._dialogService.open({
            id: 'doc-mobile-hyper-link-viewer',
            title: { title: this._localeService.t('docs-hyper-link-ui.menu.tooltip') },
            children: { label: MobileDocLinkPopup.componentKey },
            onClose: () => this.hideInfoPopup(),
        });
    }
}
