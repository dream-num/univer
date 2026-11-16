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

import { LocaleService } from '@univerjs/core';
import { HyperlinkEditor, useDependency } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { useDocHyperLinkEdit } from './hyper-link-edit/use-doc-hyper-link-edit';
import { isBlankInput } from './hyper-link-edit/utils';

export const DocHyperLinkEdit = ({ mobile = false }: { mobile?: boolean } = {}) => {
    const localeService = useDependency(LocaleService);
    const {
        doc,
        editing,
        handleCancel,
        handleConfirm,
        isLegal,
        label,
        link,
        setLabel,
        setLink,
        showError,
    } = useDocHyperLinkEdit();

    if (!doc) {
        return;
    }

    return (
        <HyperlinkEditor
            mobile={mobile}
            url={link}
            label={editing ? label : undefined}
            onUrlChange={setLink}
            onLabelChange={setLabel}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            labelError={showError && isBlankInput(label) ? localeService.t<LocaleKey>('docs-hyper-link-ui.edit.labelError') : undefined}
            urlError={showError && !isLegal ? localeService.t<LocaleKey>('docs-hyper-link-ui.edit.addressError') : undefined}
            labels={{
                label: localeService.t<LocaleKey>('docs-hyper-link-ui.edit.label'),
                address: localeService.t<LocaleKey>('docs-hyper-link-ui.edit.address'),
                cancel: localeService.t<LocaleKey>('docs-hyper-link-ui.edit.cancel'),
                confirm: localeService.t<LocaleKey>('docs-hyper-link-ui.edit.confirm'),
            }}
        />
    );
};

DocHyperLinkEdit.componentKey = 'docs-hyper-link-edit';
