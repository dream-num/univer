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

import type { ReactNode } from 'react';
import type { LocaleKey } from '../../../locale/types';
import type { MobileDrawerSnap } from '../mobile-drawer/MobileDrawer';
import type { IDialogPartMethodOptions } from './interface';
import { LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { CloseIcon } from '@univerjs/icons';
import { useMemo, useState } from 'react';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { isMobileDialogService } from '../../../services/dialog/mobile-dialog.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';
import { MobileDrawer } from '../mobile-drawer/MobileDrawer';

interface IMobileDialogOptions extends Omit<IDialogPartMethodOptions, 'children' | 'title' | 'footer'> {
    children?: ReactNode;
    title?: ReactNode;
    footer?: ReactNode;
}

function toMobileDialogOptions(options: IDialogPartMethodOptions): IMobileDialogOptions {
    const { children, title, footer, ...rest } = options;
    return {
        ...rest,
        children: children ? <CustomLabel {...children} /> : undefined,
        title: title ? <CustomLabel {...title} /> : undefined,
        footer: footer ? <CustomLabel {...footer} /> : undefined,
    };
}

export function MobileDialogPart() {
    const dialogService = useDependency(IDialogService);
    const localeService = useDependency(LocaleService);
    const dialogOptions = useObservable(dialogService.getDialogs$(), []);
    const overlaysSuspended = useObservable(
        isMobileDialogService(dialogService) ? dialogService.getOverlaysSuspended$() : null,
        false
    );
    const options = useMemo(() => {
        const activeDialogs = dialogOptions.filter((item) => item.open !== false);
        const active = activeDialogs[activeDialogs.length - 1];
        return active ? toMobileDialogOptions(active) : null;
    }, [dialogOptions]);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('expanded');

    if (!options) return null;

    const close = () => {
        dialogService.close(options.id);
        options.onClose?.();
        options.onOpenChange?.(false);
    };

    return (
        <div
            className={clsx(
                'univer-fixed univer-inset-0 univer-z-[1200]',
                overlaysSuspended && 'univer-pointer-events-none univer-invisible'
            )}
            data-u-comp="mobile-dialog"
            data-suspended={overlaysSuspended || undefined}
        >
            <button
                type="button"
                aria-label={localeService.t<LocaleKey>('ui.sidebar.close')}
                className="
                  univer-absolute univer-inset-0 univer-m-0 univer-appearance-none univer-rounded-none univer-border-0
                  univer-bg-black/35 univer-p-0
                "
                onClick={options.maskClosable === false ? undefined : close}
            />
            <MobileDrawer
                componentName="mobile-dialog-drawer"
                snap={drawerSnap}
                expandLabel={localeService.t<LocaleKey>('ui.sidebar.resize')}
                collapseLabel={localeService.t<LocaleKey>('ui.sidebar.resize')}
                onSnapChange={setDrawerSnap}
                onClose={close}
                role="dialog"
                panelClassName="
                  univer-bg-gray-0 univer-text-gray-900
                  dark:!univer-bg-gray-900 dark:!univer-text-gray-0
                  [&_[data-u-comp='mobile-actions']>button]:!univer-m-0
                  [&_[data-u-comp='mobile-actions']>button]:!univer-h-12
                  [&_[data-u-comp='mobile-actions']>button]:!univer-min-w-0
                  [&_[data-u-comp='mobile-actions']>button]:!univer-flex-1
                  [&_[data-u-comp='mobile-actions']>button]:!univer-rounded-xl
                  [&_[data-u-comp='mobile-actions']]:!univer-flex [&_[data-u-comp='mobile-actions']]:!univer-w-full
                  [&_[data-u-comp='mobile-actions']]:!univer-justify-stretch
                  [&_[data-u-comp='mobile-actions']]:!univer-gap-3
                "
                contentClassName="univer-min-h-0 univer-px-4 univer-pb-4"
                header={(
                    <header
                        className="
                          univer-flex univer-h-12 univer-flex-1 univer-items-center univer-justify-between univer-px-4
                        "
                    >
                        <div className="univer-min-w-0 univer-truncate univer-text-base univer-font-semibold">{options.title}</div>
                        {options.closable !== false && (
                            <button
                                type="button"
                                className="
                                  univer-flex univer-size-10 univer-shrink-0 univer-items-center univer-justify-center
                                  univer-rounded-full univer-border-0 univer-bg-transparent univer-text-xl
                                  univer-text-gray-600 univer-outline-none
                                  active:univer-bg-gray-100
                                  dark:!univer-text-gray-300
                                  dark:active:!univer-bg-gray-700
                                "
                                onClick={close}
                                aria-label={localeService.t<LocaleKey>('ui.sidebar.close')}
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </header>
                )}
                footer={options.footer
                    ? (
                        <footer
                            data-u-comp="mobile-actions"
                            className="
                              univer-shrink-0 univer-border-0 univer-border-t univer-border-solid univer-border-gray-200
                              univer-p-4
                              dark:!univer-border-gray-700
                            "
                        >
                            {options.footer}
                        </footer>
                    )
                    : undefined}
            >
                {options.children}
            </MobileDrawer>
        </div>
    );
}
