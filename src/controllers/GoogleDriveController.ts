
import { Request, Response } from 'express';
import { GoogleDriveService } from '../services/GoogleDriveService';

export class GoogleDriveController {
  private googleDriveService: GoogleDriveService;

  constructor() {
    this.googleDriveService = new GoogleDriveService();
  }

  /**
   * GET /google-drive/status
   * Obtiene el estado de la conexión del usuario
   */
  getStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const status = await this.googleDriveService.getConnectionStatus(userId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET/POST /google-drive/connect
   * Inicia el flujo de OAuth o completa la conexión
   */
  connect = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado. Debe iniciar sesión primero.'
        });
      }

      // Si viene con 'code' de OAuth, completar la conexión
      const code = req.query.code as string || req.body.code;

      if (code) {
        const connection = await this.googleDriveService.connect(userId, { code });

        return res.json({
          success: true,
          message: 'Conectado exitosamente a Google Drive',
          data: connection.toJSON()
        });
      }

      // Si viene con accessToken directo
      if (req.body.accessToken) {
        const connection = await this.googleDriveService.connect(userId, {
          accessToken: req.body.accessToken,
          refreshToken: req.body.refreshToken
        });

        return res.json({
          success: true,
          message: 'Conectado exitosamente a Google Drive',
          data: connection.toJSON()
        });
      }

      // Si no tiene code ni accessToken, devolver URL de autorización
      const authUrl = this.googleDriveService.getAuthUrl();

      res.json({
        success: false,
        message: 'Se requiere autorización. Redirigir al usuario a authUrl',
        authUrl
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al conectar con Google Drive',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * POST /google-drive/disconnect
   * Desconecta el usuario de Google Drive
   */
  disconnect = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      await this.googleDriveService.disconnect(userId);

      res.json({
        success: true,
        message: 'Desconectado exitosamente de Google Drive'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al desconectar de Google Drive',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /google-drive/files
   * Lista los archivos del usuario en Google Drive
   */
  getFiles = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const query = {
        folderId: req.query.folderId as string,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        pageToken: req.query.pageToken as string,
        query: req.query.query as string,
        orderBy: req.query.orderBy as string
      };

      const result = await this.googleDriveService.listFiles(userId, query);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {

      // Si el error es por token expirado, sugerir reconexión
      if (error instanceof Error && error.message.includes('Token expirado')) {
        return res.status(401).json({
          success: false,
          message: error.message,
          needsReconnect: true
        });
      }

      res.status(500).json({
        success: false,
        needsConnection: error.status == 401 ? true : false,  // ← Flag especial
        message: 'Error al obtener archivos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /google-drive/folders
   * Lista las carpetas del usuario en Google Drive
   */
  getFolders = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const query = {
        parentId: req.query.parentId as string,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        pageToken: req.query.pageToken as string
      };

      const result = await this.googleDriveService.listFolders(userId, query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      // Si el error es por token expirado, sugerir reconexión
      if (error instanceof Error && error.message.includes('Token expirado')) {
        return res.status(401).json({
          success: false,
          message: error.message,
          needsReconnect: true
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al obtener carpetas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /google-drive/files/:id
   * Obtiene información de un archivo específico
   */
  getFile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const file = await this.googleDriveService.getFileById(userId, id);

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener archivo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /google-drive/folders/:id
   * Obtiene información de una carpeta específica
   */
  getFolder = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const folder = await this.googleDriveService.getFolderById(userId, id);

      res.json({
        success: true,
        data: folder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener carpeta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
}
