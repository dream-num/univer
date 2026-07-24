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

import type { IOperation } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import { CommandType, LocaleService } from '@univerjs/core';
import { IDialogService } from '../../services/dialog/dialog.service';
import {
    FEATURE_SEARCH_COMPONENT,
    FEATURE_SEARCH_DIALOG_ID,
} from '../../views/components/feature-search/FeatureSearch';

export const OpenFeatureSearchOperation: IOperation = {
    id: 'ui.operation.open-feature-search',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const dialogService = accessor.get(IDialogService);
        const localeService = accessor.get(LocaleService);

        dialogService.open({
            id: FEATURE_SEARCH_DIALOG_ID,
            width: 560,
            title: { title: localeService.t<LocaleKey>('ui.featureSearch.title') },
            children: { label: FEATURE_SEARCH_COMPONENT },
            onClose: () => dialogService.close(FEATURE_SEARCH_DIALOG_ID),
        });

        return true;
    },
};
