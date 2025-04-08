import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Service } from '@modules/services/entities/service.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { CountData, DashboardData } from '@interface/dashboard';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Branch)
    private _branchRepository: Repository<Branch>,

    @InjectRepository(Service)
    private _serviceRepository: Repository<Service>,

    @InjectRepository(Staff)
    private _staffRepository: Repository<Staff>,

    @InjectRepository(Member)
    private _memberRepository: Repository<Member>,

    @InjectRepository(Equipment)
    private _equipmentRepository: Repository<Equipment>,
  ) {}

  async getDashboardStats(): Promise<DashboardData> {
    // Get counts for all entities
    const [branchCount, serviceCount, staffCount, memberCount, equipmentCount] =
      await Promise.all([
        this._branchRepository.count(),
        this._serviceRepository.count(),
        this._staffRepository.count(),
        this._memberRepository.count(),
        this._equipmentRepository.count(),
      ]);

    // Get latest entities
    const [
      latestBranches,
      latestServices,
      latestStaffs,
      latestMembers,
      latestEquipments,
    ] = await Promise.all([
      this._branchRepository.find({
        order: { created_at: 'DESC' },
        take: 3,
      }),
      this._serviceRepository.find({
        order: { created_at: 'DESC' },
        take: 3,
      }),
      this._staffRepository.find({
        order: { created_at: 'DESC' },
        take: 3,
      }),
      this._memberRepository.find({
        order: { created_at: 'DESC' },
        take: 3,
      }),
      this._equipmentRepository.find({
        order: { created_at: 'DESC' },
        take: 5,
      }),
    ]);

    // Create count data array with consistent structure
    const counts: CountData[] = [
      {
        title: 'Branches',
        subtitle: 'Our Locations',
        count: branchCount,
        icon: './assets/icons/heroicons/solid/building-office-2.svg',
        link: '/admin/branches',
      },
      {
        title: 'Services',
        subtitle: 'Services We Provide',
        count: serviceCount,
        icon: './assets/icons/heroicons/solid/wrench-screwdriver.svg',
        link: '/admin/services',
      },
      {
        title: 'Staffs',
        subtitle: 'Our Team Members',
        count: staffCount,
        icon: './assets/icons/heroicons/solid/user-group.svg',
        link: '/admin/staffs',
      },
      {
        title: 'Members',
        subtitle: 'Registered Members',
        count: memberCount,
        icon: './assets/icons/heroicons/solid/users.svg',
        link: '/admin/members',
      },
      {
        title: 'Equipments',
        subtitle: 'Available Equipments',
        count: equipmentCount,
        icon: './assets/icons/heroicons/solid/swatch.svg',
        link: '/admin/equipments',
      },
    ];

    return {
      counts,
      latestBranches,
      latestServices,
      latestStaffs,
      latestMembers,
      latestEquipments,
    };
  }
}
