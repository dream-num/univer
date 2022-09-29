import { RectTree } from '../../src/Shared/RectTree/RectTree';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test RectTree insert', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    const node3 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 5,
        maxX: 5,
    });
    tree.insert(node1);
    tree.insert(node2);
    tree.insert(node3);
});

test('Test RectTree load', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    tree.load([node1, node2]);

    const find1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 50,
        maxX: 50,
    });

    const res1 = tree.search(find1);
    expect(res1.length).toEqual(2);
});

test('Test RectTree search', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    tree.insert(node1);
    tree.insert(node2);

    const find1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 5,
        maxX: 5,
    });
    const find2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 30,
        maxX: 30,
    });
    const find3 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 30,
        maxX: 30,
    });

    const res1 = tree.search(find1);
    const res2 = tree.search(find2);
    const res3 = tree.search(find3);

    expect(res1.length).toEqual(1);
    expect(res2.length).toEqual(1);
    expect(res3.length).toEqual(2);

    expect(res1[0]).toEqual(node1);
    expect(res2[0]).toEqual(node2);
    expect(res3[0]).toEqual(node1);
    expect(res3[1]).toEqual(node2);
});

test('Test RectTree clear', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    tree.load([node1, node2]);

    const find1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 50,
        maxX: 50,
    });
    const res1 = tree.search(find1);
    expect(res1.length).toEqual(2);

    tree.clear();

    const find2 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 50,
        maxX: 50,
    });
    const res2 = tree.search(find2);
    expect(res2.length).toEqual(0);
});

test('Test RectTree collides', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    tree.insert(node1);
    tree.insert(node2);

    const find1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 5,
        maxX: 5,
    });
    const find2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 30,
        maxX: 30,
    });
    const find3 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 30,
        maxX: 30,
    });
    const find4 = new RectTree.Node({
        minY: 100,
        minX: 100,
        maxY: 130,
        maxX: 130,
    });

    const res1 = tree.collides(find1);
    const res2 = tree.collides(find2);
    const res3 = tree.collides(find3);
    const res4 = tree.collides(find4);

    expect(res1).toEqual(true);
    expect(res2).toEqual(true);
    expect(res3).toEqual(true);
    expect(res4).toEqual(false);
});

test('Test RectTree first', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    tree.insert(node1);
    tree.insert(node2);

    const find1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 5,
        maxX: 5,
    });
    const res1 = tree.first(find1);
    expect(res1).toEqual(node1);
});

test('Test RectTree Remove', () => {
    const tree = new RectTree();
    const node1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 10,
        maxX: 10,
    });
    const node2 = new RectTree.Node({
        minY: 11,
        minX: 11,
        maxY: 20,
        maxX: 20,
    });
    tree.insert(node1);
    tree.insert(node2);

    const find1 = new RectTree.Node({
        minY: 0,
        minX: 0,
        maxY: 50,
        maxX: 50,
    });

    const res1 = tree.search(find1);
    expect(res1.length).toEqual(2);

    tree.remove(node1);

    const res2 = tree.search(find1);
    expect(res2.length).toEqual(1);
});
