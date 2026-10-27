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

import type { IConfigService, IDisposable, LocaleService, ThemeService, UniverInstanceType } from '@univerjs/core';
import type { IUniverDrawingConfig } from '@univerjs/drawing';
import type { IRender } from '@univerjs/engine-render';
import { IPermissionService, IUniverInstanceService, LifecycleService, LifecycleStages, Univer } from '@univerjs/core';
import { IDrawingManagerService, UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverUIPlugin } from '@univerjs/ui';

export interface IOlePreviewViewerOptions {
    container: HTMLElement;
    data: object;
    type: UniverInstanceType;
    locale: LocaleService;
    theme: ThemeService;
    config: IConfigService;
    register: (univer: Univer) => void;
    onResize?: (render: IRender) => void;
    setReadonly: (permissions: IPermissionService, unitId: string) => void;
}

export type IOlePreviewContext = Omit<IOlePreviewViewerOptions, 'register' | 'onResize' | 'setReadonly'>;
export type IOlePreviewRenderer = (context: IOlePreviewContext) => IDisposable;

const previewRenderers = new Map<UniverInstanceType, IOlePreviewRenderer>();

/** Product UI modules register stateless factories without creating Units or retaining an application. */
export function registerOlePreviewRenderer(type: UniverInstanceType, renderer: IOlePreviewRenderer): void {
    previewRenderers.set(type, renderer);
}

export function getOlePreviewRenderer(type: UniverInstanceType): IOlePreviewRenderer | undefined {
    return previewRenderers.get(type);
}

/** An isolated temporary Univer instance. The host's Unit list, revision and collaboration remain untouched. */
export function createOlePreviewViewer(options: IOlePreviewViewerOptions): IDisposable {
    const viewer = new Univer({ darkMode: options.theme.darkMode, locale: options.locale.getCurrentLocale(), locales: { [options.locale.getCurrentLocale()]: options.locale.getLocales() ?? {} }, theme: options.theme.getCurrentTheme() });
    try {
        viewer.registerPlugin(UniverRenderEnginePlugin);
        viewer.registerPlugin(UniverUIPlugin, { container: options.container, portalContainer: options.container, header: false, toolbar: false, footer: false, contextMenu: false });
        const drawing = options.config.getConfig<IUniverDrawingConfig>('drawing.config');
        // The standalone viewer owns its providers; source collaboration overrides require services absent here.
        viewer.registerPlugin(UniverDrawingPlugin, { ...drawing, override: undefined, ole: { ...drawing?.ole, isCollaborative: () => false, convertToOnline: undefined } });
        options.register(viewer);
        const unit = viewer.createUnit(options.type, options.data);
        const injector = viewer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(unit.getUnitId());
        let disposed = false;
        let frame: number | undefined;
        // A dialog mounts its engine after the first layout. Resize after render modules subscribe.
        void injector.get(LifecycleService).onStage(LifecycleStages.Rendered).then(() => {
            if (!disposed) {
                options.setReadonly(injector.get(IPermissionService), unit.getUnitId());
                injector.get(IDrawingManagerService).setDrawingEditable(false);
                frame = requestAnimationFrame(() => injector.get(IRenderManagerService).getRenderUnitById(unit.getUnitId())?.engine.resize());
            }
        }).catch(() => undefined);
        const render = injector.get(IRenderManagerService).getRenderUnitById(unit.getUnitId());
        const resize = render?.engine.onTransformChange$.subscribeEvent(() => options.onResize?.(render));
        const permissions = injector.get(IPermissionService);
        options.setReadonly(permissions, unit.getUnitId());
        injector.get(IDrawingManagerService).setDrawingEditable(false);
        return { dispose: () => {
            disposed = true;
            if (frame != null) {
                cancelAnimationFrame(frame);
            }
            resize?.unsubscribe();
            viewer.dispose();
        } };
    } catch (error) {
        viewer.dispose();
        throw error;
    }
}
