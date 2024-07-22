/**
 * Copyright 2023-present DreamNum Inc.
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

// Refer to packages/ui/src/views/App.tsx

import { IContextService, IUniverInstanceService, LocaleService, ThemeService, useDependency } from '@univerjs/core';
import { ConfigContext, ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';
import type { ILocale } from '@univerjs/design';
import {
    builtInGlobalComponents,
    BuiltInUIPart,
    ComponentContainer,
    ContextMenu,
    IMessageService,
    type IWorkbenchOptions,
    Sidebar,
    Toolbar,
    UNI_DISABLE_CHANGING_FOCUS_KEY,
    useComponentsOfPart,
    useObservable,
    ZenZone,
} from '@univerjs/ui';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import {
    Background,
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { UnitGridService } from '../../services/unit-grid/unit-grid.service';
import { UniControls } from './UniControls';
import styles from './workbench.module.less';

// Refer to packages/ui/src/views/workbench/Workbench.tsx

export interface IUniWorkbenchProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered: (contentEl: HTMLElement) => void;
}

export function UniWorkbench(props: IUniWorkbenchProps) {
    const {
        header = true,
        footer = true,
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const messageService = useDependency(IMessageService);
    const unitGridService = useDependency(UnitGridService);
    const instanceService = useDependency(IUniverInstanceService);

    const contentRef = useRef<HTMLDivElement>(null);

    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const headerMenuComponents = useComponentsOfPart(BuiltInUIPart.HEADER_MENU);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const leftSidebarComponents = useComponentsOfPart(BuiltInUIPart.LEFT_SIDEBAR);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);

    const unitGrid = useObservable(unitGridService.unitGrid$, undefined, true);

    const focusUnit = useCallback((unitId: string) => {
        instanceService.focusUnit(unitId);
        instanceService.setCurrentUnitForType(unitId);
    }, [instanceService]);

    useEffect(() => {
        if (!themeService.getCurrentTheme()) {
            themeService.setTheme(defaultTheme);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (contentRef.current) {
            onRendered?.(contentRef.current);
        }
    }, [onRendered]);

    const [locale, setLocale] = useState<ILocale>(localeService.getLocales() as unknown as ILocale);

    // Create a portal container for injecting global component themes.
    const portalContainer = useMemo<HTMLElement>(() => document.createElement('div'), []);

    useEffect(() => {
        document.body.appendChild(portalContainer);
        messageService.setContainer(portalContainer);

        const subscriptions = [
            localeService.localeChanged$.subscribe(() => {
                setLocale(localeService.getLocales() as unknown as ILocale);
            }),
            themeService.currentTheme$.subscribe((theme) => {
                themeInstance.setTheme(mountContainer, theme);
                portalContainer && themeInstance.setTheme(portalContainer, theme);
            }),
        ];

        return () => {
            // batch unsubscribe
            subscriptions.forEach((subscription) => subscription.unsubscribe());

            // cleanup
            document.body.removeChild(portalContainer);
        };
    }, [localeService, messageService, mountContainer, portalContainer, themeService.currentTheme$]);

    const nodeTypes = {
        customNode: UnitNode,
    };

    const initialNodes = unitGrid.map((unitId, index) => ({
        id: unitId,
        type: 'customNode',
        style: {
            width: '660px',
            height: '600px',
            display: 'flex',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
        },
        focusable: true,
        data: {
            unitId,
            gridService: unitGridService,
            instanceService,
            onFocus: focusUnit,
        },
        position: { x: index * 750, y: 0 },
    }));

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    return (
        <ConfigProvider locale={locale?.design} mountContainer={portalContainer}>
            {/**
              * IMPORTANT! This `tabIndex` should not be moved. This attribute allows the element to catch
              * all focusin event merged from its descendants. The DesktopLayoutService would listen to focusin events
              * bubbled to this element and refocus the input element.
              */}
            <ReactFlowProvider>
                <div className={styles.workbenchLayout} tabIndex={-1} onBlur={(e) => e.stopPropagation()}>

                    <div className={styles.flowLayer}>
                        <section
                            className={styles.workbenchContainerCanvasContainer}
                            ref={contentRef}
                            data-range-selector
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <ReactFlow
                                nodes={nodes}
                                nodeTypes={nodeTypes}
                                onNodesChange={onNodesChange}
                                fitView
                            >
                                <Background></Background>
                            </ReactFlow>
                            <ComponentContainer key="content" components={contentComponents} />
                        </section>
                    </div>
                    <div className={styles.floatLayer}>
                        {/* header */}
                        {header && (
                            <div className={styles.workbenchContainerHeader}>
                                <div className={styles.workbenchToolbarWrapper}>
                                    <Toolbar headerMenuComponents={headerMenuComponents} />
                                    <ComponentContainer key="header" components={headerComponents} />
                                </div>
                            </div>
                        )}

                        {/* content */}
                        <section className={styles.workbenchContainer}>
                            <div className={styles.workbenchContainerWrapper}>
                                <aside className={styles.workbenchContainerLeftSidebar}>
                                    <ComponentContainer key="left-sidebar" components={leftSidebarComponents} />
                                </aside>

                                <aside className={styles.workbenchContainerSidebar}>
                                    <Sidebar />
                                </aside>
                            </div>

                            <ZenZone />
                        </section>

                        {/* footer */}
                        {footer && (
                            <div className={styles.workbenchFooter}>
                                <ComponentContainer key="footer" components={footerComponents} />
                            </div>
                        )}
                        {/* uni mode controller buttons */}
                        <UniControls />
                    </div>
                </div>
                <ComponentContainer key="global" components={globalComponents} />
                <ComponentContainer key="built-in-global" components={builtInGlobalComponents} />
                {contextMenu && <ContextMenu />}
                <FloatingContainer />
            </ReactFlowProvider>
        </ConfigProvider>
    );
}

interface IUnitNodeProps {
    data: IUnitRendererProps;
}

function UnitNode({ data }: IUnitNodeProps) {
    return (
        <UnitRenderer
            key={data.unitId}
            {...data}
        />
    );
}

interface IUnitRendererProps {
    unitId: string;

    gridService: UnitGridService;
    instanceService: IUniverInstanceService;
}

function UnitRenderer(props: IUnitRendererProps) {
    const { unitId, gridService } = props;
    const mountRef = useRef<HTMLDivElement>(null);

    const instanceService = useDependency(IUniverInstanceService);
    const contextService = useDependency(IContextService);

    const focusedUnit = useObservable(instanceService.focused$);
    const focused = focusedUnit === unitId;
    const disableChangingUnitFocusing = useObservable(
        () => contextService.subscribeContextValue$(UNI_DISABLE_CHANGING_FOCUS_KEY),
        false,
        false,
        []
    );

    const focus = useCallback(() => {
        if (!disableChangingUnitFocusing && !focused) {
            instanceService.focusUnit(unitId);
        }
    }, [disableChangingUnitFocusing, focused, instanceService, unitId]);

    useEffect(() => {
        if (mountRef.current) {
            gridService.setContainerForRender(unitId, mountRef.current);
        }
    }, [gridService, unitId]);

    return (
        <div
            className={clsx(styles.workbenchContainerCanvas, {
                [styles.workbenchContainerCanvasFocused]: focused,
            })}
            ref={mountRef}
            // We bind these focusing events on capture phrase so the
            // other event handlers would have correct currently focused unit.
            onPointerUpCapture={focus}
            onWheelCapture={focus}
        >
        </div>
    );
}

function FloatingContainer() {
    const { mountContainer } = useContext(ConfigContext);
    const floatingComponents = useComponentsOfPart(BuiltInUIPart.FLOATING);

    return createPortal(<ComponentContainer key="floating" components={floatingComponents} />, mountContainer!);
}
