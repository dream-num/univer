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
import { borderClassName, Button, clsx, FormLayout, Input } from '@univerjs/design';
import { KeyCode, useDependency } from '@univerjs/ui';
import { useDocHyperLinkEdit } from './hyper-link-edit/use-doc-hyper-link-edit';
import { isBlankInput } from './hyper-link-edit/utils';

export const DocHyperLinkEdit = () => {
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
            className={clsx(`
              univer-box-border univer-w-[328px] univer-rounded-xl univer-bg-gray-0 univer-px-6 univer-py-5
              univer-shadow
              dark:!univer-bg-gray-900
            `, borderClassName)}
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
                        autoFocus
                        onKeyDown={(event) => {
                            if (event.keyCode === KeyCode.ENTER) {
                                handleConfirm();
                            }
                        }}
                    />
                </FormLayout>
            </div>
            <div className="univer-flex univer-justify-end univer-gap-3">
                <Button onClick={handleCancel}>
                    {localeService.t<LocaleKey>('docs-hyper-link-ui.edit.cancel')}
                </Button>
                <Button
                    variant="primary"
                    disabled={isBlankInput(link)}
                    onClick={handleConfirm}
                >
                    {localeService.t<LocaleKey>('docs-hyper-link-ui.edit.confirm')}
                </Button>
            </div>
        </div>
    );
};

DocHyperLinkEdit.componentKey = 'docs-hyper-link-edit';
