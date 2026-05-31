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

export const usersDataset: UserRecord[] = [
  { id: 1,  name: 'Alice Johnson',   email: 'alice@example.com',    age: 28, status: 'active',   createdAt: '2023-01-15', tags: ['admin', 'beta'],          isVerified: true  },
  { id: 2,  name: 'Bob Smith',       email: 'bob@example.com',      age: 34, status: 'inactive', createdAt: '2022-07-22', tags: ['user'],                   isVerified: false },
  { id: 3,  name: 'Carol White',     email: 'carol@example.com',    age: 22, status: 'pending',  createdAt: '2024-03-01', tags: ['beta', 'tester'],         isVerified: false },
  { id: 4,  name: 'David Brown',     email: 'david@example.com',    age: 45, status: 'active',   createdAt: '2021-11-30', tags: ['admin'],                  isVerified: true  },
  { id: 5,  name: 'Eva Martinez',    email: 'eva@example.com',      age: 31, status: 'active',   createdAt: '2023-06-18', tags: ['user', 'premium'],        isVerified: true  },
  { id: 6,  name: 'Frank Lee',       email: 'frank@example.com',    age: 19, status: 'pending',  createdAt: '2024-01-05', tags: [],                         isVerified: false },
  { id: 7,  name: 'Grace Kim',       email: 'grace@example.com',    age: 27, status: 'active',   createdAt: '2022-09-14', tags: ['premium'],                isVerified: true  },
  { id: 8,  name: 'Henry Davis',     email: 'henry@example.com',    age: 52, status: 'inactive', createdAt: '2020-04-20', tags: ['user'],                   isVerified: true  },
  { id: 9,  name: 'Iris Wilson',     email: 'iris@example.com',     age: 24, status: 'active',   createdAt: '2023-12-11', tags: ['beta'],                   isVerified: false },
  { id: 10, name: 'Jack Taylor',     email: 'jack@example.com',     age: 38, status: 'active',   createdAt: '2021-08-03', tags: ['admin', 'user'],          isVerified: true  },
  { id: 11, name: 'Karen Anderson',  email: 'karen@example.com',    age: 29, status: 'inactive', createdAt: '2022-02-28', tags: ['tester'],                 isVerified: false },
  { id: 12, name: 'Leo Thomas',      email: 'leo@example.com',      age: 41, status: 'pending',  createdAt: '2024-05-17', tags: ['user', 'beta'],           isVerified: false },
  { id: 13, name: 'Mia Jackson',     email: 'mia@example.com',      age: 33, status: 'active',   createdAt: '2023-03-25', tags: ['premium', 'admin'],       isVerified: true  },
  { id: 14, name: 'Noah Harris',     email: 'noah@example.com',     age: 26, status: 'active',   createdAt: '2022-10-09', tags: ['user'],                   isVerified: true  },
  { id: 15, name: 'Olivia Martin',   email: 'olivia@example.com',   age: 18, status: 'pending',  createdAt: '2024-07-02', tags: ['tester', 'beta'],         isVerified: false },
  { id: 16, name: 'Paul Garcia',     email: 'paul@example.com',     age: 47, status: 'inactive', createdAt: '2019-12-01', tags: [],                         isVerified: false },
  { id: 17, name: 'Quinn Rodriguez', email: 'quinn@example.com',    age: 35, status: 'active',   createdAt: '2023-09-30', tags: ['premium'],                isVerified: true  },
  { id: 18, name: 'Rachel Lewis',    email: 'rachel@example.com',   age: 23, status: 'active',   createdAt: '2024-02-14', tags: ['user', 'tester'],         isVerified: false },
  { id: 19, name: 'Sam Walker',      email: 'sam@example.com',      age: 60, status: 'inactive', createdAt: '2018-06-06', tags: ['admin'],                  isVerified: true  },
  { id: 20, name: 'Tina Hall',       email: 'tina@example.com',     age: 30, status: 'active',   createdAt: '2023-11-20', tags: ['premium', 'beta', 'user'], isVerified: true  },
  { id: 21, name: 'Uma Young',       email: 'uma@example.com',      age: 21, status: 'pending',  createdAt: '2024-08-08', tags: ['tester'],                 isVerified: false },
  { id: 22, name: 'Victor Allen',    email: 'victor@example.com',   age: 55, status: 'active',   createdAt: '2020-01-17', tags: ['admin', 'premium'],       isVerified: true  },
];
