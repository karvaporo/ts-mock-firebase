import { DocumentSnapshot } from '@firebase/firestore-types';
import { FirebaseAppMock } from 'firebaseApp';
import { CollectionReferenceMock } from 'firestore/CollectionReferenceMock';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
import { DocumentSnapshotFunction } from '../DocumentReferenceMock';
import { FirestoreMock } from '../index';

describe('DocumentReferenceMock', () => {
  describe('Refrences', () => {
    it('collection() returns a collection by id', () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;
      const document = firestore.root;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);

      expect(document.collection('test')).toBe(collection);
    });

    it('collection() returns a collection by path', () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = firestore.collection('company/mindhive/skills/coding/technologies');
      const document = firestore.root.collection('company').doc('mindhive');

      expect(document.collection('skills/coding/technologies')).toBe(collection);
    });
  });

  describe('set()', () => {
    it('will replace the current data', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);
      expect(firestore.doc('test/doc')).toBe(document);
    });

    it('will trigger onSnapshot event listeners', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: DocumentSnapshot | undefined = undefined;

      const listener: DocumentSnapshotFunction = (snapshot: DocumentSnapshot) => {
        snap = snapshot;
      };

      const unsubscribe = document.onSnapshot(listener);

      const data = {
        test: 'data',
      };
      await document.set(data);

      expect(document.data).toEqual(data);
      expect(snap).toBeDefined();
      expect(snap!.exists).toBeDefined();
      expect(snap!.data()).toEqual(data);

      unsubscribe();
    });

    // TOTO merge options
  });

  describe('delete()', () => {
    it('will remove the document', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      await document.delete();
      expect(collection.mocker.doc('doc')).toBeUndefined();
    });

    it('will trigger onSnapshot -event', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: DocumentSnapshot | undefined = undefined;

      const listener: DocumentSnapshotFunction = (snapshot: DocumentSnapshot) => {
        snap = snapshot;
      };

      const unsubscribe = document.onSnapshot(listener);

      await document.delete();
      expect(collection.mocker.doc('doc')).toBeUndefined();
      expect(snap!.data()).toBeUndefined();
      expect(snap!.exists).toBeFalsy();

      unsubscribe();
    });
  });

  describe('get()', () => {
    it('will get snapshot with data', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      const snapshot = await document.get();

      expect(snapshot.exists).toBeTruthy();
      expect(snapshot.data()).toEqual(data);
    });

    it('will get snapshot with exists = false if document does not exists', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      const snapshot = await document.get();

      expect(snapshot.exists).toBeFalsy();
      expect(snapshot.data()).toBeUndefined();
    });
  });

  describe('isEqual()', () => {
    it('will identify if the document refence points to itself ', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const document2 = new DocumentReferenceMock(firestore, 'doc2', collection);
      collection.mocker.setDoc(document2);

      expect(document.isEqual(document)).toBeTruthy();
      expect(document.isEqual(document2)).toBeFalsy();
    });
  });

  describe('onSnapshot()', () => {
    it('will let user to start and stop listening snapshots', () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;
      const doc = firestore.doc('test/doc') as DocumentReferenceMock;
      const listener = (snapshot: DocumentSnapshot) => {
        console.log(snapshot);
      };
      const unsubscribe = doc.onSnapshot(listener);
      expect(unsubscribe).toBeDefined();

      expect(doc.mocker.listeners()).toEqual([listener]);

      unsubscribe();
      expect(doc.mocker.listeners()).toEqual([]);
    });
  });

  describe('update()', () => {
    it('will alter the data', async () => {
      const app = new FirebaseAppMock();
      const firestore = app.firestore() as FirestoreMock;

      const collection = new CollectionReferenceMock(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new DocumentReferenceMock(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);

      await document.update({
        test2: 'more',
      });
      expect(document.data).toEqual({
        test: 'data',
        test2: 'more',
      });
    });

    // it('will alter the data wih key-value pairs', async () => {
    //   const app = new FirebaseAppMock();
    //   const firestore = app.firestore() as FirestoreMock;

    //   const collection = new CollectionReferenceMock(firestore, 'test', null);
    //   firestore.root.mocker.setCollection(collection);
    //   const document = new DocumentReferenceMock(firestore, 'doc', collection);
    //   collection.mocker.setDoc(document);
    //   const data = {
    //     test: 'data',
    //   };
    //   await document.set(data);
    //   expect(document.data).toEqual(data);

    //   await document.update(
    //     "test2", 'more', "test2.map", {
    //       n: 3,
    //     });
    //   expect(document.data).toEqual({
    //     test: 'data',
    //     test2: 'more',
    //   });
    // });
  });
});
