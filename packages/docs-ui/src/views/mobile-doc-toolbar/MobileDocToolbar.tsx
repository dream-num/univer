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

import type { IMenuSchema, IValueOption, MobileDrawerSnap } from '@univerjs/ui';
import type { ReactNode } from 'react';
import type { MobileDocSelectionRenderService } from '../../services/mobile/doc-selection-render.service';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { clsx, resetButtonClassName } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    AlignTextBothIcon,
    CheckMarkIcon,
    CloseIcon,
    KeyboardIcon,
    MoreHorizontalIcon,
    MoreLeftIcon,
    QuickAddIcon,
    TextIcon,
    TextTypeIcon,
    WriteIcon,
} from '@univerjs/icons';
import {
    IMenuManagerService,
    IWorkbenchService,
    MobileDrawer,
    MobileMenu,
    RibbonInsertGroup,
    RibbonStartGroup,
    useDependency,
    useObservable,
} from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { map, startWith } from 'rxjs';
import {
    DOC_PARAGRAPH_T_ALIGN_MENU_ID,
    DOC_PARAGRAPH_T_EDIT_MENU_ID,
} from '../../menu/paragraph-menu';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

type MobileDocDrawer = 'insert' | 'format' | 'more';
type MobileDocQuickMenu = 'block' | 'align';

interface IMobileDocMenuNavigation {
    title?: string;
    onBack: () => void;
}

interface IMobileDocMenuSchemas {
    insert: IMenuSchema[];
    format: IMenuSchema[];
    more: IMenuSchema[];
}

interface IMobileDocToolbarButtonProps {
    active: boolean;
    label: string;
    icon: ReactNode;
    onClick: () => void;
}

const MOBILE_DOC_INSERT_GROUP = 'doc.mobile.insert';
const MOBILE_DOC_FORMAT_QUICK_GROUP = 'doc.mobile.format.quick';
const MOBILE_DOC_FORMAT_DETAIL_GROUP = 'doc.mobile.format.detail';
const MOBILE_DOC_MORE_GROUP = 'doc.mobile.more';

function getMobileDocFormatSchemas(schemas: IMenuSchema[]): IMenuSchema[] {
    const quickSchemas = schemas.filter((schema) => schema.gridLayout?.row === 2);
    const detailSchemas = schemas.filter((schema) => schema.gridLayout?.row !== 2);
    const mobileSchemas: IMenuSchema[] = [];

    if (quickSchemas.length) {
        mobileSchemas.push({
            key: MOBILE_DOC_FORMAT_QUICK_GROUP,
            order: 0,
            quickLayout: 'tile',
            quickLayoutVariant: 'compact',
            quickColumns: 4,
            children: quickSchemas,
        });
    }

    if (detailSchemas.length) {
        mobileSchemas.push({
            key: MOBILE_DOC_FORMAT_DETAIL_GROUP,
            order: 1,
            children: detailSchemas,
        });
    }

    return mobileSchemas;
}

export function getMobileDocMenuSchemas(menuManagerService: IMenuManagerService): IMobileDocMenuSchemas {
    const formatSchemas = menuManagerService.getMenuByPositionKey(RibbonStartGroup.FORMAT);
    const moreSchemas = [
        ...menuManagerService.getMenuByPositionKey(RibbonStartGroup.LAYOUT),
        ...menuManagerService.getMenuByPositionKey(RibbonStartGroup.OTHERS),
        ...menuManagerService.getMenuByPositionKey(RibbonInsertGroup.OTHERS),
    ];

    return {
        insert: [{
            key: MOBILE_DOC_INSERT_GROUP,
            order: 0,
            quickLayout: 'tile',
            quickColumns: 4,
            children: menuManagerService.getMenuByPositionKey(RibbonInsertGroup.MEDIA),
        }],
        format: getMobileDocFormatSchemas(formatSchemas),
        more: [{
            key: MOBILE_DOC_MORE_GROUP,
            order: 0,
            quickLayout: 'tile',
            quickColumns: 4,
            children: moreSchemas,
        }],
    };
}

export function getMobileDocMenuCommand(option: IValueOption): {
    commandId: string;
    params?: Record<string, unknown>;
} | null {
    const commandId = option.commandId ?? option.id;
    if (!commandId) {
        return null;
    }

    const fallbackParams = typeof option.params === 'function'
        ? option.params(option.value)
        : option.params;

    return {
        commandId,
        params: typeof option.value === 'undefined' ? fallbackParams : { value: option.value },
    };
}

function MobileDocToolbarButton(props: IMobileDocToolbarButtonProps) {
    return (
        <button
            type="button"
            aria-label={props.label}
            aria-pressed={props.active}
            className={clsx(resetButtonClassName, `
              univer-flex univer-h-10 univer-min-w-0 univer-flex-1 univer-items-center univer-justify-center
              univer-rounded-lg univer-text-xl univer-text-gray-700
              active:univer-scale-95 active:univer-bg-gray-100
              dark:!univer-text-gray-200
              dark:active:!univer-bg-gray-700
            `, props.active && `
              univer-bg-primary-50 univer-text-primary-600
              dark:!univer-bg-primary-900
            `)}
            onClick={props.onClick}
        >
            {props.icon}
        </button>
    );
}

function useMobileDocEditState() {
    const editorService = useDependency(IEditorService);
    const instanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const currentDoc = useObservable(
        () => instanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC),
        null,
        true,
        [instanceService]
    );
    const unitId = currentDoc?.getUnitId();
    const selectionService = unitId
        ? renderManagerService.getRenderUnitById(unitId)?.with(DocSelectionRenderService) as MobileDocSelectionRenderService | undefined
        : undefined;
    const isEditing = useObservable(
        selectionService?.mobileEditMode$,
        selectionService?.isMobileEditMode ?? false
    );
    return {
        isEditing,
        isReadOnly: unitId ? editorService.getEditor(unitId)?.isReadOnly() === true : true,
        selectionService,
    };
}

export function MobileDocEditDoneButton() {
    const localeService = useDependency(LocaleService);
    const { isEditing, isReadOnly, selectionService } = useMobileDocEditState();

    if (!isEditing || isReadOnly) {
        return null;
    }

    return (
        <button
            type="button"
            aria-label={localeService.t('docs-ui.mobile.done')}
            className={clsx(resetButtonClassName, `
              univer-flex univer-size-10 univer-items-center univer-justify-center univer-rounded-lg
              univer-text-primary-600
              active:univer-bg-primary-50
              dark:!univer-text-primary-400
              dark:active:!univer-bg-primary-900
            `)}
            onClick={() => selectionService?.exitMobileEditMode()}
        >
            <CheckMarkIcon className="univer-size-6" />
        </button>
    );
}

export function MobileDocToolbar() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const menuManagerService = useDependency(IMenuManagerService);
    const workbenchService = useDependency(IWorkbenchService);
    const rootUnitType = useObservable(workbenchService.rootUnitType$, null, true);
    const { isEditing, isReadOnly, selectionService } = useMobileDocEditState();
    const keyboardState = useObservable(
        selectionService?.mobileKeyboardState$,
        { visible: false, inset: 0 }
    );
    const keyboardVisible = keyboardState.visible;
    const [drawer, setDrawer] = useState<MobileDocDrawer | null>(null);
    const [quickMenu, setQuickMenu] = useState<MobileDocQuickMenu | null>(null);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('compact');
    const [navigation, setNavigation] = useState<IMobileDocMenuNavigation | null>(null);
    const menuSchemas = useObservable(
        () => menuManagerService.menuChanged$.pipe(
            startWith(undefined),
            map(() => getMobileDocMenuSchemas(menuManagerService))
        ),
        { insert: [], format: [], more: [] },
        false,
        [menuManagerService]
    );

    const closeDrawer = useCallback(() => {
        setDrawer(null);
        setDrawerSnap('compact');
        setNavigation(null);
    }, []);
    useEffect(() => {
        const subscription = selectionService?.onFocus$.subscribe(() => {
            closeDrawer();
            setQuickMenu(null);
        });
        return () => subscription?.unsubscribe();
    }, [selectionService, closeDrawer]);
    const drawerSchemas = useMemo(() => drawer ? menuSchemas[drawer] : [], [drawer, menuSchemas]);

    if (rootUnitType !== UniverInstanceType.UNIVER_DOC) {
        return null;
    }

    if (!isEditing) {
        if (isReadOnly) {
            return null;
        }

        return (
            <button
                type="button"
                aria-label={localeService.t('docs-ui.mobile.edit')}
                className={clsx(resetButtonClassName, `
                  univer-pointer-events-auto univer-absolute univer-bottom-4 univer-z-30 univer-flex univer-size-14
                  univer-items-center univer-justify-center univer-rounded-full univer-bg-primary-600 univer-text-2xl
                  univer-text-white univer-shadow-lg
                  active:univer-scale-95 active:univer-bg-primary-700
                  dark:!univer-bg-primary-500
                  dark:active:!univer-bg-primary-600
                `)}
                style={{
                    insetInlineEnd: '1rem',
                    marginBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
                onClick={() => {
                    closeDrawer();
                    setQuickMenu(null);
                    selectionService?.enterMobileEditMode();
                }}
            >
                <WriteIcon />
            </button>
        );
    }

    function executeMenuItem(option: IValueOption) {
        const command = getMobileDocMenuCommand(option);
        if (command) {
            commandService.executeCommand(command.commandId, command.params).catch(() => undefined);
        }
    }

    function openDrawer(nextDrawer: MobileDocDrawer) {
        if (drawer === nextDrawer) {
            closeDrawer();
            return;
        }

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setQuickMenu(null);
        setNavigation(null);
        setDrawerSnap('compact');
        setDrawer(nextDrawer);
    }

    function toggleQuickMenu(nextMenu: MobileDocQuickMenu) {
        closeDrawer();
        setQuickMenu((current) => current === nextMenu ? null : nextMenu);
    }

    function openKeyboard() {
        closeDrawer();
        setQuickMenu(null);
        selectionService?.enterMobileEditMode(true);
    }

    function hideKeyboard() {
        closeDrawer();
        setQuickMenu(null);
        selectionService?.suspendMobileEditingInput();
    }

    const drawerTitle = navigation?.title ?? localeService.t(
        drawer === 'insert'
            ? 'docs-ui.mobile.insert'
            : drawer === 'format'
                ? 'docs-ui.mobile.format'
                : 'docs-ui.mobile.more'
    );
    const quickMenuType = quickMenu === 'block'
        ? DOC_PARAGRAPH_T_EDIT_MENU_ID
        : DOC_PARAGRAPH_T_ALIGN_MENU_ID;

    return (
        <>
            {keyboardVisible && quickMenu && (
                <div
                    className="
                      univer-pointer-events-auto univer-absolute univer-inset-x-3 univer-z-30 univer-overflow-hidden
                    "
                    style={{ bottom: `${keyboardState.inset + 48}px` }}
                >
                    <MobileMenu
                        menuType={quickMenuType}
                        presentation="context-bar"
                        onOptionSelect={executeMenuItem}
                    />
                </div>
            )}

            {keyboardVisible && !drawer && (
                <div
                    className="
                      univer-pointer-events-auto univer-absolute univer-inset-x-0 univer-z-30 univer-box-border
                      univer-flex univer-h-12 univer-items-center univer-gap-0.5 univer-border-0 univer-border-t
                      univer-border-solid univer-border-gray-200 univer-bg-gray-0 univer-px-1
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                    "
                    style={{
                        bottom: `${keyboardState.inset}px`,
                        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    }}
                >
                    <MobileDocToolbarButton
                        active={false}
                        label={localeService.t('docs-ui.mobile.insert')}
                        icon={<QuickAddIcon />}
                        onClick={() => openDrawer('insert')}
                    />
                    <MobileDocToolbarButton
                        active={quickMenu === 'block'}
                        label={localeService.t('docs-ui.toolbar.heading.tooltip')}
                        icon={<TextTypeIcon />}
                        onClick={() => toggleQuickMenu('block')}
                    />
                    <MobileDocToolbarButton
                        active={false}
                        label={localeService.t('docs-ui.mobile.format')}
                        icon={<TextIcon />}
                        onClick={() => openDrawer('format')}
                    />
                    <MobileDocToolbarButton
                        active={quickMenu === 'align'}
                        label={localeService.t('docs-ui.paragraphMenu.alignAndIndent')}
                        icon={<AlignTextBothIcon />}
                        onClick={() => toggleQuickMenu('align')}
                    />
                    <MobileDocToolbarButton
                        active={false}
                        label={localeService.t('docs-ui.mobile.more')}
                        icon={<MoreHorizontalIcon />}
                        onClick={() => openDrawer('more')}
                    />
                    <MobileDocToolbarButton
                        active={false}
                        label={localeService.t('docs-ui.mobile.hideKeyboard')}
                        icon={<CloseIcon />}
                        onClick={hideKeyboard}
                    />
                </div>
            )}

            {drawer && (
                <MobileDrawer
                    componentName="mobile-doc-toolbar-drawer"
                    snap={drawerSnap}
                    expandLabel={localeService.t('docs-ui.mobile.expand')}
                    collapseLabel={localeService.t('docs-ui.mobile.collapse')}
                    onSnapChange={setDrawerSnap}
                    onClose={closeDrawer}
                    header={(
                        <div
                            className="
                              univer-grid univer-h-12 univer-flex-1 univer-grid-cols-[56px_minmax(0,1fr)_56px]
                              univer-items-center univer-px-2
                            "
                        >
                            <div>
                                {navigation && (
                                    <button
                                        type="button"
                                        aria-label={localeService.t('docs-ui.mobile.back')}
                                        className={clsx(resetButtonClassName, `
                                          univer-flex univer-size-12 univer-items-center univer-justify-center
                                          univer-rounded-lg univer-text-2xl univer-text-gray-700
                                          active:univer-bg-gray-100
                                          dark:!univer-text-gray-200
                                          dark:active:!univer-bg-gray-700
                                        `)}
                                        onClick={navigation.onBack}
                                    >
                                        <MoreLeftIcon />
                                    </button>
                                )}
                            </div>
                            <div
                                className="
                                  univer-truncate univer-text-center univer-text-base univer-font-semibold
                                  univer-text-gray-900
                                  dark:!univer-text-gray-100
                                "
                            >
                                {drawerTitle}
                            </div>
                            <button
                                type="button"
                                aria-label={localeService.t('docs-ui.mobile.close')}
                                className={clsx(resetButtonClassName, `
                                  univer-flex univer-size-12 univer-items-center univer-justify-center univer-rounded-lg
                                  univer-text-2xl univer-text-gray-700
                                  active:univer-bg-gray-100
                                  dark:!univer-text-gray-200
                                  dark:active:!univer-bg-gray-700
                                `)}
                                onClick={closeDrawer}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    )}
                    floatingActions={(
                        <button
                            type="button"
                            aria-label={localeService.t('docs-ui.mobile.keyboard')}
                            className={clsx(resetButtonClassName, `
                              univer-pointer-events-auto univer-flex univer-size-12 univer-items-center
                              univer-justify-center univer-rounded-full univer-bg-gray-0 univer-text-xl
                              univer-text-primary-600 univer-shadow-lg
                              active:univer-bg-gray-100
                              dark:!univer-bg-gray-800 dark:!univer-text-primary-400
                              dark:active:!univer-bg-gray-700
                            `)}
                            onClick={openKeyboard}
                        >
                            <KeyboardIcon />
                        </button>
                    )}
                >
                    <MobileMenu
                        schemas={drawerSchemas}
                        menuManagerService={menuManagerService}
                        showHeader={false}
                        onNavigationChange={setNavigation}
                        onOptionSelect={executeMenuItem}
                    />
                </MobileDrawer>
            )}
        </>
    );
}
