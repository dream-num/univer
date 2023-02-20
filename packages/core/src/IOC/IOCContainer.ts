import 'reflect-metadata';

/**
 * IOC map class type
 */
export type IOCMapClass<T> = {
    new (...param: any): T;
};

function isFunction(value?: any): value is Function {
    return typeof value === 'function';
}
function isDefine<T>(value?: T): value is T {
    return value !== undefined && value !== null;
}
function unDefine(value?: any): value is undefined | null {
    return value === undefined || value === null;
}
function isObject(value?: any): value is Object {
    return typeof value === 'object';
}
function isString(value?: any): value is String {
    return typeof value === 'string';
}
function isAttribute(value?: any): value is IOCAttribute {
    return value instanceof IOCAttribute;
}

/**
 * Inject option
 */
export type InjectOption = InjectConfig | string;

/**
 * Register a Map of key value attributes
 */
export class AttributeMap {
    static sMap = new Map<object, string[]>();

    static register(target: object, name: string): void {
        let table = AttributeMap.sMap.get(target);
        if (table) {
            table.push(name);
        } else {
            table = new Array<string>();
            table.push(name);
            AttributeMap.sMap.set(target, table);
        }
    }

    static getTable(target: object): string[] {
        let result = new Array<string>();
        let parent = target;
        while (parent != null) {
            const table = AttributeMap.sMap.get(parent) ?? [];
            result = result.concat(table);
            parent = Object.getPrototypeOf(parent);
        }
        return result;
    }
}

/**
 * Get and set the attribute of the IOC
 */
export class IOCAttribute {
    private _config: AttributeConfig;

    private _value: any;

    constructor(config: AttributeConfig = {}) {
        this._config = config;
        this._value = config.value;
    }

    getValue<T>(): T {
        return this._value;
    }

    setValue(value: any) {
        this._value = value;
    }
}

/**
 * Register, get, inject instances
 */
export class IOCContainer {
    protected _circulate: CirculateData[];

    protected _mappings: Map<any, any>;

    protected _instance: Map<any, any>;

    protected _configure: Map<any, any>;

    protected _attribute: IOCAttribute;

    constructor(attribute: AttributeConfig | IOCAttribute = {}) {
        this._mappings = new Map<any, any>();
        this._instance = new Map<any, any>();
        this._configure = new Map<any, any>();
        this._attribute = isAttribute(attribute)
            ? attribute
            : new IOCAttribute(attribute);
        this._circulate = [];
    }

    static postDestroy<T>(target: T): void {
        if (target) {
            const prototype = Object.getPrototypeOf(target);
            const names = Object.getOwnPropertyNames(prototype);
            for (const name of names) {
                const preDestroy = Reflect.getMetadata(
                    'PreDestroy',
                    prototype,
                    name
                );
                if (isDefine(preDestroy)) {
                    const execute = prototype[name];
                    if (isFunction(execute)) {
                        execute.apply(target);
                    }
                }
            }
        }
    }

    static postConstruct<T>(target: T, argument: any[]): void {
        if (target) {
            const prototype = Object.getPrototypeOf(target);
            const propertyNames = Object.getOwnPropertyNames(prototype);
            for (const name of propertyNames) {
                const postConstruct = Reflect.getMetadata(
                    'PostConstruct',
                    prototype,
                    name
                );
                if (isDefine(postConstruct)) {
                    const execute = prototype[name];
                    if (isFunction(execute)) {
                        execute.apply(target, argument);
                    }
                }
            }
        }
    }

    inject(instance: object) {
        if (instance) {
            const collect: any = [[instance, []]];
            this._inject(instance, collect);
            this._clearCirculate();
            for (const item of collect.reverse()) {
                IOCContainer.postConstruct(item[0], item[1]);
            }
        }
    }

    getAttribute(): IOCAttribute {
        return this._attribute;
    }

    getInstance<T>(baseClass: any, ...argument: any): T {
        const collect: any = [];
        const instance = this._getInstance(
            baseClass,
            collect,
            IOCScope.prototype,
            argument
        );
        this._clearCirculate();
        for (const item of collect.reverse()) {
            IOCContainer.postConstruct(item[0], item[1]);
        }
        return instance;
    }

    getSingleton<T>(baseClass: any, ...argument: any): T {
        const collect: any = [];
        const instance = this._getInstance(
            baseClass,
            collect,
            IOCScope.singleton,
            argument
        );
        this._clearCirculate();
        for (const item of collect.reverse()) {
            IOCContainer.postConstruct(item[0], item[1]);
        }
        return instance;
    }

    getBaseClassByInstance(target: any): any {
        if (isObject(target)) {
            const { constructor } = target;
            const entries: IterableIterator<any> = this._mappings.entries();
            for (const [key, value] of entries) {
                if (constructor === value) {
                    return key;
                }
            }
        }
        return undefined;
    }

    removeMapping(baseClass: any): void {
        this._mappings.delete(baseClass);
        const target = this._instance.get(baseClass);
        const destroy = (instance: any) => {
            const keys = Object.keys(instance);
            for (const key of keys) {
                const property = instance[key];
                const findClass = this.getBaseClassByInstance(property);
                if (findClass) {
                    destroy(property);
                    IOCContainer.postDestroy(instance);
                }
            }
            IOCContainer.postDestroy(instance);
        };
        if (isDefine(target)) {
            destroy(target);
        }
        this._instance.delete(baseClass);
    }

    addMapping<T>(
        baseClass: any,
        implClass: IOCMapClass<T>,
        config: MappingConfig | void
    ): void {
        this._mappings.set(baseClass, implClass);
        if (isDefine(config)) {
            this._configure.set(baseClass, config);
        }
    }

    addSingletonMapping<T>(baseClass: any, implClass: IOCMapClass<T>) {
        return this.addMapping(baseClass, implClass, {
            scope: IOCScope.singleton,
        });
    }

    addClass<T>(implClass: IOCMapClass<T>, config: MappingConfig | void): void {
        this.addMapping(implClass.name, implClass, config);
    }

    removeClass<T>(implClass: IOCMapClass<T>): void {
        this.removeMapping(implClass.name);
    }

    addSingletonClass<T>(implClass: IOCMapClass<T>): void {
        this.addSingletonMapping(implClass.name, implClass);
    }

    private _inject<T>(target: T, collect: any[]): void {
        const prototype = Object.getPrototypeOf(target);
        const table = AttributeMap.getTable(prototype);
        for (const key of table) {
            const container = Reflect.getMetadata('Container', prototype, key);
            const injecting = Reflect.getMetadata('Inject', prototype, key);
            const attribute = Reflect.getMetadata('Attribute', prototype, key);
            const attributeValue = Reflect.getMetadata(
                'AttributeValue',
                prototype,
                key
            );
            switch (typeof injecting) {
                case 'string': {
                    const value = target;
                    value[key] = this._getInstance(
                        injecting,
                        collect,
                        IOCScope.nothing,
                        []
                    );
                    break;
                }
                case 'object': {
                    const config = injecting as InjectConfig;
                    const { mapping } = config;
                    const { scope } = config;
                    const { argument } = config;
                    const value = target;
                    value[key] = this._getInstance(
                        mapping,
                        collect,
                        scope as IOCScope,
                        argument as []
                    );
                }
            }
            if (container) {
                const value = target;
                value[key] = this;
            }
            if (attribute) {
                const value = target;
                value[key] = this._attribute;
            }
            if (attributeValue) {
                const value = target;
                value[key] = this._attribute.getValue();
            }
        }
    }

    private _getInstance<T>(
        baseClass: any,
        collect: any[],
        scope: IOCScope,
        argument: any[]
    ) {
        const ImplClass: IOCMapClass<T> = this._mappings.get(baseClass);
        if (ImplClass) {
            if (scope === IOCScope.nothing) {
                const configure = this._configure.get(baseClass);
                if (configure) {
                    scope = configure.scope;
                } else {
                    scope = IOCScope.prototype;
                }
            }
            switch (scope) {
                case IOCScope.singleton: {
                    const target = this._instance.get(baseClass);
                    if (isDefine(target)) {
                        return target;
                    }
                    const create: T = isDefine(argument)
                        ? new ImplClass(...argument)
                        : new ImplClass();
                    this._instance.set(baseClass, create);
                    this._addCirculate(baseClass, scope);
                    this._inject(create, collect);
                    this._popCirculate();
                    collect.push([create, argument]);
                    return create;
                }
                case IOCScope.prototype: {
                    const target: T = isDefine(argument)
                        ? new ImplClass(...argument)
                        : new ImplClass();
                    this._addCirculate(baseClass, scope);
                    this._inject(target, collect);
                    this._popCirculate();
                    collect.push([target, argument]);
                    return target;
                }
            }
        }
    }

    private _printCirculate(): string {
        let message =
            'The dependencies of some of the instance in the application context form a cycle：';
        message += '\n';
        this._circulate.reverse().forEach((element) => {
            const { baseClass } = element;
            const ImplClass: IOCMapClass<any> = this._mappings.get(baseClass);
            const { name } = ImplClass;
            message += '\n';
            message += `Class: ${name} Field: ${baseClass}`;
        });
        return message;
    }

    private _clearCirculate(): void {
        this._circulate = [];
    }

    private _addCirculate(baseClass: any, scope: IOCScope): void {
        this._circulate.forEach((element) => {
            if (element.baseClass === baseClass) {
                if (element.scope === scope) {
                    if (scope === IOCScope.prototype) {
                        this._circulate.push({
                            baseClass,
                            scope,
                        });
                        throw new Error(this._printCirculate());
                    }
                }
            }
        });
        this._circulate.push({
            baseClass,
            scope,
        });
    }

    private _popCirculate(): void {
        this._circulate.pop();
    }
}

/**
 * Scopes of IOC
 */
export enum IOCScope {
    singleton,
    prototype,
    nothing,
}

/**
 * Attribute config
 */
export type AttributeConfig = {
    value?: any;
};

/**
 * Inject config
 */
export type InjectConfig = {
    mapping: any;
    scope?: IOCScope;
    argument?: any[];
};

/**
 * Mapping config
 */
export type MappingConfig = {
    scope: IOCScope;
};

/**
 * Circulate Data
 */
export type CirculateData = {
    baseClass: any;
    scope: IOCScope;
};

/**
 * Execute function on Creation
 */
export function PostConstruct() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        AttributeMap.register(target, propertyKey);
        Reflect.defineMetadata('PostConstruct', descriptor, target, propertyKey);
    };
}

/**
 * Execute function on unload
 */
export function PreDestroy() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        AttributeMap.register(target, propertyKey);
        Reflect.defineMetadata('PreDestroy', descriptor, target, propertyKey);
    };
}

/**
 * Dependency injection
 */
export function Inject(option: InjectOption) {
    return (target: any, propertyKey: string) => {
        AttributeMap.register(target, propertyKey);
        if (isString(option)) {
            Reflect.defineMetadata('Inject', option, target, propertyKey);
            return;
        }
        if (isDefine(option)) {
            if (unDefine(option.argument)) {
                option.argument = [];
            }
            if (unDefine(option.scope)) {
                option.scope = IOCScope.prototype;
            }
            Reflect.defineMetadata('Inject', option, target, propertyKey);
        }
    };
}

/**
 * Dependency injection as attribute
 */
export function Attribute() {
    return (target: any, propertyKey: string) => {
        AttributeMap.register(target, propertyKey);
        Reflect.defineMetadata('Attribute', {}, target, propertyKey);
    };
}

/**
 * Dependency injection as container
 */
export function Container() {
    return (target: any, propertyKey: string) => {
        AttributeMap.register(target, propertyKey);
        Reflect.defineMetadata('Container', {}, target, propertyKey);
    };
}

/**
 * Dependency injection as attribute value
 */
export function AttributeValue() {
    return (target: any, propertyKey: string) => {
        AttributeMap.register(target, propertyKey);
        Reflect.defineMetadata('AttributeValue', {}, target, propertyKey);
    };
}
