import { Branch } from '@modules/branches/entities/branch.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Service } from '@modules/services/entities/service.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';

export interface CountData {
  title: string;
  subtitle: string;
  count: number;
  icon: string;
  link: string;
}

export interface DashboardData {
  counts: CountData[];
  latestBranches: Branch[];
  latestServices: Service[];
  latestStaffs: Staff[];
  latestMembers: Member[];
  latestEquipments: Equipment[];
}
