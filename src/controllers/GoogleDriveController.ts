
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


  // backend/src/modules/ndrive/ndrive.controller.ts

/**
 * Descargar archivo de Google Drive
 */
downloadFile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fileId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'ID de archivo requerido'
      });
    }

    // Obtener el archivo desde Google Drive
    const fileStream = await this.googleDriveService.downloadFile(userId, fileId);

    // Obtener metadata del archivo para el nombre
    const metadata = await this.googleDriveService.getFileMetadata(userId, fileId);

    // Configurar headers para descarga
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);

    // Stream el archivo al cliente
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar archivo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};



/**
 * Obtener link público/temporal para compartir
 */
getShareLink = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fileId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Generar link temporal (24 horas)
    const shareLink = await this.googleDriveService.createShareLink(userId, fileId);

    res.json({
      success: true,
      data: {
        shareLink,
        expiresIn: '24 horas'
      }
    });

  } catch (error) {
    console.error('Error al generar link:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar link para compartir',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// En tu controller

// En tu controller

// Endpoint SIN autenticación
// Endpoint público SIN autenticación
servePublicFile = async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;

        const { filePath, metadata } = await this.googleDriveService.getSharedFile(fileId);

      res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${metadata.name}"`);
        res.removeHeader('X-Frame-Options'); // Remover restricción
        res.removeHeader('Content-Security-Policy'); // Remover CSPf

        // Enviar el archivo
        res.sendFile(filePath);

    } catch (error) {
        console.error('Error serving public file:', error);
        res.status(404).send('Archivo no encontrado');
    }
};

getSharedFileMetadata = async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;

        const { metadata } = await this.googleDriveService.getSharedFile(fileId);

        res.json({
            name: metadata.name,
            size: metadata.size,
            mimeType: metadata.mimeType
        });

    } catch (error) {
        console.error('Error getting file metadata:', error);
        res.status(404).json({ message: 'Archivo no encontrado' });
    }
};

// Agregar estos endpoints a tu controller

// Crear link público para compartir
createPublicLink = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fileId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        const shareLink = await this.googleDriveService.createPublicLink(userId, fileId);

        res.json({
            success: true,
            data: { shareLink }
        });
    } catch (error:any) {
        console.error('Error creating share link:', error);

        // Retornar mensaje específico para tipos no permitidos
        if (error.message.includes('Solo se pueden compartir')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al generar link de compartir'
        });
    }
};

// Endpoint público para acceder al archivo compartido


// Agregar a tus rutas:
// router.post('/files/:fileId/share', authenticateToken, controller.createPublicLink);
// router.get('/share/:fileId', controller.servePublicFile); // SIN autenticación
}
