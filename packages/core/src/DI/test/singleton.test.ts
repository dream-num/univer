import { TEST_ONLY_clearKnownIdentifiers, createIdentifier } from '../Decorators';
import {
    TEST_ONLY_clearSingletonDependencies,
    registerSingleton,
} from '../DependencySingletons';
import { Injector } from '../Injector';

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
