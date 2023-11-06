import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { INotificationService } from '../..';

export interface IBeforeCloseService {
    /**
     * Provide a callback to check if the web page could be closed safely.
     *
     * @param callback The callback to check if the web page could be closed safely.
     * It should return a string to show a message to the user. If the return value is undefined,
     * the web page could be closed safely.
     */
    registerBeforeClose(callback: () => string | undefined): IDisposable;
}

export const IBeforeCloseService = createIdentifier<IBeforeCloseService>('univer.ui.before-close-service');

export class DesktopBeforeCloseService implements IBeforeCloseService {
    private callbacks: Array<() => string | undefined> = [];

    constructor(@INotificationService private readonly _notificationService: INotificationService) {
        this._init();
    }

    registerBeforeClose(callback: () => string | undefined): IDisposable {
        this.callbacks.push(callback);
        return {
            dispose: () => {
                this.callbacks = this.callbacks.filter((cb) => cb !== callback);
            },
        };
    }

    private _init(): void {
        window.onbeforeunload = (event: BeforeUnloadEvent) => {
            const message = this.callbacks
                .map((callback) => callback())
                .filter((m) => !!m)
                .join('\n');

            if (message) {
                this._notificationService.show({
                    type: 'error',
                    title: 'Some changes are not saved',
                    content: message,
                });

                if (typeof event === 'undefined') {
                    event = window.event as BeforeUnloadEvent;
                }

                event.returnValue = message;
                return message;
            }
        };
    }
}
