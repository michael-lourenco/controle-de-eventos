import { 
  Firestore,
  CollectionReference,
  DocumentReference,
  Query,
  QueryConstraint,
  Timestamp
} from 'firebase-admin/firestore';
import { adminDb, isFirebaseAdminInitialized } from '../firebase-admin';
import { BaseRepository } from './base-repository';

/**
 * Repository base que usa Firebase Admin SDK
 * Bypassa as regras de segurança do Firestore (usado apenas no servidor)
 */
export class AdminFirestoreRepository<T extends { id: string }> implements BaseRepository<T> {
  protected collectionName: string;
  protected db: Firestore;

  constructor(collectionName: string) {
    if (!isFirebaseAdminInitialized() || !adminDb) {
      throw new Error('Firebase Admin não está inicializado. Configure as credenciais do Firebase Admin.');
    }
    this.collectionName = collectionName;
    this.db = adminDb;
  }

  protected getCollection(): CollectionReference {
    return this.db.collection(this.collectionName);
  }

  protected convertFirestoreData(data: any, id: string): T {
    const converted = { ...data, id } as any;
    
    // Converter Timestamps para Date
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      }
    });
    
    return converted as T;
  }

  protected convertToFirestoreData(data: Partial<T>): any {
    const converted = { ...data } as any;
    
    // Função recursiva para remover undefined e converter Dates
    const cleanValue = (value: any): any => {
      if (value === undefined) {
        return undefined; // Será removido na iteração
      }
      
      if (value === null) {
        return null;
      }
      
      if (value instanceof Date) {
        return Timestamp.fromDate(value);
      }
      
      if (Array.isArray(value)) {
        return value.map(cleanValue).filter(item => item !== undefined);
      }
      
      if (typeof value === 'object') {
        const cleaned: any = {};
        for (const key in value) {
          const cleanedValue = cleanValue(value[key]);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
        return cleaned;
      }
      
      return value;
    };
    
    // Remover campos undefined e converter Dates para Timestamps
    const result: any = {};
    Object.keys(converted).forEach(key => {
      const cleanedValue = cleanValue(converted[key]);
      if (cleanedValue !== undefined) {
        result[key] = cleanedValue;
      }
    });
    
    return result;
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const collection = this.getCollection();
    const firestoreData = this.convertToFirestoreData(entity);
    const docRef = await collection.add(firestoreData);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      throw new Error('Document not found after creation');
    }
    
    return this.convertFirestoreData(docSnap.data()!, docRef.id);
  }

  async setWithId(id: string, entity: Omit<T, 'id'>): Promise<T> {
    const docRef = this.getCollection().doc(id);
    const firestoreData = this.convertToFirestoreData(entity);
    await docRef.set(firestoreData);
    return this.convertFirestoreData(firestoreData, id);
  }

  async findById(id: string): Promise<T | null> {
    const docRef = this.getCollection().doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    return this.convertFirestoreData(docSnap.data()!, id);
  }

  async findAll(): Promise<T[]> {
    const querySnapshot = await this.getCollection().get();
    return querySnapshot.docs.map(doc => this.convertFirestoreData(doc.data(), doc.id));
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const docRef = this.getCollection().doc(id);
    const firestoreData = this.convertToFirestoreData(entity);
    
    await docRef.update(firestoreData);
    
    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
      throw new Error('Document not found after update');
    }
    
    return this.convertFirestoreData(updatedDoc.data()!, id);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.getCollection().doc(id);
    await docRef.delete();
  }

  async findWhere(field: string, operator: any, value: any): Promise<T[]> {
    const querySnapshot = await this.getCollection()
      .where(field, operator, value)
      .get();
    return querySnapshot.docs.map(doc => this.convertFirestoreData(doc.data(), doc.id));
  }
}

