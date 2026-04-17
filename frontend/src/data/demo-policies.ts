// Demo policy data for AgroShield
export interface DemoPolicy {
  id: string
  cropType: string
  location: {
    name: string
    lat: number
    lon: number
    region: string
  }
  coverageAmount: string // in cUSD
  rainfallThreshold: string // in mm
  measurementPeriod: string // in days
  premium: string // in cUSD
  farmer: {
    name: string
    wallet: string
  }
  status: 'active' | 'expired' | 'claimed'
  createdAt: Date
  expiresAt: Date
}

export const DEMO_POLICIES: DemoPolicy[] = [
  {
    id: '1',
    cropType: 'Maize',
    location: {
      name: 'Kitale',
      lat: 1.0152,
      lon: 35.0069,
      region: 'Trans-Nzoia County'
    },
    coverageAmount: '1000',
    rainfallThreshold: '50',
    measurementPeriod: '90',
    premium: '100',
    farmer: {
      name: 'John Kamau',
      wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9'
    },
    status: 'active',
    createdAt: new Date('2024-01-15'),
    expiresAt: new Date('2024-04-15')
  },
  {
    id: '2',
    cropType: 'Coffee',
    location: {
      name: 'Nyeri',
      lat: -0.4239,
      lon: 36.9513,
      region: 'Nyeri County'
    },
    coverageAmount: '2500',
    rainfallThreshold: '80',
    measurementPeriod: '120',
    premium: '250',
    farmer: {
      name: 'Mary Wanjiru',
      wallet: '0x8ba1f109551bD432803012645Hac136c'
    },
    status: 'active',
    createdAt: new Date('2024-02-01'),
    expiresAt: new Date('2024-06-01')
  },
  {
    id: '3',
    cropType: 'Tea',
    location: {
      name: 'Kericho',
      lat: -0.3677,
      lon: 35.2850,
      region: 'Kericho County'
    },
    coverageAmount: '3000',
    rainfallThreshold: '100',
    measurementPeriod: '150',
    premium: '300',
    farmer: {
      name: 'David Kiprop',
      wallet: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed'
    },
    status: 'active',
    createdAt: new Date('2024-01-20'),
    expiresAt: new Date('2024-06-20')
  },
  {
    id: '4',
    cropType: 'Rice',
    location: {
      name: 'Mwea',
      lat: -0.7833,
      lon: 37.3833,
      region: 'Kirinyaga County'
    },
    coverageAmount: '1500',
    rainfallThreshold: '120',
    measurementPeriod: '100',
    premium: '150',
    farmer: {
      name: 'Grace Mwangi',
      wallet: '0x1672a41cEeD8D0C5BAA855672F2B631F65Ca84b4'
    },
    status: 'active',
    createdAt: new Date('2024-03-01'),
    expiresAt: new Date('2024-06-09')
  },
  {
    id: '5',
    cropType: 'Wheat',
    location: {
      name: 'Narok',
      lat: -1.0789,
      lon: 35.8617,
      region: 'Narok County'
    },
    coverageAmount: '2000',
    rainfallThreshold: '60',
    measurementPeriod: '110',
    premium: '200',
    farmer: {
      name: 'Samuel Olekina',
      wallet: '0x9b8e8d9b8C8d8b8C8d8b8C8d8b8C8d8b8C8d8b8'
    },
    status: 'active',
    createdAt: new Date('2024-02-15'),
    expiresAt: new Date('2024-06-15')
  }
]

export const KENYA_REGIONS = [
  { name: 'Trans-Nzoia', lat: 1.0152, lon: 35.0069, mainCrop: 'Maize' },
  { name: 'Nyeri', lat: -0.4239, lon: 36.9513, mainCrop: 'Coffee' },
  { name: 'Kericho', lat: -0.3677, lon: 35.2850, mainCrop: 'Tea' },
  { name: 'Kirinyaga', lat: -0.7833, lon: 37.3833, mainCrop: 'Rice' },
  { name: 'Narok', lat: -1.0789, lon: 35.8617, mainCrop: 'Wheat' },
  { name: 'Bungoma', lat: 0.5635, lon: 34.5605, mainCrop: 'Sugarcane' },
  { name: 'Kisumu', lat: -0.0917, lon: 34.7678, mainCrop: 'Cotton' },
  { name: 'Eldoret', lat: 0.5143, lon: 35.2698, mainCrop: 'Maize' },
  { name: 'Nakuru', lat: -0.3031, lon: 36.0695, mainCrop: 'Wheat' },
  { name: 'Meru', lat: 0.0470, lon: 37.6526, mainCrop: 'Coffee' }
]
