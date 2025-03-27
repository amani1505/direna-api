import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private _addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto, userId: string) {
    try {
      // If the new address is set as default
      if (createAddressDto.is_default) {
        // Find and update existing default address
        await this.unsetPreviousDefaultAddress(userId);
      }

      // Create new address
      const newAddress = this._addressRepository.create({
        ...createAddressDto,
        user: { id: userId },
      });
      return await this._addressRepository.save(newAddress);
    } catch (error) {
      throw new HttpException(
        `Failed to create address: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(userId: string) {
    try {
      return await this._addressRepository.find({
        where: { user: { id: userId } },
        order: { is_default: 'DESC' },
      });
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve addresses: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const address = await this._addressRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      return address;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve address: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, userId: string) {
    try {
      // Verify address exists and belongs to user
      const existingAddress = await this.findOne(id, userId);

      // If updating to set as default
      if (updateAddressDto.is_default) {
        // Unset previous default address
        await this.unsetPreviousDefaultAddress(userId);
      }

      // Update the specific address
      return await this._addressRepository.save({
        ...existingAddress,
        ...updateAddressDto,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to update address: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Verify address exists and belongs to user
      const address = await this.findOne(id, userId);

      // Check if this is the only/default address
      const userAddresses = await this.findAll(userId);
      if (userAddresses.length === 1 || address.is_default) {
        throw new HttpException(
          'Cannot delete the only or default address',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._addressRepository.remove(address);
      return { message: 'Address successfully deleted' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete address: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async unsetPreviousDefaultAddress(userId: string) {
    // Find and update all previous default addresses to false for this user
    await this._addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ is_default: false })
      .where('is_default = :isDefault AND user.id = :userId', {
        isDefault: true,
        userId,
      })
      .execute();
  }
}
