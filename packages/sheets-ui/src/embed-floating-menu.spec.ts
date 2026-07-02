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

import { UniverInstanceType } from '@univerjs/core';
import { MenuItemType } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { createSheetsFloatingMenuContributions, createSheetsFloatingToolbarItems, createVisibleSheetsFloatingToolbarItems, getStaticMenuSelections, resolveMenuCommandRequest, resolveSheetsFloatingMenuClassName, resolveSheetsFloatingMenuStage, resolveSheetsFloatingToolbarMenuItems } from './EmbedFloatingMenu';

describe('sheets embed floating menu', () => {
    it('registers the sheet block toolbar for every supported host entry', () => {
        const contributions = createSheetsFloatingMenuContributions();

        expect(contributions).toEqual([
            expect.objectContaining({
                hostType: UniverInstanceType.UNIVER_DOC,
                entry: 'docs-custom-block',
                childType: UniverInstanceType.UNIVER_SHEET,
            }),
            expect.objectContaining({
                hostType: UniverInstanceType.UNIVER_SHEET,
                entry: 'sheets-floating-object',
                childType: UniverInstanceType.UNIVER_SHEET,
            }),
            expect.objectContaining({
                hostType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'slides-floating-object',
                childType: UniverInstanceType.UNIVER_SHEET,
            }),
        ]);
    });

    it('shows the toolbar from host render activity when the host does not use the DOM stage controller', () => {
        expect(resolveSheetsFloatingMenuStage({
            embedId: 'embed-1',
            active: { hostUnitId: 'host-1', embedId: 'embed-1', childUnitId: 'child-1', stage: 'inactive' },
            fullscreen: false,
            usesDomFloatingStage: false,
            renderScopeActive: true,
        })).toBe('stage2');

        expect(resolveSheetsFloatingMenuStage({
            embedId: 'embed-1',
            active: { hostUnitId: 'host-1', embedId: 'embed-1', childUnitId: 'child-1', stage: 'stage2' },
            fullscreen: false,
            usesDomFloatingStage: true,
            renderScopeActive: false,
        })).toBe('stage2');
    });

    it('keeps the sheet floating toolbar visible in fullscreen sessions', () => {
        expect(resolveSheetsFloatingMenuStage({
            embedId: 'embed-1',
            active: null,
            fullscreen: true,
            usesDomFloatingStage: true,
            renderScopeActive: false,
        })).toBe('stage2');
    });

    it('centers the sheet floating toolbar for float hosts', () => {
        const floatingClassName = resolveSheetsFloatingMenuClassName({
            entry: 'sheets-floating-object',
            fullscreen: false,
            stage: 'stage2',
        });
        expect(floatingClassName).toContain('univer-left-1/2');
        expect(floatingClassName).toContain('-univer-translate-x-1/2');
        expect(floatingClassName).toContain('univer-pointer-events-auto');
        expect(floatingClassName).toContain('univer-top-[var(--univer-embed-floating-menu-top,-36px)]');

        const fullscreenClassName = resolveSheetsFloatingMenuClassName({
            entry: 'sheets-floating-object',
            fullscreen: true,
            stage: 'stage2',
        });
        expect(fullscreenClassName).toContain('univer-static');
        expect(fullscreenClassName).toContain('univer-mx-auto');
        expect(fullscreenClassName).not.toContain('-univer-translate-x-1/2');
    });

    it('uses the docs custom block inset and hides inactive sheet menus', () => {
        const className = resolveSheetsFloatingMenuClassName({
            entry: 'docs-custom-block',
            fullscreen: false,
            stage: 'inactive',
        });

        expect(className).toContain('univer-hidden');
        expect(className).toContain('univer-top-[calc(var(--univer-embed-docs-block-floating-menu-inset-top,52px)*-1)]');
    });

    it('keeps the standard sheet float toolbar order stable', () => {
        expect(createSheetsFloatingToolbarItems().map((item) => item.id)).toEqual([
            'formatPainter',
            'numberFormat',
            'divider-format',
            'fontFamily',
            'fontSize',
            'fontComposite',
            'divider-font',
            'textColor',
            'backgroundColor',
            'borderComposite',
            'divider-border',
            'merge',
            'wrap',
            'divider-layout',
            'filter',
        ]);
    });

    it('resolves optional toolbar items from the registered menu schema', () => {
        const resolved = resolveSheetsFloatingToolbarMenuItems([
            { key: 'sheet.command.set-once-format-painter', order: 1, item: { id: 'sheet.command.set-once-format-painter' } as never },
            { key: 'sheet.command.smart-toggle-filter', order: 2, item: { id: 'sheet.command.smart-toggle-filter' } as never },
        ]);

        expect(resolved.formatPainter?.id).toBe('sheet.command.set-once-format-painter');
        expect(resolved.filter?.id).toBe('sheet.command.smart-toggle-filter');
        expect(resolved.fontFamily).toBeUndefined();
    });

    it('resolves the composite toolbar capabilities from the registered sheet menu schema', () => {
        const resolved = resolveSheetsFloatingToolbarMenuItems([
            { key: 'sheet.command.set-range-bold', order: 1, item: { id: 'sheet.command.set-range-bold' } as never },
            { key: 'sheet.command.set-horizontal-text-align', order: 2, item: { id: 'sheet.command.set-horizontal-text-align' } as never },
            { key: 'sheet.command.set-vertical-text-align', order: 3, item: { id: 'sheet.command.set-vertical-text-align' } as never },
        ]);

        expect(resolved.fontComposite?.bold?.id).toBe('sheet.command.set-range-bold');
        expect(resolved.fontComposite?.horizontalAlign?.id).toBe('sheet.command.set-horizontal-text-align');
        expect(resolved.fontComposite?.verticalAlign?.id).toBe('sheet.command.set-vertical-text-align');
    });

    it('resolves merge submenu capabilities from the registered sheet menu schema', () => {
        const resolved = resolveSheetsFloatingToolbarMenuItems([
            { key: 'sheet.command.add-worksheet-merge', order: 1, item: { id: 'sheet.command.add-worksheet-merge' } as never },
            { key: 'sheet.command.add-worksheet-merge-all', order: 2, item: { id: 'sheet.command.add-worksheet-merge-all' } as never },
            { key: 'sheet.command.remove-worksheet-merge', order: 3, item: { id: 'sheet.command.remove-worksheet-merge' } as never },
        ]);

        expect(resolved.merge?.root?.id).toBe('sheet.command.add-worksheet-merge');
        expect(resolved.merge?.all?.id).toBe('sheet.command.add-worksheet-merge-all');
        expect(resolved.merge?.unmerge?.id).toBe('sheet.command.remove-worksheet-merge');
        expect(resolved.merge?.horizontal).toBeUndefined();
    });

    it('reads dropdown selections from selector menu items when they are provided by the registry', () => {
        const selections = getStaticMenuSelections({
            id: 'sheet.command.set-text-wrap',
            type: MenuItemType.SELECTOR,
            selections: [
                { label: 'sheets-ui.textWrap.overflow', value: 1 },
                { label: 'sheets-ui.textWrap.wrap', value: 2 },
            ],
        } as never);

        expect(selections.map((item) => item.value)).toEqual([1, 2]);
    });

    it('executes the command request declared by the registered menu item', () => {
        const request = resolveMenuCommandRequest({
            id: 'sheet.menu.font-family',
            commandId: 'sheet.command.from-registry',
            params: () => ({ value: 'Inter' }),
        } as never);

        expect(request).toEqual({
            commandId: 'sheet.command.from-registry',
            params: { value: 'Inter' },
        });
    });

    it('derives a visible toolbar without empty dividers when optional menu items are absent', () => {
        const resolved = resolveSheetsFloatingToolbarMenuItems([
            { key: 'sheet.command.set-once-format-painter', order: 1, item: { id: 'sheet.command.set-once-format-painter' } as never },
            { key: 'sheet.command.set-range-bold', order: 2, item: { id: 'sheet.command.set-range-bold' } as never },
            { key: 'sheet.command.smart-toggle-filter', order: 3, item: { id: 'sheet.command.smart-toggle-filter' } as never },
        ]);
        const visibleIds = createVisibleSheetsFloatingToolbarItems(resolved).map((item) => item.id);

        expect(visibleIds).toEqual([
            'formatPainter',
            'divider-format',
            'fontComposite',
            'divider-layout',
            'filter',
        ]);
        expect(visibleIds[0].startsWith('divider')).toBe(false);
        expect(visibleIds.at(-1)?.startsWith('divider')).toBe(false);
        expect(visibleIds.some((id, index) => id.startsWith('divider') && visibleIds[index + 1]?.startsWith('divider'))).toBe(false);
    });
});
