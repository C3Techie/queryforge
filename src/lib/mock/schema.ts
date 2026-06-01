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
  relations: [
    { name: 'orders', targetSchema: 'Orders', localField: 'id', foreignField: 'customerId' },
    { name: 'reviews', targetSchema: 'Reviews', localField: 'id', foreignField: 'userId' },
  ],
};

export const productsSchema: Schema = {
  name: 'Products',
  fields: [
    { name: 'id',          type: 'number' },
    { name: 'name',        type: 'string' },
    { name: 'category',    type: 'enum', options: ['electronics', 'clothing', 'food', 'books', 'sports', 'home'] },
    { name: 'price',       type: 'number' },
    { name: 'stock',       type: 'number' },
    { name: 'rating',      type: 'number' },
    { name: 'isAvailable', type: 'boolean' },
    { name: 'tags',        type: 'array' },
    { name: 'createdAt',   type: 'date' },
  ],
  relations: [
    { name: 'orders', targetSchema: 'Orders', localField: 'id', foreignField: 'productId' },
    { name: 'reviews', targetSchema: 'Reviews', localField: 'id', foreignField: 'productId' },
    { name: 'inventory', targetSchema: 'Inventory', localField: 'id', foreignField: 'productId' },
  ],
};

export const ordersSchema: Schema = {
  name: 'Orders',
  fields: [
    { name: 'id',         type: 'number' },
    { name: 'customerId', type: 'number' },   // FK → Users.id
    { name: 'productId',  type: 'number' },   // FK → Products.id
    { name: 'quantity',   type: 'number' },
    { name: 'total',      type: 'number' },
    { name: 'status',     type: 'enum', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
    { name: 'isPaid',     type: 'boolean' },
    { name: 'createdAt',  type: 'date' },
    { name: 'region',     type: 'enum', options: ['north', 'south', 'east', 'west', 'central'] },
  ],
  relations: [
    { name: 'customer', targetSchema: 'Users', localField: 'customerId', foreignField: 'id' },
    { name: 'product', targetSchema: 'Products', localField: 'productId', foreignField: 'id' },
  ],
};

export const reviewsSchema: Schema = {
  name: 'Reviews',
  fields: [
    { name: 'id',        type: 'number' },
    { name: 'userId',    type: 'number' },   // FK → Users.id
    { name: 'productId', type: 'number' },   // FK → Products.id
    { name: 'rating',    type: 'number' },
    { name: 'title',     type: 'string' },
    { name: 'body',      type: 'string' },
    { name: 'isVerified', type: 'boolean' },
    { name: 'createdAt', type: 'date' },
  ],
  relations: [
    { name: 'user', targetSchema: 'Users', localField: 'userId', foreignField: 'id' },
    { name: 'product', targetSchema: 'Products', localField: 'productId', foreignField: 'id' },
  ],
};

export const inventorySchema: Schema = {
  name: 'Inventory',
  fields: [
    { name: 'id',          type: 'number' },
    { name: 'productId',   type: 'number' },   // FK → Products.id
    { name: 'warehouse',   type: 'enum', options: ['WH-A', 'WH-B', 'WH-C', 'WH-D'] },
    { name: 'quantity',    type: 'number' },
    { name: 'reorderLevel', type: 'number' },
    { name: 'lastRestocked', type: 'date' },
    { name: 'isActive',    type: 'boolean' },
  ],
  relations: [
    { name: 'product', targetSchema: 'Products', localField: 'productId', foreignField: 'id' },
  ],
};

export const schemas: Schema[] = [
  usersSchema,
  productsSchema,
  ordersSchema,
  reviewsSchema,
  inventorySchema,
];
