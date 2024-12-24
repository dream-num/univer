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

import type { ILocale } from '@univerjs/design';
import type {
    NodeTypes,
    ReactFlowInstance,
    Viewport,
} from '@xyflow/react';
import { debounce, ICommandService, IContextService, IUniverInstanceService, LocaleService, ThemeService, useDependency } from '@univerjs/core';
import { ConfigContext, ConfigProvider, defaultTheme, themeInstance } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { MenuSingle } from '@univerjs/icons';
import {
    builtInGlobalComponents,
    BuiltInUIPart,
    ComponentContainer,
    ContextMenu,
    type IWorkbenchOptions,
    UNI_DISABLE_CHANGING_FOCUS_KEY,
    useComponentsOfPart,
    useObservable,
} from '@univerjs/ui';
import {
    Background,
    NodeResizer,
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
} from '@xyflow/react';
import clsx from 'clsx';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import { UniFocusUnitOperation } from '../../commands/operations/uni-focus-unit.operation';
import { FlowManagerService } from '../../services/flow/flow-manager.service';
import { IUnitGridService } from '../../services/unit-grid/unit-grid.service';
import { useUnitFocused, useUnitTitle } from '../hooks/title';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, UniControlItem, UniControls } from '../uni-controls/UniControls';
import { LeftSidebar, RightSidebar } from '../uni-sidebar/UniSidebar';
import { type IFloatingToolbarRef, UniFloatingToolbar } from '../uni-toolbar/UniFloatToolbar';
import { UniToolbar } from '../uni-toolbar/UniToolbar';
import styles from './workbench.module.less';
import '@xyflow/react/dist/style.css';
// Refer to packages/ui/src/views/workbench/Workbench.tsx

export interface IUniWorkbenchProps extends IWorkbenchOptions {
    mountContainer: HTMLElement;

    onRendered: (contentEl: HTMLElement) => void;
}

export function UniWorkbench(props: IUniWorkbenchProps) {
    const {
        header = true,
        contextMenu = true,
        mountContainer,
        onRendered,
    } = props;

    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const unitGridService = useDependency(IUnitGridService);
    const instanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const flowManagerService = useDependency(FlowManagerService);
    const commandService = useDependency(ICommandService);

    const contentRef = useRef<HTMLDivElement>(null);
    const floatingToolbarRef = useRef<IFloatingToolbarRef>(null);
    const reactFlowInstance = useRef<HTMLDivElement | null>(null);

    const headerComponents = useComponentsOfPart(BuiltInUIPart.HEADER);
    const contentComponents = useComponentsOfPart(BuiltInUIPart.CONTENT);
    const globalComponents = useComponentsOfPart(BuiltInUIPart.GLOBAL);

    const focusedUnit = useObservable(instanceService.focused$);

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
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

    const onControlItemClick = useCallback((key: UniControlItem) => {
        switch (key) {
            case UniControlItem.AI: {
                commandService.executeCommand('project.controls-pro-search.operation');
                break;
            }
        }
    }, [commandService]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const resizeUnits = useCallback(debounce(() => {
        renderManagerService.getRenderAll().forEach((renderer) => renderer.engine.resize());
    }, 400), [renderManagerService]); // TODO: this is not

    // Create a portal container for injecting global component themes.
    const portalContainer = useMemo<HTMLElement>(() => document.createElement('div'), []);

    useEffect(() => {
        document.body.appendChild(portalContainer);

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
    }, [localeService, mountContainer, portalContainer, themeService.currentTheme$]);

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
        },
        position: item.position,
    })), [unitGrid]);

    const [nodes, setNodes, onNodesChange] = useNodesState(gridNodes);
    useEffect(() => {
        setNodes(gridNodes);
    }, [gridNodes]);

    const onMove = useCallback((event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
        floatingToolbarRef.current?.update();
        const { zoom } = viewport;
        setZoom(zoom);
        flowManagerService.setViewportChanged(viewport);
    }, [floatingToolbarRef, setZoom, flowManagerService]);

    const onFlowInit = useCallback((instance: ReactFlowInstance<any>) => {
        flowManagerService.setReactFlowInstance(instance);
    }, [flowManagerService]);

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
                                ref={reactFlowInstance}
                                maxZoom={MAX_ZOOM}
                                minZoom={MIN_ZOOM}
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
                                defaultViewport={{ zoom: MIN_ZOOM, x: 0, y: 0 }}
                                onPointerDown={(event) => {
                                    if (event.target instanceof HTMLElement
                                        && (
                                            event.target.classList.contains('univer-render-canvas')
                                            || event.target.classList.contains('react-flow__resize-control'))
                                    ) {
                                        return;
                                    }
                                    commandService.executeCommand(UniFocusUnitOperation.id, { unitId: null });
                                }}
                                onMove={onMove}
                                onInit={onFlowInit}
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
                        <UniFloatingToolbar ref={floatingToolbarRef} node={nodes.find((n) => n.id === focusedUnit)?.data} />

                        <LeftSidebar />
                        <RightSidebar />

                        {/* uni mode controller buttons */}
                        <UniControls zoom={zoom} onItemClick={onControlItemClick} />
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
    const unitComponents = useComponentsOfPart(BuiltInUIPart.UNIT);

    const contextService = useDependency(IContextService);
    const commandService = useDependency(ICommandService);

    const disableChangingUnitFocusing = useObservable(
        () => contextService.subscribeContextValue$(UNI_DISABLE_CHANGING_FOCUS_KEY),
        false,
        false,
        []
    );

    const focus = useCallback(() => {
        if (!disableChangingUnitFocusing && !focused) {
            commandService.executeCommand(UniFocusUnitOperation.id, { unitId });
        }
    }, [disableChangingUnitFocusing, focused, unitId, commandService]);

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
            <ComponentContainer key="unit" components={unitComponents} sharedProps={{ unitId }} />
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
