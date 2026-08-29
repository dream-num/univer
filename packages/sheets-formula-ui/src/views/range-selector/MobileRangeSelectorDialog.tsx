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

import type { MobileDrawerSnap } from '@univerjs/ui';
import type { ReactNode } from 'react';
import { ActionRow, Button } from '@univerjs/design';
import { MobileDrawer } from '@univerjs/ui';

interface IMobileRangeSelectorDialogProps {
    visible: boolean;
    snap: MobileDrawerSnap;
    title: string;
    cancelText: string;
    confirmText: string;
    children: ReactNode;
    onSnapChange: (snap: MobileDrawerSnap) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export function MobileRangeSelectorDialog(props: IMobileRangeSelectorDialogProps) {
    const {
        visible,
        snap,
        title,
        cancelText,
        confirmText,
        children,
        onSnapChange,
        onClose,
        onConfirm,
    } = props;

    if (!visible) {
        return null;
    }

    return (
        <div className="univer-pointer-events-none univer-visible univer-fixed univer-inset-0 univer-z-[1300]">
            <MobileDrawer
                componentName="mobile-range-selector-drawer"
                snap={snap}
                expandLabel={title}
                collapseLabel={title}
                onSnapChange={onSnapChange}
                onClose={onClose}
                role="dialog"
                ariaLabel={title}
                panelClassName="
                  univer-pointer-events-auto univer-bg-gray-0 univer-text-gray-900
                  dark:!univer-bg-gray-900 dark:!univer-text-gray-0
                "
                contentClassName="univer-min-h-0 univer-px-4"
                header={(
                    <header
                        className="
                          univer-flex univer-h-12 univer-flex-1 univer-items-center univer-px-4 univer-text-base
                          univer-font-semibold
                        "
                    >
                        {title}
                    </header>
                )}
                footer={(
                    <footer className="univer-box-border univer-shrink-0 univer-p-4">
                        <ActionRow>
                            <Button onClick={onClose}>{cancelText}</Button>
                            <Button variant="primary" onClick={onConfirm}>{confirmText}</Button>
                        </ActionRow>
                    </footer>
                )}
            >
                {children}
            </MobileDrawer>
        </div>
    );
}
