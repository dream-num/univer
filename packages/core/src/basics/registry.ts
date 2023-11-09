/**
 * Add extension modules statically when the plugin is initialized, so that the plugin can register these extension modules uniformly
 *
 * @privateRemarks
 * zh: 在插件初始化的时候静态添加扩展模块，方便插件统一注册这些扩展模块
 */
export class Registry {
    private _data: any[] = [];

    static create() {
        return new Registry();
    }

    add(dataInstance: any) {
        if (this._data.indexOf(dataInstance) > -1) {
            return;
        }
        this._data.push(dataInstance);
    }

    delete(dataInstance: any) {
        const index = this._data.indexOf(dataInstance);
        this._data.splice(index, 1);
    }

    getData() {
        return this._data;
    }
}

/**
 * Add extension modules statically when the plugin is initialized, so that the plugin can register these extension modules uniformly
 *
 * @privateRemarks
 * zh: 在插件初始化的时候静态添加扩展模块，方便插件统一注册这些扩展模块
 */
export class RegistryAsMap {
    private _data: Map<string, any> = new Map();

    static create() {
        return new RegistryAsMap();
    }

    add(id: string, dataInstance: any) {
        if (this._data.has(id)) {
            return;
        }
        this._data.set(id, dataInstance);
    }

    delete(id: string) {
        this._data.delete(id);
    }

    getData() {
        return this._data;
    }
}
