import { createIdentifier } from '@wendellhu/redi';

/**
 * A service to provide context info of the host service.
 */
export interface IPlatformService {
    readonly isMac: boolean;
    readonly isWindows: boolean;
    readonly isLinux: boolean;
}

export const IPlatformService = createIdentifier<IPlatformService>('univer.platform-service');

export class DesktopPlatformService implements IPlatformService {
    get isMac(): boolean {
        return /Mac/.test(navigator.appVersion);
    }

    get isWindows(): boolean {
        return /Windows/.test(navigator.appVersion);
    }

    get isLinux(): boolean {
        return /Linux/.test(navigator.appVersion);
    }
}