function pad(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

function makeDate(baseYear: number, id: number): string {
  const year = baseYear + (id % 5);
  const month = pad(1 + (id % 12));
  const day = pad(1 + (id % 28));
  return `${year}-${month}-${day}`;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  tags: string[];
  isVerified: boolean;
}

const firstNames = ['Alice','Bob','Carol','David','Eva','Frank','Grace','Henry','Iris','Jack','Karen','Leo','Mia','Noah','Olivia','Paul','Quinn','Rachel','Sam','Tina','Uma','Victor','Wendy','Xander','Yara','Zoe','Aaron','Bella','Carlos','Diana','Ethan','Fiona','George','Hannah','Ivan','Julia','Kevin','Laura','Mike','Nina','Oscar','Petra','Ravi','Sofia','Tom','Ursula','Vince','Willa','Xena','Yusuf'];
const lastNames  = ['Johnson','Smith','White','Brown','Martinez','Lee','Kim','Davis','Taylor','Harris','Jackson','Thomas','Garcia','Wilson','Anderson','Moore','Martin','Thompson','Robinson','Clark','Lewis','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Morris','Rogers','Reed','Cook','Morgan','Bell'];
const tagPool    = ['admin','beta','tester','user','premium','vip','trial','staff','partner','guest'];
const userStatuses: UserRecord['status'][] = ['active','inactive','pending'];

export const usersDataset: UserRecord[] = Array.from({ length: 220 }, (_, i) => {
  const id = i + 1;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 3) % lastNames.length];
  const numTags = id % 4;
  const tagStart = id % tagPool.length;
  return {
    id,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${id}@example.com`,
    age: 18 + (id * 7 % 47),
    status: userStatuses[id % 3],
    createdAt: makeDate(2018, id),
    tags: tagPool.slice(tagStart, tagStart + numTags),
    isVerified: id % 3 !== 0,
  };
});

export interface ProductRecord {
  id: number;
  name: string;
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'sports' | 'home';
  price: number;
  stock: number;
  rating: number;
  isAvailable: boolean;
  tags: string[];
  createdAt: string;
}

const productNames = ['Laptop Pro','Wireless Mouse','USB-C Hub','Mechanical Keyboard','4K Monitor','Headphones','Webcam HD','Standing Desk','Ergonomic Chair','LED Lamp','Running Shoes','Yoga Mat','Protein Powder','Water Bottle','Resistance Bands','Dumbbell Set','Jump Rope','Foam Roller','Sports Bag','Compression Socks','Cotton T-Shirt','Denim Jeans','Hoodie','Sneakers','Dress Shirt','Chino Pants','Winter Jacket','Baseball Cap','Leather Belt','Wool Socks','Rice Cooker','Coffee Maker','Air Fryer','Blender','Toaster Oven','Instant Pot','Food Processor','Electric Kettle','Waffle Maker','Sandwich Press','JavaScript Book','Python Cookbook','Design Patterns','Clean Code','Pragmatic Programmer','Refactoring','System Design','Database Internals','Algorithms','Operating Systems'];
const productCategories: ProductRecord['category'][] = ['electronics','clothing','food','books','sports','home'];
const productTags = ['new','sale','featured','bestseller','limited','eco','premium','budget'];

export const productsDataset: ProductRecord[] = Array.from({ length: 210 }, (_, i) => {
  const id = i + 1;
  const baseName = productNames[i % productNames.length];
  const suffix = i >= productNames.length ? ` v${Math.floor(i / productNames.length) + 1}` : '';
  const stock = (id * 17) % 500;
  const numTags = id % 3;
  const tagStart = id % productTags.length;
  return {
    id,
    name: `${baseName}${suffix}`,
    category: productCategories[id % productCategories.length],
    price: Math.round((9.99 + (id * 13.7) % 990) * 100) / 100,
    stock,
    rating: Math.round((1 + (id * 0.037) % 4) * 10) / 10,
    isAvailable: stock > 0,
    tags: productTags.slice(tagStart, tagStart + numTags),
    createdAt: makeDate(2020, id),
  };
});

export interface OrderRecord {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  createdAt: string;
  region: 'north' | 'south' | 'east' | 'west' | 'central';
}

const orderStatuses: OrderRecord['status'][] = ['pending','processing','shipped','delivered','cancelled'];
const regions: OrderRecord['region'][] = ['north','south','east','west','central'];

export const ordersDataset: OrderRecord[] = Array.from({ length: 230 }, (_, i) => {
  const id = i + 1;
  const customerId = 1 + (id * 3 % 220);
  const productId  = 1 + (id * 7 % 210);
  const product    = productsDataset[productId - 1];
  const quantity   = 1 + (id % 10);
  const total      = Math.round(quantity * product.price * 100) / 100;
  const status     = orderStatuses[id % orderStatuses.length];
  return {
    id,
    customerId,
    productId,
    quantity,
    total,
    status,
    isPaid: status === 'delivered' || status === 'shipped' || id % 4 !== 0,
    createdAt: makeDate(2021, id),
    region: regions[id % regions.length],
  };
});

export interface ReviewRecord {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  createdAt: string;
}

const reviewTitles = ['Great product!','Highly recommend','Not what I expected','Excellent quality','Good value','Could be better','Amazing!','Disappointed','Perfect fit','Works as described','Solid purchase','Would buy again','Mediocre at best','Exceeded expectations','Just okay'];
const reviewBodies = ['Really happy with this purchase.','Delivery was fast and product is great.','Quality is not as advertised.','Exactly what I needed.','Good for the price.','Had some issues but overall fine.','Best purchase this year.','Returned it after a week.','Fits perfectly and looks great.','Does exactly what it says.','Sturdy and well-made.','Will definitely order again.','Nothing special about it.','Blew my expectations away.','It is fine, nothing more.'];

export const reviewsDataset: ReviewRecord[] = Array.from({ length: 215 }, (_, i) => {
  const id = i + 1;
  const userId    = 1 + (id * 5 % 220);
  const productId = 1 + (id * 9 % 210);
  const user      = usersDataset[userId - 1];
  return {
    id,
    userId,
    productId,
    rating: 1 + (id % 5),
    title: reviewTitles[id % reviewTitles.length],
    body: reviewBodies[id % reviewBodies.length],
    isVerified: user.isVerified,
    createdAt: makeDate(2022, id),
  };
});

export interface InventoryRecord {
  id: number;
  productId: number;
  warehouse: 'WH-A' | 'WH-B' | 'WH-C' | 'WH-D';
  quantity: number;
  reorderLevel: number;
  lastRestocked: string;
  isActive: boolean;
}

const warehouses: InventoryRecord['warehouse'][] = ['WH-A','WH-B','WH-C','WH-D'];

export const inventoryDataset: InventoryRecord[] = Array.from({ length: 205 }, (_, i) => {
  const id = i + 1;
  const productId = 1 + (id % 210);
  const quantity  = (id * 11) % 300;
  return {
    id,
    productId,
    warehouse: warehouses[id % warehouses.length],
    quantity,
    reorderLevel: 10 + (id % 40),
    lastRestocked: makeDate(2023, id),
    isActive: quantity > 0,
  };
});

export const datasetMap: Record<string, Record<string, unknown>[]> = {
  Users:     usersDataset     as unknown as Record<string, unknown>[],
  Products:  productsDataset  as unknown as Record<string, unknown>[],
  Orders:    ordersDataset    as unknown as Record<string, unknown>[],
  Reviews:   reviewsDataset   as unknown as Record<string, unknown>[],
  Inventory: inventoryDataset as unknown as Record<string, unknown>[],
};
