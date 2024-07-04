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

import type { ICommand, Nullable } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export interface IShowDocHyperLinkEditPopupOperationParams {
    link?: {
        unitId: string;
        linkId: string;
    };
}

export const ShowDocHyperLinkEditPopupOperation: ICommand<IShowDocHyperLinkEditPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'docs.operation.show-hyper-link-edit-popup',
    handler(accessor, params) {
        const linkInfo = params?.link;
        const hyperLinkService = accessor.get(DocHyperLinkPopupService);
        hyperLinkService.showEditPopup(linkInfo);
        return true;
    },
};

export interface IToggleDocHyperLinkInfoPopupOperationParams {
    link?: Nullable<{
        unitId: string;
        linkId: string;
    }>;
}

export const ToggleDocHyperLinkInfoPopupOperation: ICommand<IToggleDocHyperLinkInfoPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'docs.operation.toggle-hyper-link-info-popup',
    handler(accessor, params) {
        const link = params?.link;
        const hyperLinkService = accessor.get(DocHyperLinkPopupService);
        if (link) {
            hyperLinkService.showInfoPopup(link.unitId, link.linkId);
        } else {
            hyperLinkService.hideInfoPopup();
        }

        return true;
    },
};
