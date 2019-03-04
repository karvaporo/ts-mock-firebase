import { QuerySnapshot } from '@firebase/firestore-types';
import { MockFirebaseApp } from 'firebaseApp';
import { MockDatabase } from 'firestore';

describe('Transaction handling', () => {
  const database: MockDatabase = {
    a: {
      docs: {
        first: {
          data: {
            value: 2,
          },
        },
      },
    },
    b: {
      docs: {
        A: {
          data: {
            text: 'A',
          },
        },
        B: {
          data: {
            text: 'B',
          },
        },
      },
    },
  };

  it('will update operations atomically', async () => {
    expect(true).toBeTruthy();

    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    let ref2Snap;
    let ref2CollectionSnap: QuerySnapshot | undefined;

    const onRef2DocumentSnapshot = jest.fn(snapshot => {
      ref2Snap = snapshot;
    });
    const onRef2CollectionSnapshot = jest.fn(snapshot => {
      ref2CollectionSnap = snapshot;
    });

    firestore.doc('b/A').onSnapshot(onRef2DocumentSnapshot);
    firestore.collection('b').onSnapshot(onRef2CollectionSnapshot);

    await firestore.runTransaction(async transaction => {
      const ref = firestore.doc('a/first');
      const ref2 = firestore.doc('b/A');

      transaction.update(ref, { test: 'modified' });
      transaction.update(ref2, { text: 'altered' });
      transaction.update(ref2, { value: 3 });
    });

    expect(ref2CollectionSnap).toBeDefined();
    const docChanges = ref2CollectionSnap!.docChanges();
    expect(docChanges.length).toBe(1);
    expect(docChanges[0].type).toMatch('modified');
    expect(ref2Snap).toBeDefined();
    expect(onRef2DocumentSnapshot.mock.calls.length).toBe(1);
  });

  it('will add and update operations atomically', async () => {
    expect(true).toBeTruthy();

    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    let ref2Snap;
    let ref2CollectionSnap: QuerySnapshot | undefined;

    const onRef2DocumentSnapshot = jest.fn(snapshot => {
      ref2Snap = snapshot;
    });
    const onRef2CollectionSnapshot = jest.fn(snapshot => {
      ref2CollectionSnap = snapshot;
    });

    firestore.doc('b/A').onSnapshot(onRef2DocumentSnapshot);
    firestore.collection('b').onSnapshot(onRef2CollectionSnapshot);

    await firestore.runTransaction(async transaction => {
      const ref = firestore.doc('a/first');
      const ref2 = firestore.doc('b/A');
      const ref3 = firestore.doc('b/C');

      transaction.update(ref, { test: 'modified' });
      transaction.set(ref2, { modified: 'field' }, { merge: true });
      transaction.set(ref3, {
        text: 'added',
        value: 3,
      });
    });

    expect(ref2CollectionSnap).toBeDefined();
    const docChanges = ref2CollectionSnap!.docChanges();
    expect(docChanges.length).toBe(2);
    expect(docChanges[0].type).toMatch('modified');
    expect(docChanges[1].type).toMatch('added');
    expect(ref2Snap).toBeDefined();
    expect(onRef2DocumentSnapshot.mock.calls.length).toBe(1);
  });

  it('will add, update and delete operations atomically', async () => {
    expect(true).toBeTruthy();

    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    let ref2CollectionSnap: QuerySnapshot | undefined;

    const onRef2CollectionSnapshot = jest.fn(snapshot => {
      ref2CollectionSnap = snapshot;
    });

    firestore.collection('b').onSnapshot(onRef2CollectionSnapshot);

    await firestore.runTransaction(async transaction => {
      const ref = firestore.doc('a/first');
      const ref2 = firestore.doc('b/A');
      const ref3 = firestore.doc('b/C');

      transaction.update(ref, { test: 'modified' });
      transaction.delete(ref2);
      transaction.set(ref3, {
        text: 'added',
        value: 3,
      });
    });

    expect(ref2CollectionSnap).toBeDefined();
    const docChanges = ref2CollectionSnap!.docChanges();
    expect(docChanges.length).toBe(2);
    expect(docChanges[0].type).toMatch('removed');
    expect(docChanges[1].type).toMatch('added');
    expect(onRef2CollectionSnapshot.mock.calls.length).toBe(1);
  });

  it('will get value updated inside the transaction', async () => {
    expect(true).toBeTruthy();

    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    let result = undefined;

    await firestore.runTransaction(async transaction => {
      const ref = firestore.doc('a/first');

      transaction.set(ref, { test: 'modified' });
      result = await transaction.get(ref);
    });
    expect(result).toEqual({ test: 'modified' });
  });

  it('will get value from document ref if value is not defined in transaction', async () => {
    expect(true).toBeTruthy();

    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    let result = undefined;

    await firestore.runTransaction(async transaction => {
      const ref = firestore.doc('b/A');

      result = await transaction.get(ref);
    });
    expect(result).toEqual({
      text: 'A',
    });
  });
});

// TODO get

// TODO oldIndex, newIndex
