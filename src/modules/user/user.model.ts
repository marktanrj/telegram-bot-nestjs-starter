import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export enum UserRole {
  GENERAL = 'GENERAL',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export interface UserTable {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string | null;
  role: UserRole;
  status: UserStatus;
  hasPrivateChat: boolean;
  lastActiveDate: Date;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
  createdAt: ColumnType<Date, Date | null, Date | null>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;
