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

import type { LocaleKey } from '../locale/types';
import { LocaleService } from '@univerjs/core';
import { Button, FormLayout, Input } from '@univerjs/design';
import { KeyCode, useDependency } from '@univerjs/ui';
import { useDocHyperLinkEdit } from './hyper-link-edit/use-doc-hyper-link-edit';
import { isBlankInput } from './hyper-link-edit/utils';

export function MobileDocHyperLinkEdit() {
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
        <div
            className="
              univer-box-border univer-w-full univer-bg-gray-0 univer-py-2
              dark:!univer-bg-gray-900
            "
        >
            <div>
                {editing
                    ? (
                        <FormLayout
                            label={localeService.t<LocaleKey>('docs-hyper-link-ui.edit.label')}
                            error={showError && isBlankInput(label) ? localeService.t<LocaleKey>('docs-hyper-link-ui.edit.labelError') : ''}
                        >
                            <Input
                                value={label}
                                onChange={setLabel}
                                autoFocus
                                onKeyDown={(event) => {
                                    if (event.keyCode === KeyCode.ENTER) {
                                        handleConfirm();
                                    }
                                }}
                            />
                        </FormLayout>
                    )
                    : null}
                <FormLayout
                    label={localeService.t<LocaleKey>('docs-hyper-link-ui.edit.address')}
                    error={showError && !isLegal ? localeService.t<LocaleKey>('docs-hyper-link-ui.edit.addressError') : ''}
                >
                    <Input
                        value={link}
                        onChange={setLink}
                        autoFocus={!editing}
                        onKeyDown={(event) => {
                            if (event.keyCode === KeyCode.ENTER) {
                                handleConfirm();
                            }
                        }}
                    />
                </FormLayout>
            </div>
            <div className="univer-mt-5 univer-flex univer-gap-3">
                <Button className="univer-h-12 univer-flex-1" onClick={handleCancel}>
                    {localeService.t<LocaleKey>('docs-hyper-link-ui.edit.cancel')}
                </Button>
                <Button
                    variant="primary"
                    className="univer-h-12 univer-flex-1"
                    disabled={isBlankInput(link)}
                    onClick={handleConfirm}
                >
                    {localeService.t<LocaleKey>('docs-hyper-link-ui.edit.confirm')}
                </Button>
            </div>
        </div>
    );
}

MobileDocHyperLinkEdit.componentKey = 'univer.doc.mobile-hyper-link-edit';
