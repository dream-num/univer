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

import type { ComponentProps, ComponentType } from 'react';
import { borderClassName, Button, clsx, FormLayout, Input } from '@univerjs/design';
import { useId } from 'react';

export interface IHyperlinkEditorProps {
    url: string;
    label?: string;
    urlError?: string;
    labelError?: string;
    labels: { address: string; label: string; cancel: string; confirm: string };
    onUrlChange: (url: string) => void;
    onLabelChange?: (label: string) => void;
    onCancel: () => void;
    onConfirm: () => void | Promise<unknown>;
    mobile?: boolean;
    className?: string;
    InputComponent?: ComponentType<ComponentProps<typeof Input>>;
    ButtonComponent?: ComponentType<ComponentProps<typeof Button>>;
}

export function HyperlinkEditor({ url, label, urlError, labelError, labels, onUrlChange, onLabelChange, onCancel, onConfirm, mobile, className, InputComponent = Input, ButtonComponent = Button }: IHyperlinkEditorProps) {
    const id = useId();
    const hasLabel = label !== undefined;
    return (
        <form
            className={clsx(`
              univer-box-border univer-bg-gray-0
              dark:!univer-bg-gray-900
            `, mobile
                ? 'univer-w-full univer-py-2'
                : ['univer-w-[328px] univer-rounded-xl univer-px-6 univer-py-5 univer-shadow', borderClassName], className)}
            onSubmit={async (event) => {
                event.preventDefault();
                if (url.trim()) {
                    await onConfirm();
                }
            }}
        >
            {hasLabel && (
                <FormLayout label={<label htmlFor={`${id}-label`}>{labels.label}</label>} error={labelError} errorId={`${id}-label-error`}>
                    <InputComponent
                        id={`${id}-label`}
                        aria-invalid={!!labelError || undefined}
                        aria-describedby={labelError ? `${id}-label-error` : undefined}
                        value={label}
                        onChange={onLabelChange}
                        autoFocus
                        size={mobile ? 'small' : undefined}
                    />
                </FormLayout>
            )}
            <FormLayout label={<label htmlFor={`${id}-url`}>{labels.address}</label>} error={urlError} errorId={`${id}-url-error`}>
                <InputComponent
                    id={`${id}-url`}
                    aria-invalid={!!urlError || undefined}
                    aria-describedby={urlError ? `${id}-url-error` : undefined}
                    value={url}
                    onChange={onUrlChange}
                    autoFocus={!hasLabel}
                    size={mobile ? 'small' : undefined}
                />
            </FormLayout>
            <div className={clsx('univer-flex univer-justify-end univer-gap-3', mobile && 'univer-mt-5')}>
                <ButtonComponent type="button" className={mobile ? 'univer-flex-1' : undefined} size={mobile ? 'middle' : undefined} onClick={onCancel}>{labels.cancel}</ButtonComponent>
                <ButtonComponent type="submit" variant="primary" className={mobile ? 'univer-flex-1' : undefined} size={mobile ? 'middle' : undefined} disabled={!url.trim()}>{labels.confirm}</ButtonComponent>
            </div>
        </form>
    );
}
