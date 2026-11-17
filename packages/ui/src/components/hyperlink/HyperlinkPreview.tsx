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

import type { HTMLAttributes, ReactNode } from 'react';
import { borderClassName, Button, clsx, Tooltip } from '@univerjs/design';
import { CopyIcon, LinkIcon, UnlinkIcon, WriteIcon } from '@univerjs/icons';

export interface IHyperlinkPreviewProps extends Pick<HTMLAttributes<HTMLDivElement>, 'onPointerEnter' | 'onPointerLeave' | 'className'> {
    title: string;
    icon?: ReactNode;
    description?: string;
    invalid?: boolean;
    copyDisabled?: boolean;
    labels: { copy: string; edit: string; remove: string };
    onOpen: () => void | Promise<unknown>;
    onCopy: () => void | Promise<unknown>;
    onEdit?: () => void | Promise<unknown>;
    onRemove?: () => void | Promise<unknown>;
    onDismiss?: () => void;
}

export function HyperlinkPreview({ title, icon, description, invalid, copyDisabled, labels, onOpen, onCopy, onEdit, onRemove, onDismiss, className, ...attributes }: IHyperlinkPreviewProps) {
    const actionClassName = '!univer-flex univer-size-6 !univer-rounded !univer-border-0 !univer-p-0 !univer-text-base !univer-font-normal disabled:!univer-pointer-events-auto';
    return (
        <div
            {...attributes}
            className={clsx(`
              univer-box-border univer-grid univer-max-w-80 univer-grid-cols-[minmax(0,1fr)_auto] univer-items-center
              univer-gap-2 univer-overflow-hidden univer-rounded-lg univer-bg-gray-0 univer-p-3 univer-shadow
              dark:!univer-bg-gray-900
            `, borderClassName, className)}
            onClick={onDismiss}
        >
            <Button
                type="button"
                variant="link"
                disabled={invalid}
                aria-label={title}
                className={clsx(`
                  !univer-flex univer-h-6 univer-min-w-0 !univer-justify-start univer-gap-2 !univer-p-0 univer-text-sm
                  univer-font-normal
                `, invalid && `
                  univer-text-red-500
                  dark:!univer-text-red-400
                `)}
                onClick={onOpen}
            >
                <span
                    className="
                      univer-flex univer-size-5 univer-flex-none univer-items-center univer-justify-center
                      univer-text-base univer-text-gray-900
                      dark:!univer-text-gray-0
                    "
                >
                    {icon ?? <LinkIcon />}
                </span>
                <Tooltip showIfEllipsis title={title}><span className="univer-min-w-0 univer-flex-1 univer-truncate">{title}</span></Tooltip>
            </Button>
            <div className="univer-flex univer-h-6 univer-flex-none univer-items-center univer-gap-2">
                <Tooltip placement="bottom" title={labels.copy}>
                    <Button type="button" variant="text" size="small" className={actionClassName} aria-label={labels.copy} disabled={copyDisabled || invalid} onClick={onCopy}><CopyIcon /></Button>
                </Tooltip>
                {onEdit && <Tooltip placement="bottom" title={labels.edit}><Button type="button" variant="text" size="small" className={actionClassName} aria-label={labels.edit} onClick={onEdit}><WriteIcon /></Button></Tooltip>}
                {onRemove && <Tooltip placement="bottom" title={labels.remove}><Button type="button" variant="text" size="small" className={actionClassName} aria-label={labels.remove} onClick={onRemove}><UnlinkIcon /></Button></Tooltip>}
            </div>
            {description && (
                <div
                    className="
                      univer-col-span-2 univer-max-h-32 univer-overflow-y-auto univer-whitespace-pre-wrap
                      univer-break-words univer-text-sm univer-text-gray-500
                    "
                >
                    {description}
                </div>
            )}
        </div>
    );
}
