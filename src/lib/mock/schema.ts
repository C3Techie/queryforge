import type { Schema } from '@/types/query';

export const usersSchema: Schema = {
  name: 'Users',
  fields: [
    { name: 'id',         type: 'number' },
    { name: 'name',       type: 'string' },
    { name: 'email',      type: 'string' },
    { name: 'age',        type: 'number' },
    { name: 'status',     type: 'enum', options: ['active', 'inactive', 'pending'] },
    { name: 'createdAt',  type: 'date' },
    { name: 'tags',       type: 'array' },
    { name: 'isVerified', type: 'boolean' },
  ],
};

export const schemas: Schema[] = [usersSchema];
