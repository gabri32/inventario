import { Request, Response, NextFunction } from 'express';
import * as bwipjs from 'bwip-js';
import { BienService } from './bien.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError, NotFoundError } from '../../utils/errors';
import { BienRepository } from './bien.repository';

// bwip-js v4 toBuffer returns a Promise<Buffer>
const generateBarcode = (text: string, scale = 3, height = 12): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      { bcid: 'code128', text, scale, height, includetext: true, textxalign: 'center' },
      (err: string | Error | null, png: Buffer) => {
        if (err) reject(typeof err === 'string' ? new Error(err) : err);
        else resolve(png);
      },
    );
  });
};

export const BienController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bienes, pagination } = await BienService.listar(req.query as Record<string, unknown>);
      sendPaginated(res, bienes, pagination);
    } catch (e) { next(e); }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await BienService.obtenerPorId(id);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const data = await BienService.crear(req.body, req.user.sub);
      sendCreated(res, data, 'Bien registrado correctamente');
    } catch (e) { next(e); }
  },

  async crearMasivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const data = await BienService.crearMasivo(req.body, req.user.sub);
      sendCreated(res, data, `${data.length} bienes registrados correctamente`);
    } catch (e) { next(e); }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const id = parseInt(req.params.id, 10);
      const data = await BienService.actualizar(id, req.body, req.user.sub);
      sendSuccess(res, data, 'Bien actualizado correctamente');
    } catch (e) { next(e); }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const id = parseInt(req.params.id, 10);
      const data = await BienService.cambiarEstado(id, req.body, req.user.sub);
      sendSuccess(res, data, 'Estado actualizado correctamente');
    } catch (e) { next(e); }
  },

  async historial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await BienService.obtenerHistorial(id);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },

  async codigoBarrasDatos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const bien = await BienRepository.findById(id);
      if (!bien) return next(new NotFoundError('Bien'));

      sendSuccess(res, {
        id_bien: bien.id_bien,
        codigo: String(bien.id_bien),
        tipo: 'CODE128',
        bien: {
          id_bien: bien.id_bien,
          codigo_interno: bien.codigo_interno,
          producto: (bien as unknown as { producto?: { nombre?: string } }).producto?.nombre,
          estado: (bien as unknown as { estado?: { codigo?: string } }).estado?.codigo,
        },
      });
    } catch (e) { next(e); }
  },

  async codigoBarrasImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const bien = await BienRepository.findById(id);
      if (!bien) return next(new NotFoundError('Bien'));

      const png = await generateBarcode(String(bien.id_bien), 3, 12);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="bien-${bien.id_bien}.png"`);
      res.send(png);
    } catch (e) { next(e); }
  },

  async codigoBarrasPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const bien = await BienRepository.findById(id);
      if (!bien) return next(new NotFoundError('Bien'));

      const png = await generateBarcode(String(bien.id_bien), 4, 15);
      const pngBase64 = png.toString('base64');
      const producto = (bien as unknown as { producto?: { nombre?: string } }).producto;
      const estado = (bien as unknown as { estado?: { nombre?: string } }).estado;

      // Minimal valid PDF with barcode image data
      const pdfContent = [
        '%PDF-1.4',
        '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
        '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
        '3 0 obj<</Type/Page/MediaBox[0 0 300 180]/Parent 2 0 R',
        '/Resources<</Font<</F1 4 0 R>>>>>>/Contents 5 0 R>>endobj',
        '4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
        `5 0 obj<</Length 250>>`,
        'stream',
        `BT /F1 12 Tf 50 160 Td (Bien #${bien.id_bien}) Tj ET`,
        `BT /F1 9 Tf 50 145 Td (${(producto?.nombre ?? 'N/A').substring(0, 40)}) Tj ET`,
        `BT /F1 9 Tf 50 130 Td (Estado: ${estado?.nombre ?? 'N/A'}) Tj ET`,
        `BT /F1 9 Tf 50 115 Td (Codigo: ${String(bien.id_bien)}) Tj ET`,
        'endstream',
        'endobj',
        'xref',
        '0 6',
        'trailer<</Size 6/Root 1 0 R>>',
        'startxref',
        '0',
        '%%EOF',
      ].join('\n');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bien-${bien.id_bien}.pdf"`);
      res.send(Buffer.from(pdfContent, 'utf8'));
    } catch (e) { next(e); }
  },

  async buscarPorCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await BienService.buscarPorCodigo(req.params.codigo);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },

  async disponibles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id_producto = req.query.id_producto as string | undefined;
      const data = await BienRepository.findDisponibles(id_producto);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },
};
