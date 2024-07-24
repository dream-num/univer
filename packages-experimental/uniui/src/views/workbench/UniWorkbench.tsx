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

import { debounce, IContextService, IUniverInstanceService, LocaleService, ThemeService, useDependency } from '@univerjs/core';
import { ConfigContext, ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';
import type { ILocale } from '@univerjs/design';
import {
    builtInGlobalComponents,
    BuiltInUIPart,
    ComponentContainer,
    ContextMenu,
    IMessageService,
    type IWorkbenchOptions,
    UNI_DISABLE_CHANGING_FOCUS_KEY,
    useComponentsOfPart,
    useObservable,
} from '@univerjs/ui';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import type {
    NodeTypes,
} from '@xyflow/react';
import {
    Background,
    NodeResizer,
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { IRenderManagerService } from '@univerjs/engine-render';
import { MenuSingle } from '@univerjs/icons';
import { IUnitGridService } from '../../services/unit-grid/unit-grid.service';
import { LeftSidebar, RightSidebar } from '../uni-sidebar/UniSidebar';
import { useUnitFocused, useUnitTitle } from '../hooks/title';
import { type FloatingToolbarRef, UniFloatingToolbar } from '../uni-toolbar/UniFloatToolbar';
import { UniControls } from '../uni-controls/UniControls';
import { UniToolbar } from '../uni-toolbar/UniToolbar';
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
    const unitGridService = useDependency(IUnitGridService);
    const instanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);

    const contentRef = useRef<HTMLDivElement>(null);
    const selectedNodeRef = useRef<HTMLElement | null>(null);
    const floatingToolbarRef = useRef<FloatingToolbarRef>(null);

    const footerComponents = useComponentsOfPart(BuiltInUIPart.FOOTER);
    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);

    const focusedUnit = useObservable(instanceService.focused$);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const resizeUnits = useCallback(debounce(() => {
        renderManagerService.getRenderAll().forEach(((renderer) => renderer.engine.resize()));
    }, 400), [renderManagerService]); // TODO: this is not

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

    const nodeTypes: NodeTypes = {
        customNode: UnitNode,
    };

    const unitGrid = useObservable(unitGridService.unitGrid$, undefined, true);
    const gridNodes = useMemo(() => unitGrid.map((item) => ({
        id: item.id,
        type: 'customNode',
        dragHandle: '.univer-uni-node-drag-handle',
        style: item.style,
        focusable: true,
        data: {
            unitId: item.data.unitId,
            gridService: unitGridService,
            instanceService,
            onFocus: focusUnit,
        },
        position: item.position,
    })), [unitGrid]);

    const [nodes, setNodes, onNodesChange] = useNodesState(gridNodes);
    useEffect(() => {
        setNodes(gridNodes);
    }, [gridNodes]);

    const onMove = useCallback(() => {
        floatingToolbarRef.current?.update();
    }, [floatingToolbarRef]);

    useEffect(() => {
        selectedNodeRef.current = document.querySelector(`[data-id="${focusedUnit}"]`);
    }, [focusedUnit, selectedNodeRef]);

    const disableReactFlowBehavior = !!focusedUnit;

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
                                maxZoom={2}
                                minZoom={0.5}
                                zoomOnDoubleClick={!disableReactFlowBehavior}
                                zoomOnPinch={!disableReactFlowBehavior}
                                zoomOnScroll={!disableReactFlowBehavior}
                                panOnDrag={!disableReactFlowBehavior}
                                panOnScroll={!disableReactFlowBehavior}
                                nodes={nodes}
                                nodeTypes={nodeTypes}
                                onNodesChange={(nodes) => {
                                    nodes.forEach((node) => {
                                        if (node.type === 'dimensions' && node.resizing) {
                                            unitGridService.changeDimension(node.id, { width: node.dimensions!.width, height: node.dimensions!.height });
                                        } else if (node.type === 'position') {
                                            unitGridService.changePosition(node.id, { x: node.position!.x, y: node.position!.y });
                                        }
                                    });

                                    onNodesChange(nodes);
                                }}
                                onResize={resizeUnits}
                                fitView
                                onPointerDown={(event) => {
                                    if (event.target instanceof HTMLElement
                                        && (
                                            event.target.classList.contains('univer-render-canvas')
                                            || event.target.classList.contains('react-flow__resize-control'))
                                    ) {
                                        return;
                                    }

                                    instanceService.focusUnit(null);
                                }}
                                onMove={onMove}
                            >
                                <Background bgColor="#f4f6f8" color="#d9d9d9"></Background>
                            </ReactFlow>

                            {/* Sheet cell editors etc. Their size would not be affected the scale of ReactFlow. */}
                            <ComponentContainer key="content" components={contentComponents} />
                        </section>
                    </div>
                    <div className={styles.floatLayer}>
                        {/* header */}
                        {header && (
                            <div className={styles.workbenchContainerHeader}>
                                <div className={styles.workbenchToolbarWrapper}>
                                    <UniToolbar />
                                    <ComponentContainer key="header" components={headerComponents} />
                                </div>
                            </div>
                        )}
                        <UniFloatingToolbar ref={floatingToolbarRef} node={nodes.find((n) => n.id === focusedUnit)?.data} anchorRef={selectedNodeRef} />

                        <LeftSidebar />
                        <RightSidebar />

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
    const { unitId } = data;
    const title = useUnitTitle(unitId);
    const focused = useUnitFocused(unitId);

    const instanceService = useDependency(IUniverInstanceService);
    const contextService = useDependency(IContextService);

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

    return (
        <div className={styles.uniNodeContainer} onPointerDownCapture={focus}>
            <NodeResizer isVisible={focused} minWidth={180} minHeight={100} />
            <UnitRenderer
                key={data.unitId}
                {...data}
            />

            <div className={styles.uniNodeDragHandle}>
                <MenuSingle />
            </div>

            <div className={styles.uniNodeTitle}>
                {title}
            </div>
        </div>

    );
}

export interface IUnitRendererProps {
    unitId: string;

    gridService: IUnitGridService;
    instanceService: IUniverInstanceService;
}

function UnitRenderer(props: IUnitRendererProps) {
    const { unitId, gridService } = props;
    const mountRef = useRef<HTMLDivElement>(null);

    const instanceService = useDependency(IUniverInstanceService);

    const focusedUnit = useObservable(instanceService.focused$);
    const focused = focusedUnit === unitId;

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
            onWheel={(event) => event.stopPropagation()}
        >
        </div>
    );
}

function FloatingContainer() {
    const { mountContainer } = useContext(ConfigContext);
    const floatingComponents = useComponentsOfPart(BuiltInUIPart.FLOATING);

    return createPortal(<ComponentContainer key="floating" components={floatingComponents} />, mountContainer!);
}
