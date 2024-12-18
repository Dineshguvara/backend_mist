import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';

@Injectable()
export class DummyDataService {
  constructor(private prisma: PrismaService) {}

  // Method to handle file upload and store data in the database
  async uploadDataFromFile(filePath: string, mimetype: string) {
    let records;
    if (mimetype === 'text/csv') {
      records = await this.parseCSV(filePath); // Parse CSV file
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      records = await this.parseExcel(filePath); // Parse Excel file
    } else {
      throw new BadRequestException('Unsupported file type');
    }

    // Save parsed records to the database
    const savedRecords = await this.saveDataToDatabase(records);

    return {
      message: `${savedRecords.count} records imported successfully`, // Access count instead of length
    };
  }

  // Method to parse CSV file
  private async parseCSV(filePath: string) {
    const records = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => records.push(this.trimKeys(row)))
        .on('end', () => resolve(records))
        .on('error', (error) => reject(error));
    });
  }

  // Method to parse Excel file
  private parseExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data.map((row) => this.trimKeys(row)); // Trim keys for each row
  }

  // Method to trim keys of an object
  private trimKeys(record: any) {
    const trimmedRecord: any = {};
    for (const key in record) {
      if (record.hasOwnProperty(key)) {
        trimmedRecord[key.trim()] = record[key];
      }
    }
    return trimmedRecord;
  }

  // Method to store parsed data into the database
  private async saveDataToDatabase(records: any[]) {
    const savedRecords = [];
    const chunkSize = 100;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const result = await this.prisma.dummyData.createMany({
        data: chunk.map((record) => ({
          name: record.name,
          email: record.email,
          age: parseInt(record.age, 10),
        })),
      });
      // You can push the actual records into the savedRecords array if you need them.
      savedRecords.push(...chunk); // This will store the actual records.
    }
    return { count: savedRecords.length, records: savedRecords }; // Return both the count and actual records
  }

  // Fetch all data from the database
  async getAllData() {
    return this.prisma.dummyData.findMany();
  }
}
