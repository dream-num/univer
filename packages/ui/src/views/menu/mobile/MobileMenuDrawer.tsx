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

import type { ComponentProps } from 'react';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import type { MobileDrawerSnap } from '../../components/mobile-drawer/MobileDrawer';
import { LocaleService } from '@univerjs/core';
import { clsx, ConfigContext, resetButtonClassName } from '@univerjs/design';
import { CloseIcon, MoreLeftIcon } from '@univerjs/icons';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';
import { MobileDrawer } from '../../components/mobile-drawer/MobileDrawer';
import { MobileMenu } from './MobileMenu';

interface IMobileMenuDrawerProps {
    visible: boolean;
    title?: string;
    menuType?: string;
    schemas?: IMenuSchema[];
    menuManagerService?: IMenuManagerService;
    onClose: () => void;
    onOptionSelect?: ComponentProps<typeof MobileMenu>['onOptionSelect'];
}

export function MobileMenuDrawer(props: IMobileMenuDrawerProps) {
    if (!props.visible) {
        return null;
    }

    return <MobileMenuDrawerContent {...props} />;
}

function MobileMenuDrawerContent(props: IMobileMenuDrawerProps) {
    const { title, menuType, schemas, menuManagerService, onClose, onOptionSelect } = props;
    const [navigation, setNavigation] = useState<{ title?: string; onBack: () => void } | null>(null);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('compact');
    const localeService = useDependency(LocaleService);
    const rootMenuManagerService = useDependency(IMenuManagerService);
    const direction = useObservable(localeService.direction$);
    const { mountContainer } = useContext(ConfigContext);

    if (!mountContainer) {
        return null;
    }

    return createPortal(
        <div dir={direction} className="univer-fixed univer-inset-0 univer-z-[1080] univer-flex univer-items-end">
            <button
                type="button"
                aria-label={localeService.t('ui.rangeSelector.cancel')}
                className={clsx(resetButtonClassName, `
                  !univer-absolute !univer-inset-0 !univer-m-0 !univer-block !univer-appearance-none
                  !univer-rounded-none !univer-border-0 !univer-bg-black/35 !univer-p-0 univer-backdrop-blur-[2px]
                `)}
                onClick={onClose}
            />
            <MobileDrawer
                componentName="mobile-menu-drawer"
                snap={drawerSnap}
                expandLabel={localeService.t('ui.ribbon.more')}
                collapseLabel={localeService.t('ui.ribbon.more')}
                onSnapChange={setDrawerSnap}
                onClose={onClose}
                role="dialog"
                ariaLabel={navigation?.title ?? title}
                contentClassName="univer-px-3 univer-pb-3"
                header={(
                    <div
                        className="
                          univer-grid univer-h-12 univer-flex-1 univer-grid-cols-[40px_minmax(0,1fr)_40px]
                          univer-items-center univer-gap-3 univer-px-4
                        "
                    >
                        {navigation
                            ? (
                                <button
                                    type="button"
                                    aria-label={localeService.t('ui.navigation.back')}
                                    className={clsx(resetButtonClassName, `
                                      univer-size-10 univer-rounded-xl univer-text-gray-700
                                      active:univer-bg-gray-200
                                      dark:!univer-text-gray-300
                                      dark:active:!univer-bg-gray-700
                                    `)}
                                    onClick={navigation.onBack}
                                >
                                    <MoreLeftIcon className="univer-size-5" />
                                </button>
                            )
                            : <span className="univer-size-10" aria-hidden="true" />}
                        <div
                            className="
                              univer-min-w-0 univer-truncate univer-text-center univer-text-base univer-font-semibold
                              univer-text-gray-900
                              dark:!univer-text-gray-100
                            "
                        >
                            {navigation?.title ?? title}
                        </div>
                        <button
                            type="button"
                            aria-label={localeService.t('ui.rangeSelector.cancel')}
                            className={clsx(resetButtonClassName, `
                              univer-size-10 univer-rounded-xl univer-text-gray-700
                              active:univer-bg-gray-200
                              dark:!univer-text-gray-300
                              dark:active:!univer-bg-gray-700
                            `)}
                            onClick={onClose}
                        >
                            <CloseIcon className="univer-size-5" />
                        </button>
                    </div>
                )}
            >
                <MobileMenu
                    menuType={menuType}
                    schemas={schemas}
                    menuManagerService={menuManagerService ?? rootMenuManagerService}
                    showHeader={false}
                    onNavigationChange={setNavigation}
                    onOptionSelect={onOptionSelect}
                />
            </MobileDrawer>
        </div>,
        mountContainer
    );
}
