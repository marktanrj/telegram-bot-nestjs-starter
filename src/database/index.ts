import { CacheTable } from '../modules/cache/cache.model';
import { UserTable } from '../modules/user/user.model';

export interface Database {
  cache: CacheTable;
  user: UserTable;
}
