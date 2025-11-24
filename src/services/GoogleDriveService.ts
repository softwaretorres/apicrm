import { Repository } from 'typeorm';
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../config/database';
import { GoogleDriveConnection } from '../entities/GoogleDriveConnection';
import { HttpError } from '../types';
import * as crypto from 'crypto';
import { ShareToken } from '../entities/ShareToken';
import * as fs from 'fs';
import * as path from 'path';


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


export interface CreateShareLinkOptions {
    expirationDays?: number; // Por defecto 365 días (1 año)
}

export interface ShareLinkResponse {
    token: string;
    shareUrl: string;
    downloadUrl?: string,
    expiresAt: Date;
    qrCode?: string; // Opcional: puedes generar el QR en el frontend
}

/**
 * Servicio para manejar operaciones con Google Drive
 */
export class GoogleDriveService {
    private connectionRepo: Repository<GoogleDriveConnection>;
    private shareTokenRepo: Repository<ShareToken>;
    private oauth2Client: OAuth2Client;

    constructor() {
        this.connectionRepo = AppDataSource.getRepository(GoogleDriveConnection);
        this.shareTokenRepo = AppDataSource.getRepository(ShareToken);
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }


    async createShareLinkWithToken(
        userId: number,
        fileId: string,
        options: CreateShareLinkOptions = {}
    ): Promise<ShareLinkResponse> {
        // Verificar que el archivo existe y el usuario tiene acceso
        const fileMetadata = await this.getFileById(userId, fileId);

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');

        // Calcular fecha de expiración (por defecto 1 año)
        const expirationDays = options.expirationDays || 365;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);

        // Guardar en base de datos
        const shareToken = this.shareTokenRepo.create({
            token,
            fileId,
            userId,
            fileName: fileMetadata.name, // ✅ Guardar nombre aquí
            expiresAt,
            isActive: true,
            downloadCount: 0
        });

        await this.shareTokenRepo.save(shareToken);

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // URL para el QR - apunta al frontend para visualización
        const shareUrl = `${frontendUrl}/share/${token}`;

        // URL de descarga directa (opcional)
        const downloadUrl = `${baseUrl}/api/public/download/${token}`;

        return {
            token,
            shareUrl,      // Esta es para el QR - visualización
            downloadUrl,   // Esta es para descarga directa (opcional)
            expiresAt
        };
    }

    /**
     * Obtiene un archivo usando el token de compartición (acceso público)
     */
    // src/services/GoogleDriveService.ts

    /**
     * Obtener archivo por token (maneja archivos locales Y de Google Drive)
     */
async getFileByShareToken(token: string): Promise<{
    stream: any;
    metadata: { name: string; mimeType: string; size: string };
    isLocal: boolean;
}> {
    // Detectar si es un token válido (64 caracteres hex) o un fileId legacy
    const isTokenFormat = this.isValidTokenFormat(token);

    if (isTokenFormat) {
        // ===== SISTEMA NUEVO: Buscar en BD por token =====
        const shareToken = await this.shareTokenRepo.findOne({
            where: { token, isActive: true }
        });

        if (!shareToken) {
            throw new HttpError(404, 'Link inválido o no encontrado');
        }

        // Verificar si expiró
        if (shareToken.isExpired()) {
            throw new HttpError(410, 'El link ha expirado');
        }

        // Archivo local o Google Drive según la BD
        if (shareToken.isLocalFile) {
            return await this.getLocalFile(shareToken);
        }

        return await this.getGoogleDriveFile(shareToken);
    } else {
        // ===== SISTEMA LEGACY: Archivo local directo =====
        return await this.getFileByLegacyIdentifier(token);
    }
}

/**
 * Verificar si es formato de token válido
 * Token: 64 caracteres hexadecimales
 * FileId: caracteres alfanuméricos + guiones, longitud variable
 */
private isValidTokenFormat(token: string): boolean {
    // Token generado con crypto.randomBytes(32).toString('hex') = 64 caracteres hex
    return /^[a-f0-9]{64}$/i.test(token);
}

/**
 * Obtener archivo legacy (fileId o fileId-filename)
 */
async getFileByLegacyIdentifier(identifier: string): Promise<{
    stream: any;
    metadata: { name: string; mimeType: string; size: string };
    isLocal: boolean;
}> {
    const uploadDir = path.join(__dirname, '../../uploads/shared');
    
    if (!fs.existsSync(uploadDir)) {
        throw new HttpError(404, 'Directorio de archivos no encontrado');
    }

    // Extraer fileId (primera parte antes del guion, o todo si no hay guion)
    const fileId = identifier.split('-')[0];

    // Buscar archivo que empiece con ese fileId
    const files = fs.readdirSync(uploadDir);
    const matchedFile = files.find(file => file.startsWith(fileId));

    if (!matchedFile) {
        throw new HttpError(404, 'Archivo no encontrado en el servidor');
    }

    const filePath = path.join(uploadDir, matchedFile);

    // Verificar que existe
    if (!fs.existsSync(filePath)) {
        throw new HttpError(404, 'Archivo no encontrado');
    }

    // Obtener stats
    const stats = fs.statSync(filePath);

    // Crear stream
    const stream = fs.createReadStream(filePath);

    // Intentar buscar en BD para incrementar contador (opcional)
    try {
        const shareToken = await this.shareTokenRepo.findOne({
            where: { fileId, isLocalFile: true }
        });

        if (shareToken) {
            await this.shareTokenRepo.update(
                { id: shareToken.id },
                { downloadCount: shareToken.downloadCount + 1 }
            );
        }
    } catch (error) {
        // No hacer nada si no existe en BD
        console.log('Archivo legacy sin registro en BD');
    }

    return {
        stream,
        metadata: {
            name: matchedFile,
            mimeType: this.getMimeType(matchedFile),
            size: stats.size.toString()
        },
        isLocal: true
    };
}


    /**
     * Obtener archivo local
     */
private async getLocalFile(shareToken: ShareToken) {
    const uploadDir = path.join(__dirname, '../../uploads/shared');
    let filePath: string;
    let fileName: string;

    // CASO 1: Tiene localFilePath guardado en BD
    if (shareToken.localFilePath) {
        filePath = path.join(uploadDir, shareToken.localFilePath);
        fileName = shareToken.fileName || shareToken.localFilePath;
    } 
    // CASO 2: No tiene localFilePath, buscar por fileId
    else {
        if (!fs.existsSync(uploadDir)) {
            throw new HttpError(404, 'Directorio de archivos no encontrado');
        }

        // Buscar archivo que empiece con el fileId
        const files = fs.readdirSync(uploadDir);
        const matchedFile = files.find(file => file.startsWith(shareToken.fileId));

        if (!matchedFile) {
            throw new HttpError(404, 'Archivo no encontrado en el servidor');
        }

        filePath = path.join(uploadDir, matchedFile);
        fileName = shareToken.fileName || matchedFile;
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
        throw new HttpError(404, 'Archivo no encontrado en el servidor');
    }

    // Obtener stats del archivo
    const stats = fs.statSync(filePath);

    // Crear stream de lectura
    const stream = fs.createReadStream(filePath);

    // Incrementar contador
    await this.shareTokenRepo.update(
        { id: shareToken.id },
        { downloadCount: shareToken.downloadCount + 1 }
    );

    return {
        stream,
        metadata: {
            name: fileName,
            mimeType: this.getMimeType(fileName),
            size: stats.size.toString()
        },
        isLocal: true
    };
}
    /**
     * Obtener archivo de Google Drive
     */
    private async getGoogleDriveFile(shareToken: ShareToken) {
        const connection = await this.connectionRepo.findOne({
            where: { userId: shareToken.userId, isActive: true }
        });

        if (!connection) {
            throw new HttpError(500, 'No se puede acceder al archivo en este momento');
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        auth.setCredentials({
            access_token: connection.accessToken,
            refresh_token: connection.refreshToken
        });

        const drive = google.drive({ version: 'v3', auth });

        // Obtener metadata
        const metadata = await drive.files.get({
            fileId: shareToken.fileId,
            fields: 'id, name, mimeType, size'
        });

        // Obtener stream
        const response = await drive.files.get(
            { fileId: shareToken.fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        // Incrementar contador
        await this.shareTokenRepo.update(
            { id: shareToken.id },
            { downloadCount: shareToken.downloadCount + 1 }
        );

        return {
            stream: response.data,
            metadata: {
                name: metadata.data.name!,
                mimeType: metadata.data.mimeType!,
                size: metadata.data.size!
            },
            isLocal: false
        };
    }

    private getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Revoca un token de compartición
     */
    async revokeShareToken(userId: number, token: string): Promise<boolean> {
        const shareToken = await this.shareTokenRepo.findOne({
            where: { token, userId }
        });

        if (!shareToken) {
            throw new HttpError(404, 'Token no encontrado');
        }

        await this.shareTokenRepo.update(
            { id: shareToken.id },
            { isActive: false }
        );

        return true;
    }

    /**
     * Lista todos los tokens de compartición de un usuario
     */
    async listShareTokens(userId: number): Promise<ShareToken[]> {
        return await this.shareTokenRepo.find({
            where: { userId, isActive: true },
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Obtiene estadísticas de un token
     */
    async getShareTokenStats(userId: number, token: string) {
        const shareToken = await this.shareTokenRepo.findOne({
            where: { token, userId }
        });

        if (!shareToken) {
            throw new HttpError(404, 'Token no encontrado');
        }

        // Obtener información del archivo
        const fileInfo = await this.getFileById(userId, shareToken.fileId);

        return {
            token: shareToken.token,
            fileName: fileInfo.name,
            downloadCount: shareToken.downloadCount,
            createdAt: shareToken.createdAt,
            expiresAt: shareToken.expiresAt,
            isExpired: shareToken.isExpired(),
            isActive: shareToken.isActive
        };
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


    async downloadFile(userId: number, fileId: string) {
        const drive = await this.getDriveClient(userId);

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        return response.data;
    }

    async getFileMetadata(userId: number, fileId: string) {
        const drive = await this.getDriveClient(userId);

        const response = await drive.files.get({
            fileId,
            fields: 'id, name, mimeType, size'
        });

        return response.data;
    }

    async createShareLink(userId: number, fileId: string) {
        const drive = await this.getDriveClient(userId);

        // Hacer el archivo accesible por link
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Obtener el webViewLink o webContentLink
        const file = await drive.files.get({
            fileId,
            fields: 'webViewLink, webContentLink'
        });

        return file.data.webViewLink || file.data.webContentLink;
    }


    // Agregar estos métodos a tu GoogleDriveService


    // En tu googleDriveService
    /* async createPublicLink(userId: number, fileId: string): Promise<string> {
         const drive = await this.getDriveClient(userId);
         const mkdir = promisify(fs.mkdir);
         // 1. Obtener metadata del archivo
         const metadata = await drive.files.get({
             fileId,
             fields: 'id, name, mimeType, size'
         });
 
         // 2. Descargar el archivo
         const response = await drive.files.get(
             { fileId, alt: 'media' },
             { responseType: 'stream' }
         );
 
         // 3. Crear directorio si no existe
         const uploadDir = path.join(__dirname, '../../uploads/shared');
         await mkdir(uploadDir, { recursive: true });
 
         // 4. Guardar archivo con nombre único
         const fileName = `${fileId}-${metadata.data.name}`;
         const filePath = path.join(uploadDir, fileName);
 
         // 5. Escribir el stream al archivo
         const writer = fs.createWriteStream(filePath);
         response.data.pipe(writer);
 
         // 6. Esperar a que termine de escribir
         await new Promise<void>((resolve, reject) => {
             writer.on('finish', () => resolve());
             writer.on('error', reject);
         });
         // 7. Retornar URL pública
         const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
         return `${baseUrl}/share/${fileId}`;
     }
 
     async getSharedFile(fileId: string): Promise<{ filePath: string; metadata: any }> {
         const uploadDir = path.join(__dirname, '../../uploads/shared');
 
         console.log("Hola como estas", uploadDir)
         //yes
 
         // Buscar el archivo que comience con el fileId
         const files = fs.readdirSync(uploadDir);
         const fileName = files.find(f => f.startsWith(fileId));
 
         if (!fileName) {
             throw new Error('Archivo no encontrado');
         }
 
         const filePath = path.join(uploadDir, fileName);
 
         // Extraer nombre original
         const originalName = fileName.replace(`${fileId}-`, '');
 
         return {
             filePath,
             metadata: {
                 name: originalName,
                 mimeType: this.getMimeType(originalName)
             }
         };
     }
 
     private getMimeType(filename: string): string {
         const ext = path.extname(filename).toLowerCase();
         const mimeTypes: { [key: string]: string } = {
             '.pdf': 'application/pdf',
             '.jpg': 'image/jpeg',
             '.jpeg': 'image/jpeg',
             '.png': 'image/png',
             '.gif': 'image/gif',
             '.doc': 'application/msword',
             '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
             '.xls': 'application/vnd.ms-excel',
             '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         };
         return mimeTypes[ext] || 'application/octet-stream';
     }
     async streamPublicFile(fileId: string) {
         // Obtener el archivo sin autenticación de usuario específico
         // Usar las credenciales de la app
         const oauth2Client = new google.auth.OAuth2(
             process.env.GOOGLE_CLIENT_ID,
             process.env.GOOGLE_CLIENT_SECRET
         );
 
         const drive = google.drive({ version: 'v3', auth: oauth2Client });
 
         const response = await drive.files.get(
             { fileId, alt: 'media' },
             { responseType: 'stream' }
         );
 
         return response.data;
     }
 
 
     async getFileForPublicAccess(fileId: string) {
         // Este método NO requiere userId porque es público
         const oauth2Client = new google.auth.OAuth2(
             process.env.GOOGLE_CLIENT_ID,
             process.env.GOOGLE_CLIENT_SECRET
         );
 
         const drive = google.drive({ version: 'v3', auth: oauth2Client });
 
         const response = await drive.files.get(
             { fileId, alt: 'media' },
             { responseType: 'stream' }
         );
 
         return response.data;
     }
 
     async getPublicFileMetadata(fileId: string) {
         const oauth2Client = new google.auth.OAuth2(
             process.env.GOOGLE_CLIENT_ID,
             process.env.GOOGLE_CLIENT_SECRET
         );
 
         const drive = google.drive({ version: 'v3', auth: oauth2Client });
 
         const response = await drive.files.get({
             fileId,
             fields: 'id, name, mimeType, size, webViewLink'
         });
 
         return response.data;
     }
         */
}

