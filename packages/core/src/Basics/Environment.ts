/**
 * Operating environment, equipment, platform information
 */
export class Environment {
    os: string;

    app_version: string;

    device_id: string;

    platform: string;

    os_version: string;

    constructor() {
        this.os = '';
        this.app_version = '';
        this.platform = '';
        this.device_id = '';
        this.os_version = '';
    }
}
