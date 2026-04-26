import { GoogleCalendarToken } from '@/types/google-calendar';
import { COLLECTIONS } from '../firestore/collections';
import { AdminFirestoreRepository } from './admin-firestore-repository';

export class AdminGoogleCalendarTokenRepository extends AdminFirestoreRepository<GoogleCalendarToken> {
  constructor() {
    super(COLLECTIONS.GOOGLE_CALENDAR_TOKENS);
  }

  async findByUserId(userId: string): Promise<GoogleCalendarToken | null> {
    const tokens = await this.findWhere('userId', '==', userId);
    return tokens.length > 0 ? tokens[0] : null;
  }

  async findByResourceId(resourceId: string): Promise<GoogleCalendarToken | null> {
    const tokens = await this.findWhere('resourceId', '==', resourceId);
    return tokens.length > 0 ? tokens[0] : null;
  }

  async updateSyncStatus(userId: string, syncEnabled: boolean): Promise<GoogleCalendarToken> {
    const token = await this.findByUserId(userId);
    if (!token) {
      throw new Error('Token não encontrado para o usuário');
    }
    return this.update(token.id, {
      syncEnabled,
      dataAtualizacao: new Date()
    });
  }

  async updateLastSync(userId: string): Promise<GoogleCalendarToken> {
    const token = await this.findByUserId(userId);
    if (!token) {
      throw new Error('Token não encontrado para o usuário');
    }
    return this.update(token.id, {
      lastSyncAt: new Date(),
      dataAtualizacao: new Date()
    });
  }
}
