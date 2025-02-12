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

import type zhCN from './zh-CN';

const enUS: typeof zhCN = {
    hyperLink: {
        form: {
            editTitle: 'Edit Link',
            addTitle: 'Insert Link',
            label: 'Label',
            type: 'Type',
            link: 'Link',
            linkPlaceholder: 'Enter link',
            range: 'Range',
            worksheet: 'Worksheet',
            definedName: 'Defined Name',
            ok: 'Confirm',
            cancel: 'Cancel',
            labelPlaceholder: 'Enter label',
            inputError: 'Please enter',
            selectError: 'Please select',
            linkError: 'Please enter a legal link',
        },
        menu: {
            add: 'Insert Link',
        },
        message: {
            noSheet: 'Target sheet has been delete',
            refError: 'Invalid Range',
            hiddenSheet: 'Cannot open the link because the linked sheet is hidden',
            coped: 'Link copied to clipboard',
        },
        popup: {
            copy: 'Copy Link',
            edit: 'Edit Link',
            cancel: 'Cancel Link',
        },
    },
};

export default enUS;
