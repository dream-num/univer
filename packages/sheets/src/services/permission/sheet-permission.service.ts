import {
    Disposable,
    getTypeFromPermissionItemList,
    INTERCEPTOR_POINT,
    IPermissionService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    PermissionService,
    SheetInterceptorService,
    toDisposable,
    UniverEditablePermissionPoint,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import { SetRangeValuesCommand } from '../../commands/commands/set-range-values.command';
import { SheetEditablePermission } from './permission-point';

@OnLifecycle(LifecycleStages.Ready, SheetPermissionService)
export class SheetPermissionService extends Disposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: PermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
        this._init();
        this._interceptCommandPermission();
    }

    private _init() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        workbook.getSheets().forEach((worksheet) => {
            const subComponentId = worksheet.getSheetId();
            const sheetPermission = new SheetEditablePermission(unitId, subComponentId);
            this._permissionService.addPermissionPoint(workbook.getUnitId(), sheetPermission);
        });
        this.disposeWithMe(
            toDisposable(
                workbook.sheetCreated$.subscribe((worksheet) => {
                    const subComponentId = worksheet.getSheetId();
                    const sheetPermission = new SheetEditablePermission(unitId, subComponentId);
                    this._permissionService.addPermissionPoint(workbook.getUnitId(), sheetPermission);
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                workbook.sheetDisposed$.subscribe((worksheet) => {
                    const subComponentId = worksheet.getSheetId();
                    const sheetPermission = new SheetEditablePermission(unitId, subComponentId);
                    this._permissionService.deletePermissionPoint(workbook.getUnitId(), sheetPermission.id);
                })
            )
        );
    }

    private _interceptCommandPermission() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.PERMISSION, {
                priority: 99,
                handler: (_value, commandInfo, next) => {
                    const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                    const sheet = workbook?.getActiveSheet();
                    const workbookId = workbook?.getUnitId();
                    const sheetId = sheet?.getSheetId();
                    if (!workbookId || !sheetId) {
                        return false;
                    }
                    switch (commandInfo.id) {
                        case SetRangeValuesCommand.id: {
                            return this.getSheetEditable(workbookId, sheetId);
                        }
                    }
                    return next();
                },
            })
        );
    }

    getEditable$(workbookId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _workbookId = workbookId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_workbookId, _sheetId);
        return this._permissionService
            .composePermission$(_workbookId, [UniverEditablePermissionPoint, sheetPermission.id])
            .pipe(
                map(([univerEditable, sheetEditable]) => {
                    const editable = univerEditable.value && sheetEditable.value;
                    const status = getTypeFromPermissionItemList([univerEditable, sheetEditable]);
                    return { value: editable, status };
                })
            );
    }

    getSheetEditable(workbookId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _workbookId = workbookId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_workbookId, _sheetId);
        return this._permissionService
            .composePermission(_workbookId, [UniverEditablePermissionPoint, sheetPermission.id])
            .every((item) => item.value);
    }

    setSheetEditable(v: boolean, workbookId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _workbookId = workbookId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetPermission = new SheetEditablePermission(_workbookId, _sheetId);
        this._permissionService.updatePermissionPoint(_workbookId, sheetPermission.id, v);
    }
}
