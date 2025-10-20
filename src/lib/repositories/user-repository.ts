import { FirestoreRepository } from './firestore-repository';
import { User } from '@/types';

export class UserRepository extends FirestoreRepository<User> {
  constructor() {
    super('controle_users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findWhere('email', '==', email);
    return users.length > 0 ? users[0] : null;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findWhere('role', '==', role);
  }

  async getActiveUsers(): Promise<User[]> {
    return this.findWhere('ativo', '==', true);
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    return this.update(userId, profileData);
  }
}
