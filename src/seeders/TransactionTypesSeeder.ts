// src/seeders/TransactionTypesSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { TransactionType } from '../entities/TransactionType';

export class TransactionTypesSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Verificar si ya existen datos
    if (await this.hasData(TransactionType)) {
      this.log('Transaction types already exist, skipping creation...', 'info');
      return;
    }

    const transactionTypes = [
      {
        name: 'Venta',
        description: 'Venta de propiedad',
        isActive: true
      },
      {
        name: 'Alquiler',
        description: 'Alquiler de propiedad',
        isActive: true
      },
      {
        name: 'Venta/Alquiler',
        description: 'Disponible para venta o alquiler',
        isActive: true
      },
      {
        name: 'Intercambio',
        description: 'Intercambio de propiedades',
        isActive: true
      },
      {
        name: 'Remate',
        description: 'Venta por remate',
        isActive: true
      },
      {
        name: 'Anticresis',
        description: 'Anticresis o préstamo con garantía',
        isActive: true
      },
      {
        name: 'Leasing',
        description: 'Arrendamiento financiero',
        isActive: true
      },
      {
        name: 'Temporada',
        description: 'Alquiler por temporadas',
        isActive: true
      },
      {
        name: 'Traspaso',
        description: 'Traspaso de derechos',
        isActive: true
      }
    ];

    this.log('Creating transaction types...', 'info');
    const createdTypes = await this.createIfNotExists(TransactionType, transactionTypes, 'name');
    this.log(`Successfully created ${createdTypes.length} transaction types`, 'success');
  }
}