import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../database/db.service';
import { NewUser, UpdateUser, User, UserRole, UserStatus } from './user.model';
import { Context } from '../../bot/bot.types';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private dbService: DbService) {}

  async getOrCreateUserWithCtx(ctx: Context): Promise<User> {
    const id = String(ctx.from.id);

    if (!id) {
      throw new Error('id must be provided');
    }

    let user: User | undefined;

    if (id) {
      user = await this.dbService.db
        .selectFrom('user')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();
    }

    if (user) {
      const updateData: Partial<User> = {};
      let needsUpdate = false;

      const fieldsToUpdate = [
        { key: 'username', ctxKey: 'username' },
        { key: 'firstName', ctxKey: 'first_name' },
        { key: 'lastName', ctxKey: 'last_name' },
        { key: 'languageCode', ctxKey: 'language_code' },
      ] as const;

      for (const field of fieldsToUpdate) {
        if (user[field.key] !== ctx.from[field.ctxKey]) {
          updateData[field.key] = ctx.from[field.ctxKey] ?? null;
          needsUpdate = true;
        }
      }

      // Always update lastActiveDate
      updateData.lastActiveDate = new Date();
      updateData.updatedAt = new Date();
      needsUpdate = true;

      if (needsUpdate) {
        user = await this.dbService.db
          .updateTable('user')
          .set(updateData)
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirstOrThrow();
      }
    }

    if (user) {
      return user;
    }

    const newUser: NewUser = {
      id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name ?? null,
      lastName: ctx.from.last_name ?? null,
      languageCode: ctx.from.language_code ?? null,
      role: UserRole.GENERAL,
      status: UserStatus.ACTIVE,
      hasPrivateChat: ctx.chat?.type === 'private' || false,
      lastActiveDate: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const insertedUser = await this.dbService.db
      .insertInto('user')
      .values(newUser)
      .returningAll()
      .executeTakeFirstOrThrow();

    this.logger.log(`New user created: ${insertedUser.id}`);

    return insertedUser;
  }

  async updateUser(userId: string, userParams: Partial<UpdateUser>) {
    try {
      const existingUser = await this.dbService.db
        .selectFrom('user')
        .selectAll()
        .where('id', '=', userId)
        .executeTakeFirst();

      if (!existingUser) {
        this.logger.error(`User not found: ${userId}`);
        throw new Error('User not found');
      }

      const updatedUser = await this.dbService.db
        .updateTable('user')
        .set(userParams)
        .where('id', '=', userId)
        .returningAll()
        .executeTakeFirst();

      this.logger.debug(`Updated user: ${userId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error in updateUser: ${error.message}`, error.stack);
      throw error;
    }
  }
}
