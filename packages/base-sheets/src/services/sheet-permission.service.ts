import {
    createPermissionItem,
    Disposable,
    getTypeFromPermissionItemList,
    IPermissionService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    PermissionItem,
    SheetInterceptorService,
    toDisposable,
    UniverPermissionService,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';
import { combineLatestWith, map } from 'rxjs/operators';

import { SetRangeValuesCommand } from '../commands/commands/set-range-values.command';

@OnLifecycle(LifecycleStages.Ready, SheetPermissionService)
export class SheetPermissionService extends Disposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(UniverPermissionService) private _univerPermissionService: UniverPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
        this._init();
        this.interceptCommandPermission();
    }

    private _sheetEditableObservableMap = new Map<string, Observable<PermissionItem>>();
    private _sheetEditableSubjectMap = new Map<string, BehaviorSubject<PermissionItem>>();

    private _init() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        workbook.getSheets().forEach((worksheet) => {
            const getEditableFromJson = () => true;
            const editable = getEditableFromJson();
            const subComponentId = worksheet.getSheetId();
            const permissionItem = createPermissionItem(editable, unitId, subComponentId);
            const subject = new BehaviorSubject(permissionItem);
            // editable permissions require a combination of parent permissions
            const _editable$ = this._univerPermissionService.editable$.pipe(
                combineLatestWith(subject.asObservable()),
                map(([univerEditable, sheetEditable]) => {
                    const editable = univerEditable.value && sheetEditable.value;
                    const permissionItem = createPermissionItem(editable, unitId, subComponentId);
                    permissionItem.status = getTypeFromPermissionItemList([univerEditable, sheetEditable]);
                    return permissionItem;
                })
            );
            const key = getKey(unitId, subComponentId);
            this._sheetEditableObservableMap.set(key, _editable$);
            this._sheetEditableSubjectMap.set(key, subject);
            this._permissionService.addPermissionItem(permissionItem);
            this.disposeWithMe(
                this._permissionService.onPermissionChange(permissionItem.id, (params) => {
                    subject.next(params);
                })
            );
            this.disposeWithMe(
                toDisposable(() => {
                    subject.complete();
                    this._sheetEditableObservableMap.delete(key);
                    this._sheetEditableSubjectMap.delete(key);
                    this._permissionService.deletePermissionItem(permissionItem.id);
                })
            );
        });
    }

    private interceptCommandPermission() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommandPermission({
                check: (commandInfo) => {
                    const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                    const sheet = workbook?.getActiveSheet();
                    const workbookId = workbook?.getUnitId();
                    const sheetId = sheet?.getSheetId();
                    if (!workbookId || !sheetId) {
                        return;
                    }
                    switch (commandInfo.id) {
                        case SetRangeValuesCommand.id: {
                            return this.getSheetEditable(workbookId, sheetId);
                        }
                    }
                    return true;
                },
            })
        );
    }

    getEditable$ = (workbookId: string, sheetId: string): Observable<PermissionItem> | undefined =>
        this._sheetEditableObservableMap.get(getKey(workbookId, sheetId));

    getSheetEditable = (workbookId?: string, sheetId?: string) => {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _workbookId = workbookId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        return (
            this._univerPermissionService.getEditable() &&
            this._sheetEditableSubjectMap.get(getKey(_workbookId, _sheetId))?.getValue().value
        );
    };

    setEditable(v: boolean, workbookId?: string, sheetId?: string) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const _workbookId = workbookId || workbook.getUnitId();
        const sheet = workbook.getActiveSheet();
        const _sheetId = sheetId || sheet.getSheetId();
        const sheetSubject = this._sheetEditableSubjectMap.get(getKey(_workbookId, _sheetId));
        if (sheetSubject) {
            const currentValue = sheetSubject.getValue();
            if (v !== currentValue.value) {
                this._permissionService.updatePermissionItem(currentValue.id, v);
            }
        }
    }
}

function getKey(workbookId: string, sheetId: string) {
    return `${workbookId}-${sheetId}`;
}
