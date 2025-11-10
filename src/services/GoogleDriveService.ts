import { Repository } from 'typeorm';
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../config/database';
import { GoogleDriveConnection } from '../entities/GoogleDriveConnection';
import { HttpError } from '../types';

/**
 * Interfaces para los tipos de datos
 */
export interface ConnectRequest {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdTime: Date;
  modifiedTime: Date;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  parentId?: string;
  owners?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  modifiedAt: Date;
  webViewLink?: string;
}

export interface ListFilesQuery {
  folderId?: string;
  pageSize?: number;
  pageToken?: string;
  query?: string;
  orderBy?: string;
}

export interface ListFoldersQuery {
  parentId?: string;
  pageSize?: number;
  pageToken?: string;
}

/**
 * Servicio para manejar operaciones con Google Drive
 */
export class GoogleDriveService {
  private connectionRepo: Repository<GoogleDriveConnection>;
  private oauth2Client: OAuth2Client;

  constructor() {
    this.connectionRepo = AppDataSource.getRepository(GoogleDriveConnection);
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Genera la URL de autorización de Google OAuth
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Conecta un usuario a Google Drive
   */
  async connect(userId: number, request: ConnectRequest): Promise<GoogleDriveConnection> {
    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresAt: Date;


    if (request.code) {
      // Intercambiar código de autorización por tokens
      const { tokens } = await this.oauth2Client.getToken(request.code);

      if (!tokens.access_token) {

        throw new Error('No se recibió access token de Google');
      }

      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token || undefined;
      expiresAt = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

    } else if (request.accessToken) {
      accessToken = request.accessToken;
      refreshToken = request.refreshToken;
      expiresAt = new Date(Date.now() + 3600 * 1000);
    } else {
      throw new Error('Se requiere code o accessToken');
    }

    // Obtener información del usuario de Google
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Buscar conexión existente
    let connection = await this.connectionRepo.findOne({
      where: { userId, isActive: true }
    });

    if (connection) {
      // Actualizar conexión existente
      connection.accessToken = accessToken;
      connection.refreshToken = refreshToken || connection.refreshToken;
      connection.expiresAt = expiresAt;
      connection.googleEmail = userInfo.data.email || connection.googleEmail;
      connection.isActive = true;
    } else {
      // Crear nueva conexión
      connection = this.connectionRepo.create({
        userId,
        accessToken,
        refreshToken,
        expiresAt,
        googleEmail: userInfo.data.email || undefined,
        isActive: true
      });
    }

    return await this.connectionRepo.save(connection);
  }

  /**
   * Desconecta un usuario de Google Drive
   */
  async disconnect(userId: number): Promise<boolean> {
    const connection = await this.connectionRepo.findOne({
      where: { userId, isActive: true }
    });

    if (!connection) {
      throw new Error('No hay conexión activa con Google Drive');
    }

    // Revocar el token de acceso en Google
    if (connection.accessToken) {
      try {
        await this.oauth2Client.revokeToken(connection.accessToken);
      } catch (error) {
        console.error('Error al revocar token en Google:', error);
      }
    }

    // Eliminar de la base de datos
    await this.connectionRepo.delete({ userId });

    return true;
  }

  /**
   * Verifica si un usuario está conectado
   */
  async isConnected(userId: number): Promise<boolean> {
    const count = await this.connectionRepo.count({
      where: { userId, isActive: true }
    });
    return count > 0;
  }

  /**
   * Obtiene el estado de la conexión de un usuario
   */
  async getConnectionStatus(userId: number): Promise<{
    connected: boolean;
    email?: string;
    expiresAt?: Date;
    needsRefresh?: boolean;
  }> {
    const connection = await this.connectionRepo.findOne({
      where: { userId, isActive: true }
    });

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: true,
      email: connection.googleEmail,
      expiresAt: connection.expiresAt,
      needsRefresh: connection.needsRefresh()
    };
  }

  /**
   * Obtiene la conexión de un usuario y refresca el token si es necesario
   */
  private async getConnection(userId: number): Promise<{ accessToken: string; refreshToken?: string }> {
    const connection = await this.connectionRepo.findOne({
      where: { userId, isActive: true }
    });

    if (!connection) {
      throw new HttpError(401, 'Usuario no conectado a Google Drive. Debe iniciar sesión primero.');
    }

    // Verificar si necesita refresh
    if (connection.needsRefresh() && connection.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: connection.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      const newAccessToken = credentials.access_token!;
      const newExpiresAt = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      // Actualizar en base de datos
      await this.connectionRepo.update(
        { userId },
        {
          accessToken: newAccessToken,
          expiresAt: newExpiresAt,
          refreshToken: credentials.refresh_token || connection.refreshToken
        }
      );

      return {
        accessToken: newAccessToken,
        refreshToken: credentials.refresh_token || connection.refreshToken
      };
    }

    // Si el token ya expiró y no se pudo refrescar
    if (connection.isExpired()) {
      await this.connectionRepo.update({ userId }, { isActive: false });
      throw new Error('Token expirado. Por favor, vuelva a conectar su cuenta de Google Drive.');
    }

    return {
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken
    };
  }

  /**
   * Obtiene el cliente de Drive autenticado
   */
  private async getDriveClient(userId: number): Promise<drive_v3.Drive> {
    const connection = await this.getConnection(userId);

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken
    });

    return google.drive({ version: 'v3', auth });
  }

  /**
   * Convierte un archivo de Google Drive al formato interno
   */
  private mapDriveFile(file: drive_v3.Schema$File): DriveFile {
    return {
      id: file.id!,
      name: file.name!,
      size: parseInt(file.size || '0'),
      mimeType: file.mimeType!,
      createdTime: new Date(file.createdTime!),
      modifiedTime: new Date(file.modifiedTime!),
      webViewLink: file.webViewLink || undefined,
      webContentLink: file.webContentLink || undefined,
      thumbnailLink: file.thumbnailLink || undefined,
      parentId: file.parents?.[0],
      owners: file.owners?.map(owner => owner.emailAddress || '')
    };
  }


  /**
   * Convierte una carpeta de Google Drive al formato interno
   */
  private mapDriveFolder(folder: drive_v3.Schema$File): DriveFolder {
    return {
      id: folder.id!,
      name: folder.name!,
      parentId: folder.parents?.[0],
      createdAt: new Date(folder.createdTime!),
      modifiedAt: new Date(folder.modifiedTime!),
      webViewLink: folder.webViewLink || undefined
    };
  }

  /**
   * Lista archivos del usuario en Google Drive
   */
  async listFiles(userId: number, query: ListFilesQuery = {}) {
    const drive = await this.getDriveClient(userId);

    // Construir query de Google Drive
    let q = "mimeType != 'application/vnd.google-apps.folder' and trashed = false";

    if (query.folderId) {
      q += ` and '${query.folderId}' in parents`;
    }

    if (query.query) {
      q += ` and ${query.query}`;
    }

    const response = await drive.files.list({
      q,
      pageSize: query.pageSize || 50,
      pageToken: query.pageToken,
      orderBy: query.orderBy || 'modifiedTime desc',
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, parents, owners)'
    });

    const files = response.data.files?.map(file => this.mapDriveFile(file)) || [];

    return {
      files,
      nextPageToken: response.data.nextPageToken || undefined
    };
  }

  /**
   * Lista carpetas del usuario en Google Drive
   */
  async listFolders(userId: number, query: ListFoldersQuery = {}) {
    const drive = await this.getDriveClient(userId);

    // Construir query para carpetas

let q = "trashed = false";

    if (query.parentId) {
      q += ` and '${query.parentId}' in parents`;
    }

    const response = await drive.files.list({
    q,
    pageSize: query.pageSize || 50,
    pageToken: query.pageToken,
    orderBy: 'folder,modifiedTime desc', // ✅ Carpetas primero
    fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, parents, owners)'
  });
  const files = response.data.files?.map(file => this.mapDriveFile(file)) || [];

  return { files, nextPageToken: response.data.nextPageToken };
  }

  /**
   * Obtiene información de un archivo específico
   */
  async getFileById(userId: number, fileId: string): Promise<DriveFile> {
    const drive = await this.getDriveClient(userId);

    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, parents, owners'
    });

    return this.mapDriveFile(response.data);
  }

  /**
   * Obtiene información de una carpeta específica
   */
  async getFolderById(userId: number, folderId: string): Promise<DriveFolder> {
    const drive = await this.getDriveClient(userId);

    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, createdTime, modifiedTime, parents, webViewLink'
    });

    return this.mapDriveFolder(response.data);
  }
}
