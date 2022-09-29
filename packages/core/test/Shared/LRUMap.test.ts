import { LRUMap } from '../../src/Shared';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('LRU Test Key', () => {
    let c = new LRUMap(4, [
        ['adam', 29],
        ['john', 26],
        ['angela', 24],
        ['bob', 48],
    ]);
    let kit = c.keys();
    expect(kit.next().value).toEqual('adam');
    expect(kit.next().value).toEqual('john');
    expect(kit.next().value).toEqual('angela');
    expect(kit.next().value).toEqual('bob');
    expect(kit.next().done).toBeTruthy();
});

test('LRU Test Value', () => {
    let c = new LRUMap(4, [
        ['adam', 29],
        ['john', 26],
        ['angela', 24],
        ['bob', 48],
    ]);
    let kit = c.values();
    expect(kit.next().value).toEqual(29);
    expect(kit.next().value).toEqual(26);
    expect(kit.next().value).toEqual(24);
    expect(kit.next().value).toEqual(48);
    expect(kit.next().done).toBeTruthy();
});

test('LRU Test Clear', () => {
    let c = new LRUMap(4);
    c.set('adam', 29);
    c.set('john', 26);
    expect(c.size).toEqual(2);
    c.clear();
    expect(c.size).toEqual(0);
    expect(c.oldest).toEqual(undefined);
    expect(c.newest).toEqual(undefined);
});

test('LRU Test Delete', () => {
    let c = new LRUMap([
        ['adam', 29],
        ['john', 26],
        ['angela', 24],
        ['bob', 48],
    ]);
    expect(c.get('adam')).toEqual(29);
    c.delete('adam');
    expect(c.size).toEqual(3);
    expect(c.get('adam')).toEqual(undefined);
    c.delete('angela');
    expect(c.size).toEqual(2);
    c.delete('bob');
    expect(c.size).toEqual(1);
    c.delete('john');
    expect(c.size).toEqual(0);
    expect(c.get('john')).toEqual(undefined);
    expect(c.oldest).toEqual(undefined);
    expect(c.newest).toEqual(undefined);
});

test('LRU Test Set', () => {
    let c = new LRUMap(4);
    c.set('a', 1);
    c.set('a', 2);
    c.set('a', 3);
    c.set('a', 4);
    expect(c.size).toEqual(1);
    expect(c.newest).toEqual(c.oldest);
    expect(c.newest?.toJSON()).toEqual({ key: 'a', value: 4 });

    c.set('a', 5);
    expect(c.size).toEqual(1);
    expect(c.newest).toEqual(c.oldest);
    expect(c.newest?.toJSON()).toEqual({ key: 'a', value: 5 });

    c.set('b', 6);
    expect(c.size).toEqual(2);
    expect(c.newest !== c.oldest).toBeTruthy();

    expect(c.newest?.toJSON()).toEqual({ key: 'b', value: 6 });
    expect(c.oldest?.toJSON()).toEqual({ key: 'a', value: 5 });

    c.shift();
    expect(c.size).toEqual(1);
    c.shift();
    expect(c.size).toEqual(0);
});

test('LRU Set And Get', () => {
    let c = new LRUMap(4);
    expect(c.size).toEqual(0);
    expect(c.limit).toEqual(4);
    expect(c.oldest).toEqual(undefined);
    expect(c.newest).toEqual(undefined);

    c.set('adam', 29).set('john', 26).set('angela', 24).set('bob', 48);
    expect(c.toString()).toEqual('adam:29 < john:26 < angela:24 < bob:48');
    expect(c.size).toEqual(4);

    expect(c.get('adam')).toEqual(29);
    expect(c.get('john')).toEqual(26);
    expect(c.get('angela')).toEqual(24);
    expect(c.get('bob')).toEqual(48);
    expect(c.toString()).toEqual('adam:29 < john:26 < angela:24 < bob:48');

    expect(c.get('angela')).toEqual(24);
    expect(c.toString()).toEqual('adam:29 < john:26 < bob:48 < angela:24');

    c.set('ygwie', 81);
    expect(c.toString()).toEqual('john:26 < bob:48 < angela:24 < ygwie:81');
    expect(c.size).toEqual(4);
    expect(c.get('adam')).toEqual(undefined);

    c.set('john', 11);
    expect(c.toString()).toEqual('bob:48 < angela:24 < ygwie:81 < john:11');
    expect(c.get('john')).toEqual(11);

    let expectedKeys = ['bob', 'angela', 'ygwie', 'john'];
    c.forEach((v, k) => {
        //sys.sets(k+': '+v);
        expect(k).toEqual(expectedKeys.shift());
    });

    let currentSize = c.size;
    expect(c.delete('john') !== undefined).toBeTruthy();
    expect(currentSize - 1).toEqual(c.size);
});
