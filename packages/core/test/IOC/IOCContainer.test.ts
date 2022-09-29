import { Environment } from '../../src/Basics/Environment';
import {
    IOCAttribute,
    IOCContainer,
    Inject,
    PreDestroy,
    PostConstruct,
} from '../../src/IOC/IOCContainer';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test inject', () => {
    const container = new IOCContainer();
    container.addSingletonMapping('Environment', Environment);
    class Test1 {
        @Inject('Environment')
        environment1: Environment;

        @Inject({
            mapping: 'Environment',
        })
        environment2: Environment;
    }
    const text1 = new Test1();
    container.inject(text1);
    expect(text1.environment1).not.toBeUndefined();
    expect(text1.environment2).not.toBeUndefined();
});

test('Test getAttribute', () => {
    const attribute = new IOCAttribute({});
    const container = new IOCContainer(attribute);
    expect(container.getAttribute()).toEqual(attribute);
});

test('Test getInstance', () => {
    const container = new IOCContainer();
    container.addMapping('Environment', Environment);
    expect(container.getInstance('Environment')).not.toBeUndefined();
});

test('Test getSingleton', () => {
    const container = new IOCContainer();
    container.addSingletonMapping('Environment', Environment);
    const singleton1 = container.getSingleton('Environment');
    const singleton2 = container.getSingleton('Environment');
    expect(singleton1).toEqual(singleton2);
});

test('Test getBaseClassByInstance', () => {
    const container = new IOCContainer();
    container.addSingletonMapping('Environment', Environment);
    const singleton1 = container.getSingleton('Environment');
    expect(container.getBaseClassByInstance(singleton1)).toEqual('Environment');
});

test('Test removeMapping', () => {
    const container = new IOCContainer();
    class Mapping {
        @Inject('Environment')
        environment: Environment;
    }
    container.addSingletonMapping('Environment', Environment);
    container.addSingletonMapping('Mapping', Mapping);
    const singleton1 = container.getSingleton('Mapping');
    expect(singleton1).not.toBeUndefined();
    container.removeMapping('Mapping');
    const singleton2 = container.getSingleton('Mapping');
    expect(singleton2).toBeUndefined();
});

test('Test addMapping', () => {
    const container = new IOCContainer();
    container.addMapping('Environment', Environment);
    const singleton1 = container.getInstance('Environment');
    const singleton2 = container.getInstance('Environment');
    expect(singleton1).not.toBeUndefined();
    expect(singleton1).not.toBe(singleton2);
});

test('Test addSingletonMapping', () => {
    const container = new IOCContainer();
    container.addSingletonMapping('Environment', Environment);
    const singleton1 = container.getInstance('Environment');
    const singleton2 = container.getInstance('Environment');
    expect(singleton1).not.toBeUndefined();
    expect(singleton1).not.toBe(singleton2);
});

test('Test addClass', () => {
    const container = new IOCContainer();
    container.addClass(Environment);
    const singleton1 = container.getInstance('Environment');
    const singleton2 = container.getInstance('Environment');
    expect(singleton1).not.toBeUndefined();
    expect(singleton1).not.toBe(singleton2);
});

test('Test removeClass', () => {
    const container = new IOCContainer();
    container.addClass(Environment);
    const singleton1 = container.getInstance('Environment');
    expect(singleton1).not.toBeUndefined();
    container.removeClass(Environment);
    const singleton2 = container.getInstance('Environment');
    expect(singleton2).toBeUndefined();
});

test('Test addSingletonClass', () => {
    const container = new IOCContainer();
    container.addSingletonClass(Environment);
    const singleton1 = container.getInstance('Environment');
    const singleton2 = container.getInstance('Environment');
    expect(singleton1).not.toBeUndefined();
    expect(singleton1).not.toBe(singleton2);
});

test('Test Loop', () => {
    const container = new IOCContainer();
    class Test2 {
        @Inject('Test1')
        test: Object;
    }
    class Test1 {
        @Inject('Test2')
        test: Object;
    }
    container.addClass(Test1);
    container.addClass(Test2);
    try {
        container.getInstance('Test1');
    } catch (e) {
        expect(e).not.toBeUndefined();
    }
});

test('Test PostConstruct', () => {
    const drink = jest.fn();
    const container = new IOCContainer();
    class Test1 {
        @PostConstruct()
        init() {
            drink();
        }
    }
    container.addClass(Test1);
    container.getInstance('Test1');
    expect(drink).toHaveBeenCalled();
});

test('Test PreDestroy', () => {
    const drink = jest.fn();
    const container = new IOCContainer();
    class Test1 {
        @PreDestroy()
        des() {
            drink();
        }
    }
    container.addClass(Test1);
    container.getSingleton('Test1');
    container.removeClass(Test1);
    expect(drink).toHaveBeenCalled();
});
