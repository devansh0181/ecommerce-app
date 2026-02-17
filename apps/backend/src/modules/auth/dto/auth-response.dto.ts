import { UserRole } from '../../../common/enums/user-role.enum';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}