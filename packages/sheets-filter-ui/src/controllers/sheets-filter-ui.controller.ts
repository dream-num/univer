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

import type { IRange, Nullable } from '@univerjs/core';
import { CommandType, fromCallback, ICommandService, IContextService, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, ThemeService, toDisposable } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService, IShortcutService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { distinctUntilChanged, distinctUntilKeyChanged, filter, map, of, startWith, switchMap, takeUntil } from 'rxjs';
import type { RenderComponentType, SheetComponent, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FILTER_MUTATIONS, ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation, SheetsFilterService } from '@univerjs/sheets-filter';
import { ISelectionRenderService, SelectionShape, SHEET_VIEW_KEY, SheetCanvasPopManagerService, SheetRenderController, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { ISelectionStyle, ISheetCommandSharedParams } from '@univerjs/sheets';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterConditionsCommand, SetSheetsFilterCriteriaCommand, SmartToggleSheetsFilterCommand } from '../commands/sheets-filter.command';
import { FilterPanel } from '../views/components/SheetsFilterPanel';
import type { IOpenFilterPanelOperationParams } from '../commands/sheets-filter.operation';
import { ChangeFilterByOperation, CloseFilterPanelOperation, FILTER_PANEL_OPENED_KEY, OpenFilterPanelOnCurrentSelectionOperation, OpenFilterPanelOperation } from '../commands/sheets-filter.operation';
import { FilterButtonExtension } from '../views/extensions/filter-button.extension';
import { SheetsFilterPanelService } from '../services/sheets-filter-panel.service';
import { OpenFilterPanelOnCurrentSelectionShortcut, SmartToggleFilterShortcut } from './sheets-filter.shortcut';
import { ClearFilterConditionsMenuItemFactory, ReCalcFilterMenuItemFactory, SmartToggleFilterMenuItemFactory } from './sheets-filter.menu';

export const FILTER_PANEL_POPUP_KEY = 'FILTER_PANEL_POPUP';

const DEFAULT_Z_INDEX = 1000;

/**
 * This controller controls the UI of "filter" features. Menus, commands and filter panel etc. Except for the rendering.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetsFilterUIController)
export class SheetsFilterUIController extends RxDisposable {
    private _filterRangeShape: SelectionShape | null = null;
    private _buttonRenderDisposable: IDisposable | null = null;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SheetsFilterPanelService) private readonly _sheetsFilterPanelService: SheetsFilterPanelService,
        @Inject(SheetCanvasPopManagerService) private _sheetCanvasPopupService: SheetCanvasPopManagerService,
        @Inject(SheetRenderController) private _sheetRenderController: SheetRenderController,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();

        this._initCommands();
        this._initShortcuts();
        this._initMenuItems();
        this._initUI();
        this._initRenderer();
    }

    override dispose(): void {
        super.dispose();

        this._closeFilterPopup();
    }

    private _initShortcuts(): void {
        [
            SmartToggleFilterShortcut,
            OpenFilterPanelOnCurrentSelectionShortcut,
        ].forEach((shortcut) => this.disposeWithMe(this._shortcutService.registerShortcut(shortcut)));
    }

    private _initCommands(): void {
        [
            SmartToggleSheetsFilterCommand,
            SetSheetsFilterCriteriaCommand,
            ClearSheetsFilterCriteriaCommand,
            ReCalcSheetsFilterConditionsCommand,
            OpenFilterPanelOnCurrentSelectionOperation,
            ChangeFilterByOperation,
            OpenFilterPanelOperation,
            CloseFilterPanelOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });

        [
            SetSheetsFilterRangeMutation,
            SetSheetsFilterCriteriaMutation,
            RemoveSheetsFilterMutation,
            ReCalcSheetsFilterMutation,
        ].forEach((m) => this.disposeWithMe(this._sheetRenderController.registerSkeletonChangingMutations(m.id)));
    }

    private _initMenuItems(): void {
        ([
            SmartToggleFilterMenuItemFactory,
            ClearFilterConditionsMenuItemFactory,
            ReCalcFilterMenuItemFactory,
        ] as IMenuItemFactory[]).forEach((factory) => this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory))));
    }

    private _initUI(): void {
        this.disposeWithMe(this._componentManager.register(FILTER_PANEL_POPUP_KEY, FilterPanel));
        this.disposeWithMe(this._contextService.subscribeContextValue$(FILTER_PANEL_OPENED_KEY)
            .pipe(distinctUntilChanged())
            .subscribe((open) => {
                if (open) {
                    this._openFilterPopup();
                } else {
                    this._closeFilterPopup();
                }
            }));
    }

    private _popupDisposable?: Nullable<IDisposable>;
    private _openFilterPopup(): void {
        const currentFilterModel = this._sheetsFilterPanelService.filterModel;
        if (!currentFilterModel) {
            throw new Error('[SheetsFilterUIController]: no filter model when opening filter popup!');
        }

        const range = currentFilterModel.getRange();
        const col = this._sheetsFilterPanelService.col;
        const { startRow, startColumn } = range;
        this._popupDisposable = this._sheetCanvasPopupService.attachPopupToCell(startRow, startColumn + col, {
            componentKey: FILTER_PANEL_POPUP_KEY,
            onClickOutside: () => this._commandService.syncExecuteCommand(CloseFilterPanelOperation.id),
        });

        this._setupClosePanelListener();
    }

    private _closeFilterPopup(): void {
        this._popupDisposable?.dispose();
        this._popupDisposable = null;
    }

    /**
     * When some mutation happens, we may need to close the filter panel.
     */
    private _setupClosePanelListener(): IDisposable {
        // TODO@wzhudev: when the `col` changes, the filter panel should
        // TODO@wzhudev: implement these kind of listeners.
        return toDisposable(() => {});
    }

    private _initRenderer(): void {
        this._sheetSkeletonManagerService.currentSkeleton$
            .pipe(
                switchMap((skeletonParams) => {
                    if (!skeletonParams) {
                        return of(null);
                    }

                    const { unitId } = skeletonParams;
                    const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                    if (!workbook) {
                        return of(null);
                    }

                    const activeSheet = workbook.getActiveSheet();
                    const getParams = () => ({
                        unitId,
                        worksheetId: activeSheet.getSheetId(),
                        range: this._sheetsFilterService.getFilterModel(unitId, activeSheet.getSheetId())?.getRange(),
                        skeleton: skeletonParams.skeleton,
                    });

                    return fromCallback(this._commandService.onCommandExecuted)
                        .pipe(
                            filter(([command]) =>
                                command.type === CommandType.MUTATION
                                && (command.params as ISheetCommandSharedParams).unitId === workbook.getUnitId()
                                && FILTER_MUTATIONS.has(command.id)
                            ),
                            map(getParams),
                            startWith(getParams()) // must trigger once
                        );
                }),
                takeUntil(this.dispose$)
            )
            .subscribe((renderParams) => {
                this._disposeRendering();

                if (!renderParams || !renderParams.range) {
                    return;
                }

                this._renderRange(renderParams.unitId, renderParams.range, renderParams.skeleton);
            });

        this._sheetSkeletonManagerService.currentSkeleton$
            .pipe(
                map((skeletonParams) => {
                    if (!skeletonParams) return { unitId: '', worksheetId: '' };
                    return {
                        unitId: skeletonParams.unitId,
                        worksheetId: skeletonParams.sheetId,
                    };
                }),
                distinctUntilKeyChanged<{ unitId: string; worksheetId: string }>('unitId'),
                distinctUntilKeyChanged<{ unitId: string; worksheetId: string }>('worksheetId'),
                takeUntil(this.dispose$)
            )
            .subscribe((params) => {
                this._initButtonRenderer(params?.unitId, params?.worksheetId);
            });
    }

    private _renderRange(unitId: string, range: IRange, skeleton: SpreadsheetSkeleton): void {
        const renderer = this._renderManagerService.getRenderById(unitId);
        if (!renderer) {
            return;
        }

        // TODO@wzhudev: We should call the skeleton to rebuild, otherwise mutations would not change

        const { scene } = renderer;
        const { rangeWithCoord, style } = this._selectionRenderService.convertSelectionRangeToData({
            range,
            primary: null,
            style: null,
        });

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const filterRangeShape = this._filterRangeShape = new SelectionShape(scene, DEFAULT_Z_INDEX, true, this._themeService);
        filterRangeShape.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, {
            hasAutoFill: false,
            fill: 'rgba(0, 0, 0, 0.0)',
            ...style,
        } as ISelectionStyle);

        scene.makeDirty(true);
    }

    private _initButtonRenderer(unitId: string, worksheetId: string): void {
        this._buttonRenderDisposable?.dispose();
        this._buttonRenderDisposable = null;

        if (!unitId || !worksheetId) {
            return;
        }

        const sheetComponent = this._getSheetRenderComponent(unitId, SHEET_VIEW_KEY.MAIN) as SheetComponent;
        const extensionDisposable = sheetComponent.register(
            new FilterButtonExtension(() => this._sheetsFilterService.getFilterModel(unitId, worksheetId))
        );
        sheetComponent.makeDirty(true);

        this._buttonRenderDisposable = toDisposable(() => {
            extensionDisposable.dispose();
            sheetComponent.makeDirty(true);
        });
    }

    private _disposeRendering(): void {
        this._filterRangeShape?.dispose();
        this._filterRangeShape = null;
    }

    private _getSheetRenderComponent(unitId: string, viewKey: SHEET_VIEW_KEY): Nullable<RenderComponentType> {
        const render = this._renderManagerService.getRenderById(unitId);
        if (!render) {
            throw new Error('Render not found');
        }

        const { components } = render;
        const renderComponent = components.get(viewKey);
        if (!renderComponent) {
            throw new Error('Render component not found');
        }

        return renderComponent;
    }

    private _onFilterButtonClick(unitId: string, worksheetId: string, col: number): void {
        this._commandService.executeCommand(OpenFilterPanelOperation.id, {
            unitId,
            subUnitId: worksheetId,
            col,
        } as IOpenFilterPanelOperationParams);
    }
}
