/**
 * Logging tool
 */
export class Logger {
    static info(...value: unknown[]): void {
        if (console) {
            console.log(...value);
        }
    }

    static error(...value: unknown[]): void {
        if (console) {
            console.error(...value);
        }
    }

    static warn(...value: unknown[]): void {
        if (console) {
            console.warn(...value);
        }
    }

    static br(): void {
        Logger.info('\n');
    }

    static capsule(
        env: string,
        version: string,
        prefix: string = '',
        suffix = ''
    ): void {
        if (console) {
            console.log(
                `%c${prefix}%c${env}%c${version}%c${suffix}`,
                '',
                'padding:3px;color:white;background:#023047',
                'padding:3px;color:white;background:#219EBC',
                ''
            );
        }
    }
}
