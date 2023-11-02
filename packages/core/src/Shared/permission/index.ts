export enum PermissionStatus {
    INIT = 'init',
    FETCH = 'fetch',
    DONE = 'done',
}
export interface PermissionItemConfig<T> {
    value: T;
    id: string; // permissionId
    unitId: string; // look like workbookId
    subComponentId: string; // look like  sheetId/pageId
}

export class PermissionItem<T = any> {
    constructor(config: { id: string; value: T; type?: PermissionStatus }, unitId: string, subComponentId?: string) {
        this.id = config.id;
        this.value = config.value;
        this.status = config.type || PermissionStatus.INIT;
        this.unitId = unitId;
        this.subComponentId = subComponentId || 'doc';
    }
    id: string;
    value: T;
    status: PermissionStatus;
    unitId: string;
    subComponentId: string;

    clone() {
        return new PermissionItem(
            {
                id: this.id,
                value: this.value,
                type: this.status,
            },
            this.unitId,
            this.subComponentId
        );
    }

    toJson(): PermissionItemConfig<T> {
        return {
            id: this.id,
            value: this.value,
            unitId: this.unitId,
            subComponentId: this.subComponentId,
        };
    }
}
const PermissionIdLength = 15;

export const createPermissionId: () => string = () => generateRandomString(PermissionIdLength);

export const createPermissionItem = <T = any>(initValue: T, unitId: string = '', subComponentId: string = '') =>
    new PermissionItem({ id: createPermissionId(), value: initValue }, unitId, subComponentId);

export const getTypeFromPermissionItemList = (list: PermissionItem[]) =>
    list.some((item) => item.status === PermissionStatus.INIT)
        ? PermissionStatus.INIT
        : list.some((item) => item.status === PermissionStatus.FETCH)
        ? PermissionStatus.FETCH
        : PermissionStatus.DONE;

function generateRandomCharacter() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters.charAt(randomIndex);
}
function generateRandomString(length: number = 15) {
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += generateRandomCharacter();
    }
    return randomString;
}
