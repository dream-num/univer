/**
 * Add extension modules statically when the plugin is initialized, so that the plugin can register these extension modules uniformly
 *
 * @privateRemarks
 * zh: 在插件初始化的时候静态添加扩展模块，方便插件统一注册这些扩展模块
 */
export class Registry {
    private _data: any[] = [];

    add(dataInstance: any) {
        this._data.push(dataInstance);
    }

    delete(dataInstance: any) {
        const index = this._data.indexOf(dataInstance);
        this._data.splice(index, 1);
    }

    getData() {
        return this._data;
    }

    static create() {
        return new Registry();
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

    add(id: string, dataInstance: any) {
        this._data.set(id, dataInstance);
    }

    delete(id: string) {
        this._data.delete(id);
    }

    getData() {
        return this._data;
    }

    static create() {
        return new RegistryAsMap();
    }
}
