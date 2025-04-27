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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, ICommandService, Inject, Injector, IPermissionService, IUniverInstanceService } from '@univerjs/core';
import { convertTransformToOffsetX, convertTransformToOffsetY, IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { WorkbookEditablePermission, WorkbookPermissionService } from '@univerjs/sheets';
import { TableManager } from '@univerjs/sheets-table';
import { getSheetObject, SetScrollOperation, SetZoomRatioOperation, SheetScrollManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { BuiltInUIPart, connectInjector, IUIPartsService } from '@univerjs/ui';
import { BehaviorSubject, debounceTime, filter, merge } from 'rxjs';
import { SheetTableAnchor } from '../views/components/SheetTableAnchor';

export interface ITableAnchorPosition {
    x: number;
    y: number;
    tableId: string;
    tableName: string;
}

export class SheetTableAnchorController extends Disposable implements IRenderModule {
    private _anchorVisible$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _timer: NodeJS.Timeout;

    private _anchorPosition$: BehaviorSubject<ITableAnchorPosition[]> = new BehaviorSubject<ITableAnchorPosition[]>([]);
    public anchorPosition$ = this._anchorPosition$.asObservable();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @Inject(TableManager) private readonly _tableManager: TableManager,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService,
        @Inject(WorkbookPermissionService) private readonly _workbookPermissionService: WorkbookPermissionService,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService
    ) {
        super();
        this._initUI();
        this._initListener();
        this._initTableAnchor();
    }

    private _initUI() {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(SheetTableAnchor, this._injector))
        );
    }

    private _initListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (command.id === SetZoomRatioOperation.id || command.id === SetScrollOperation.id) {
                    this._anchorVisible$.next(false);

                    if (this._timer) {
                        clearTimeout(this._timer);
                    }

                    this._timer = setTimeout(() => {
                        this._anchorVisible$.next(true);
                    }, 300);
                }
            })
        );
    }

    private _initTableAnchor() {
        this.disposeWithMe(
            merge(
                this._context.unit.activeSheet$,
                this._sheetSkeletonManagerService.currentSkeleton$,
                this._scrollManagerService.validViewportScrollInfo$,
                this._tableManager.tableAdd$,
                this._tableManager.tableDelete$,
                this._tableManager.tableNameChanged$,
                this._tableManager.tableRangeChanged$,
                this._tableManager.tableThemeChanged$,
                this._workbookPermissionService.unitPermissionInitStateChange$.pipe(filter((v) => v)),
                this._permissionService.permissionPointUpdate$.pipe(debounceTime(300)),
                this._anchorVisible$
            ).subscribe(() => {
                const isVisible = this._anchorVisible$.getValue();
                if (!isVisible) {
                    this._anchorPosition$.next([]);
                    return;
                }
                const workbook = this._context.unit;
                const worksheet = workbook.getActiveSheet();
                const subUnitId = worksheet?.getSheetId();
                const tables = this._tableManager.getTableList(this._context.unitId).filter((table) => {
                    return table.subUnitId === subUnitId;
                });
                const renderUnit = this._renderManagerService.getRenderById(this._context.unitId);
                if (!renderUnit) {
                    this._anchorPosition$.next([]);
                    return;
                }

                const workbookEditPermission = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(workbook.getUnitId()).id)?.value;
                if (!workbookEditPermission) {
                    this._anchorPosition$.next([]);
                    return;
                }

                const tableInfos = tables.reduce((acc, table) => {
                    const { startRow, startColumn } = table.range;
                    const sheetSkeletonManagerService = renderUnit.with(SheetSkeletonManagerService);
                    const sheetObject = getSheetObject(this._univerInstanceService, this._renderManagerService);

                    if (!sheetObject) return acc;

                    const { scene } = sheetObject;
                    const viewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
                    if (!viewport) return acc;

                    const scaleX = scene?.scaleX;
                    const scaleY = scene?.scaleY;
                    const scrollXY = scene?.getViewportScrollXY(viewport);
                    if (!scaleX || !scene || !scaleY || !scrollXY) return acc;

                    const skeleton = sheetSkeletonManagerService.getCurrentSkeleton();
                    if (!skeleton) return acc;

                    const position = skeleton.getNoMergeCellWithCoordByIndex(startRow, startColumn);

                    const startX = convertTransformToOffsetX(position.startX, scaleX, scrollXY);
                    // 25 is the height of the anchor, 4 is the offset
                    const startY = convertTransformToOffsetY(position.startY, scaleY, scrollXY) - 25 - 4;

                    if (startY >= -10 && startX >= 45) {
                        acc.push({
                            x: startX,
                            y: startY,
                            tableId: table.id,
                            tableName: table.name,
                        });
                    }

                    return acc;
                }, [] as Array<ITableAnchorPosition>);

                this._anchorPosition$.next(tableInfos);
            })
        );
    }
}
