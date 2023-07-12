/* eslint-disable max-lines-per-function */
import {
    TEST_ONLY_clearKnownIdentifiers,
    createIdentifier,
} from '../../src/DI/Decorators';
import {
    TEST_ONLY_clearSingletonDependencies,
    registerSingleton,
} from '../../src/DI/DependencySingletons';
import { Injector } from '../../src/DI/Injector';

describe('singleton', () => {
    beforeAll(() => {
        TEST_ONLY_clearSingletonDependencies();
        TEST_ONLY_clearKnownIdentifiers();
    });

    afterEach(() => {
        TEST_ONLY_clearSingletonDependencies();
        TEST_ONLY_clearKnownIdentifiers();
    });

    it('should just works', () => {
        interface A {
            key: string;
        }

        const aI = createIdentifier<A>('aI');

        registerSingleton(aI, { useValue: { key: 'a' } });

        const j = new Injector();

        expect(j.get(aI).key).toBe('a');
    });

    it('should throw error when register an identifier twice', () => {
        interface A {
            key: string;
        }

        const aI = createIdentifier<A>('aI');

        registerSingleton(aI, { useValue: { key: 'a' } });

        expect(() => {
            registerSingleton(aI, { useValue: { key: 'a2' } });
        }).toThrowError();
    });

    it('should warn user when singleton is fetched more than once', () => {
        interface A {
            key: string;
        }

        const aI = createIdentifier<A>('aI');

        registerSingleton(aI, { useValue: { key: 'a' } });

        const j = new Injector();

        expect(j.get(aI).key).toBe('a');

        const spy = jest.spyOn(console, 'warn');
        spy.mockImplementation(() => {});

        new Injector();

        expect(spy).toHaveBeenCalledWith(
            '[DI]: Singleton dependencies has been fetched before by an other injector. Please avoid fetching singleton dependencies twice.'
        );

        spy.mockRestore();
    });
});
