export enum PermissionStatus {
    INIT = 'init',
    FETCH = 'fetch',
    DONE = 'done',
}
export abstract class PermissionPoint<T = any> {
    abstract id: string; // permission
    abstract value: T;
    status = PermissionStatus.INIT;
}

export const getTypeFromPermissionItemList = (list: PermissionPoint[]) =>
    list.some((item) => item.status === PermissionStatus.INIT)
        ? PermissionStatus.INIT
        : list.some((item) => item.status === PermissionStatus.FETCH)
        ? PermissionStatus.FETCH
        : PermissionStatus.DONE;
