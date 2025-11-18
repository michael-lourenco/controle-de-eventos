/**
 * Serviço principal para integração com Google Calendar
 * 
 * IMPORTANTE: Este serviço usa googleapis que é uma biblioteca Node.js.
 * Deve ser usado APENAS em server-side (API routes, server actions).
 * 
 * Este serviço é opcional e não quebra o sistema se não estiver configurado.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Evento } from '@/types';
import { GoogleCalendarEvent, GoogleCalendarToken } from '@/types/google-calendar';
import { GoogleCalendarTokenRepository } from '../repositories/google-calendar-token-repository';
import { repositoryFactory } from '../repositories/repository-factory';
import { mapEventoToGoogleCalendar, mapGoogleCalendarToEvento } from '../utils/google-calendar-mapper';
import { verificarAcessoGoogleCalendar } from '../utils/google-calendar-auth';

// Chave de criptografia (deve vir de variável de ambiente)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

// Funções simples de criptografia (usar biblioteca adequada em produção)
function encrypt(text: string, key: string): string {
  // Implementação simplificada - usar crypto em produção
  // Por enquanto, apenas base64 para desenvolvimento
  if (process.env.NODE_ENV === 'production' && key === 'default-key-change-in-production') {
    throw new Error('ENCRYPTION_KEY deve ser configurada em produção');
  }
  return Buffer.from(text).toString('base64');
}

function decrypt(encrypted: string, key: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

export class GoogleCalendarService {
  private tokenRepo: GoogleCalendarTokenRepository;
  private oauth2Client: OAuth2Client | null = null;

  constructor() {
    this.tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();
  }

  /**
   * Inicializa o cliente OAuth2
   */
  private getOAuth2Client(): OAuth2Client {
    if (!this.oauth2Client) {
      this.oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_PROD
      );
    }
    return this.oauth2Client;
  }

  /**
   * Obtém ou atualiza o access token do usuário
   */
  private async getAccessToken(userId: string): Promise<string> {
    const token = await this.tokenRepo.findByUserId(userId);
    
    if (!token) {
      throw new Error('Token não encontrado. Usuário precisa conectar Google Calendar.');
    }

    // Descriptografar tokens
    const accessToken = decrypt(token.accessToken, ENCRYPTION_KEY);
    const refreshToken = decrypt(token.refreshToken, ENCRYPTION_KEY);

    // Verificar se token expirou
    if (token.expiresAt && new Date() < token.expiresAt) {
      return accessToken;
    }

    // Token expirado, fazer refresh
    const oauth2Client = await this.getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token || !credentials.expiry_date) {
        throw new Error('Erro ao renovar token');
      }

      // Criptografar e salvar novo token
      const encryptedAccessToken = encrypt(credentials.access_token, ENCRYPTION_KEY);
      await this.tokenRepo.update(token.id, {
        accessToken: encryptedAccessToken,
        expiresAt: new Date(credentials.expiry_date),
        dataAtualizacao: new Date()
      });

      return credentials.access_token;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw new Error('Erro ao renovar token de acesso. Reconecte sua conta Google.');
    }
  }

  /**
   * Obtém cliente autenticado do Google Calendar
   */
  private async getCalendarClient(userId: string) {
    const accessToken = await this.getAccessToken(userId);
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Cria um evento no Google Calendar
   */
  async createEvent(userId: string, evento: Evento): Promise<string> {
    // Verificar acesso
    const temAcesso = await verificarAcessoGoogleCalendar(userId);
    if (!temAcesso) {
      throw new Error('Acesso negado. Esta funcionalidade está disponível apenas para planos Profissional e Enterprise.');
    }

    const calendar = await this.getCalendarClient(userId);
    const token = await this.tokenRepo.findByUserId(userId);
    
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const googleEvent = mapEventoToGoogleCalendar(evento);

    try {
      const response = await calendar.events.insert({
        calendarId: token.calendarId || 'primary',
        requestBody: googleEvent
      });

      return response.data.id || '';
    } catch (error: any) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      throw new Error(`Erro ao criar evento: ${error.message}`);
    }
  }

  /**
   * Atualiza um evento no Google Calendar
   */
  async updateEvent(userId: string, googleEventId: string, evento: Evento): Promise<void> {
    const temAcesso = await verificarAcessoGoogleCalendar(userId);
    if (!temAcesso) {
      throw new Error('Acesso negado. Esta funcionalidade está disponível apenas para planos Profissional e Enterprise.');
    }

    const calendar = await this.getCalendarClient(userId);
    const token = await this.tokenRepo.findByUserId(userId);
    
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const googleEvent = mapEventoToGoogleCalendar(evento);

    try {
      await calendar.events.update({
        calendarId: token.calendarId || 'primary',
        eventId: googleEventId,
        requestBody: googleEvent
      });
    } catch (error: any) {
      console.error('Erro ao atualizar evento no Google Calendar:', error);
      throw new Error(`Erro ao atualizar evento: ${error.message}`);
    }
  }

  /**
   * Deleta um evento do Google Calendar
   */
  async deleteEvent(userId: string, googleEventId: string): Promise<void> {
    const temAcesso = await verificarAcessoGoogleCalendar(userId);
    if (!temAcesso) {
      throw new Error('Acesso negado. Esta funcionalidade está disponível apenas para planos Profissional e Enterprise.');
    }

    const calendar = await this.getCalendarClient(userId);
    const token = await this.tokenRepo.findByUserId(userId);
    
    if (!token) {
      throw new Error('Token não encontrado');
    }

    try {
      await calendar.events.delete({
        calendarId: token.calendarId || 'primary',
        eventId: googleEventId
      });
    } catch (error: any) {
      // Se evento já foi deletado, não é erro crítico
      if (error.code === 404) {
        console.warn('Evento já foi deletado do Google Calendar');
        return;
      }
      console.error('Erro ao deletar evento no Google Calendar:', error);
      throw new Error(`Erro ao deletar evento: ${error.message}`);
    }
  }

  /**
   * Busca um evento no Google Calendar
   */
  async getEvent(userId: string, googleEventId: string): Promise<GoogleCalendarEvent> {
    const calendar = await this.getCalendarClient(userId);
    const token = await this.tokenRepo.findByUserId(userId);
    
    if (!token) {
      throw new Error('Token não encontrado');
    }

    try {
      const response = await calendar.events.get({
        calendarId: token.calendarId || 'primary',
        eventId: googleEventId
      });

      return response.data as GoogleCalendarEvent;
    } catch (error: any) {
      console.error('Erro ao buscar evento no Google Calendar:', error);
      throw new Error(`Erro ao buscar evento: ${error.message}`);
    }
  }

  /**
   * Sincroniza evento do Clicksehub para Google Calendar
   */
  async syncEventToCalendar(userId: string, evento: Evento): Promise<string> {
    // Se já tem googleCalendarEventId, atualizar
    if (evento.googleCalendarEventId) {
      await this.updateEvent(userId, evento.googleCalendarEventId, evento);
      return evento.googleCalendarEventId;
    }

    // Caso contrário, criar novo
    return await this.createEvent(userId, evento);
  }

  /**
   * Obtém URL de autorização OAuth
   */
  getAuthUrl(state?: string): string {
    const oauth2Client = this.getOAuth2Client();
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state || undefined
    });
  }

  /**
   * Troca código de autorização por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    try {
      const oauth2Client = this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
        throw new Error('Tokens inválidos recebidos do Google');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date)
      };
    } catch (error: any) {
      console.error('Erro ao trocar código por tokens:', error);
      throw new Error(`Erro na autenticação: ${error.message}`);
    }
  }

  /**
   * Obtém informações do calendário do usuário
   */
  async getCalendarInfo(userId?: string, accessToken?: string): Promise<{ email: string; calendarId: string }> {
    try {
      let calendar;
      const oauth2Client = this.getOAuth2Client();
      
      if (userId) {
        // Se userId fornecido, obter token e configurar
        const token = await this.getAccessToken(userId);
        oauth2Client.setCredentials({ access_token: token });
        calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      } else if (accessToken) {
        // Se accessToken fornecido diretamente
        oauth2Client.setCredentials({ access_token: accessToken });
        calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      } else {
        throw new Error('userId ou accessToken deve ser fornecido');
      }
      
      // Obter informações do calendário principal
      const response = await calendar.calendars.get({
        calendarId: 'primary'
      });

      return {
        email: response.data.id || '',
        calendarId: response.data.id || 'primary'
      };
    } catch (error: any) {
      console.error('Erro ao obter informações do calendário:', error);
      throw new Error(`Erro ao obter informações: ${error.message}`);
    }
  }
}

