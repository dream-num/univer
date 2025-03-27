/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class Registry<T = any> {
    private _data: T[] = [];

    static create<T = any>() {
        return new Registry<T>();
    }

    add(dataInstance: T) {
        if (this._data.indexOf(dataInstance) > -1) {
            return;
        }
        this._data.push(dataInstance);
    }

    delete(dataInstance: T) {
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
