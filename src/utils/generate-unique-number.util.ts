import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Member } from '@modules/member/entities/member.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Order } from '@modules/order/entities/order.entity';

@Injectable()
export class GenerateUniqueNumberUtil {
  /**
   * Generates a unique member or staff number.
   * @param prefix - The prefix for the number (e.g., 'DIRENA-MEM' or 'DIRENA-STF').
   * @param repository - The repository to check for existing numbers.
   * @param field - The field to check for uniqueness (e.g., 'memberNumber' or 'staffNumber').
   * @returns A unique number.
   */
  async generateUniqueNumber(
    prefix: string,
    repository: Repository<Member | Staff | Order>,
    field: string,
  ): Promise<string> {
    let isUnique = false;
    let uniqueNumber: string;

    while (!isUnique) {
      // Generate a random suffix (e.g., 'X7FZ' or 'B3Y2')
      const randomSuffix = this.generateRandomSuffix();
      // Construct the full number (e.g., 'DIRENA-MEM-24-X7FZ')
      uniqueNumber = `${prefix}-${this.getCurrentYear()}-${randomSuffix}`;

      // Check if the number already exists in the database
      const exists = await repository.findOne({
        where: { [field]: uniqueNumber },
      });
      if (!exists) {
        isUnique = true; // Exit the loop if the number is unique
      }
    }

    return uniqueNumber;
  }

  /**
   * Generates a random 4-character alphanumeric suffix.
   * @returns A random suffix (e.g., 'X7FZ').
   */
  private generateRandomSuffix(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return suffix;
  }

  /**
   * Gets the current year in 2-digit format.
   * @returns The current year (e.g., '24' for 2024).
   */
  private getCurrentYear(): string {
    return new Date().getFullYear().toString().slice(-2);
  }
}
