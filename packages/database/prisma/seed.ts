import bcrypt from 'bcryptjs'
import {
  BusinessType,
  MerchantOrderStatus,
  MerchantVerificationStatus,
  PrismaClient,
  ProductStatus,
  UserRole,
} from '../generated/client'

const prisma = new PrismaClient()
const DEMO_PASSWORD = 'Password123!'
const TEMP_AUTH_TEST_EMAILS = [
  'customer@bharatmart.test',
  'merchant@bharatmart.test',
  'admin@bharatmart.test',
]

type SeedProduct = {
  merchantSlug: string
  categorySlug: string
  name: string
  slug: string
  description: string
  priceInPence: number
  stockQuantity: number
  sku: string
  imageCount?: number
}

const categories = [
  {
    name: 'Pooja & Festival',
    slug: 'pooja-festival',
    iconUrl: 'https://picsum.photos/seed/pooja-festival/160/160',
    sortOrder: 1,
    children: [
      { name: 'Diyas', slug: 'diyas', sortOrder: 1 },
      { name: 'Rangoli', slug: 'rangoli', sortOrder: 2 },
    ],
  },
  {
    name: 'Indian Groceries',
    slug: 'indian-groceries',
    iconUrl: 'https://picsum.photos/seed/indian-groceries/160/160',
    sortOrder: 2,
    children: [
      { name: 'Rice, Flour & Pulses', slug: 'rice-flour-pulses', sortOrder: 1 },
      { name: 'Spices & Masalas', slug: 'spices-masalas', sortOrder: 2 },
    ],
  },
  {
    name: 'Fashion & Jewellery',
    slug: 'fashion-jewellery',
    iconUrl: 'https://picsum.photos/seed/fashion-jewellery/160/160',
    sortOrder: 3,
    children: [
      { name: 'Traditional Clothing', slug: 'traditional-clothing', sortOrder: 1 },
      { name: 'Jewellery & Accessories', slug: 'jewellery-accessories', sortOrder: 2 },
    ],
  },
] as const

const merchants = [
  {
    email: 'ganesh.grocers@bharatmart.uk',
    name: 'Arjun Mehta',
    phone: '+44 7700 900101',
    businessName: 'Shree Ganesh Grocers Ltd',
    businessType: BusinessType.GROCERY,
    registrationNumber: 'UK-GG-10001',
    storeName: 'Shree Ganesh Grocers',
    storeSlug: 'shree-ganesh-grocers',
    storeDescription:
      'A family-run London grocer stocking trusted Indian pantry staples, fresh festival essentials and everyday household favourites.',
    deliveryPostcodes: ['E1', 'E2', 'E3', 'E14'],
  },
  {
    email: 'spiceroute@bharatmart.uk',
    name: 'Priya Nair',
    phone: '+44 7700 900102',
    businessName: 'Spice Route UK Ltd',
    businessType: BusinessType.GROCERY,
    registrationNumber: 'UK-SR-10002',
    storeName: 'Spice Route UK',
    storeSlug: 'spice-route-uk',
    storeDescription:
      'Small-batch masalas, regional spices and premium ingredients sourced from specialist producers across India.',
    deliveryPostcodes: ['B1', 'B2', 'B3', 'B15'],
  },
  {
    email: 'divine.pooja@bharatmart.uk',
    name: 'Ravi Iyer',
    phone: '+44 7700 900103',
    businessName: 'Divine Pooja Supplies Ltd',
    businessType: BusinessType.TEMPLE_STORE,
    registrationNumber: 'UK-DP-10003',
    storeName: 'Divine Pooja Store',
    storeSlug: 'divine-pooja-store',
    storeDescription:
      'Carefully selected pooja, temple and festival supplies for homes and community celebrations throughout the UK.',
    deliveryPostcodes: ['HA0', 'HA1', 'HA2', 'UB1'],
  },
  {
    email: 'vastra.gems@bharatmart.uk',
    name: 'Kavita Shah',
    phone: '+44 7700 900104',
    businessName: 'Vastra & Gems Ltd',
    businessType: BusinessType.CLOTHING,
    registrationNumber: 'UK-VG-10004',
    storeName: 'Vastra & Gems',
    storeSlug: 'vastra-and-gems',
    storeDescription:
      'Contemporary Indian occasionwear, artisan jewellery and accessories chosen for weddings, festivals and gifting.',
    deliveryPostcodes: ['LE1', 'LE2', 'LE3', 'LE5'],
  },
] as const

const products: SeedProduct[] = [
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'rice-flour-pulses',
    name: 'Premium Aged Basmati Rice 5kg',
    slug: 'premium-aged-basmati-rice-5kg',
    description: 'Extra-long grain aged basmati rice with a delicate aroma and fluffy texture.',
    priceInPence: 1299,
    stockQuantity: 48,
    sku: 'SGG-RICE-001',
    imageCount: 3,
  },
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'rice-flour-pulses',
    name: 'Stoneground Chakki Atta 5kg',
    slug: 'stoneground-chakki-atta-5kg',
    description: 'Whole-wheat chakki atta for soft rotis, chapatis and everyday baking.',
    priceInPence: 599,
    stockQuantity: 62,
    sku: 'SGG-ATTA-002',
  },
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'rice-flour-pulses',
    name: 'Toor Dal 2kg',
    slug: 'toor-dal-2kg',
    description: 'Cleaned split pigeon peas, ideal for dal tadka and South Indian sambar.',
    priceInPence: 649,
    stockQuantity: 34,
    sku: 'SGG-DAL-003',
  },
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'spices-masalas',
    name: 'Mumbai Chaat Masala 100g',
    slug: 'mumbai-chaat-masala-100g',
    description: 'Tangy chaat masala for fruit, snacks, salads and street-food favourites.',
    priceInPence: 229,
    stockQuantity: 80,
    sku: 'SGG-SPICE-004',
  },
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'diyas',
    name: 'Clay Diya Set of 12',
    slug: 'clay-diya-set-12',
    description: 'Traditional reusable clay diyas for Diwali, Navratri and home pooja.',
    priceInPence: 499,
    stockQuantity: 25,
    sku: 'SGG-POOJA-005',
  },
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'rangoli',
    name: 'Festival Rangoli Colour Set',
    slug: 'festival-rangoli-colour-set',
    description: 'Eight vibrant, easy-flow colours for traditional entrance rangoli designs.',
    priceInPence: 749,
    stockQuantity: 19,
    sku: 'SGG-POOJA-006',
  },
  {
    merchantSlug: 'shree-ganesh-grocers',
    categorySlug: 'spices-masalas',
    name: 'Homestyle Mango Pickle 500g',
    slug: 'homestyle-mango-pickle-500g',
    description: 'A robust North Indian mango pickle matured with mustard oil and spices.',
    priceInPence: 399,
    stockQuantity: 41,
    sku: 'SGG-PICKLE-007',
  },
  {
    merchantSlug: 'spice-route-uk',
    categorySlug: 'spices-masalas',
    name: 'Kerala Garam Masala 100g',
    slug: 'kerala-garam-masala-100g',
    description: 'Freshly ground aromatic spice blend with cardamom, clove and cinnamon.',
    priceInPence: 349,
    stockQuantity: 55,
    sku: 'SRU-MASALA-001',
    imageCount: 3,
  },
  {
    merchantSlug: 'spice-route-uk',
    categorySlug: 'spices-masalas',
    name: 'Kashmiri Chilli Powder 200g',
    slug: 'kashmiri-chilli-powder-200g',
    description: 'Vivid red chilli powder delivering rich colour with gentle warmth.',
    priceInPence: 429,
    stockQuantity: 46,
    sku: 'SRU-SPICE-002',
  },
  {
    merchantSlug: 'spice-route-uk',
    categorySlug: 'spices-masalas',
    name: 'Madras Curry Powder 200g',
    slug: 'madras-curry-powder-200g',
    description: 'A balanced South Indian-style curry blend with a warming finish.',
    priceInPence: 399,
    stockQuantity: 38,
    sku: 'SRU-SPICE-003',
  },
  {
    merchantSlug: 'spice-route-uk',
    categorySlug: 'rice-flour-pulses',
    name: 'Organic Chana Dal 1kg',
    slug: 'organic-chana-dal-1kg',
    description: 'Nutty split chickpeas for dals, savoury snacks and traditional sweets.',
    priceInPence: 449,
    stockQuantity: 51,
    sku: 'SRU-DAL-004',
  },
  {
    merchantSlug: 'spice-route-uk',
    categorySlug: 'rice-flour-pulses',
    name: 'Idli Rice 2kg',
    slug: 'idli-rice-2kg',
    description: 'Short-grain parboiled rice selected for soft idlis and crisp dosas.',
    priceInPence: 599,
    stockQuantity: 29,
    sku: 'SRU-RICE-005',
  },
  {
    merchantSlug: 'spice-route-uk',
    categorySlug: 'spices-masalas',
    name: 'Whole Green Cardamom 100g',
    slug: 'whole-green-cardamom-100g',
    description: 'Premium fragrant green cardamom pods for chai, biryani and desserts.',
    priceInPence: 899,
    stockQuantity: 22,
    sku: 'SRU-SPICE-006',
  },
  {
    merchantSlug: 'divine-pooja-store',
    categorySlug: 'diyas',
    name: 'Brass Lotus Diya',
    slug: 'brass-lotus-diya',
    description: 'Polished brass lotus diya for daily prayer, gifting and festive decoration.',
    priceInPence: 799,
    stockQuantity: 31,
    sku: 'DPS-DIYA-001',
    imageCount: 3,
  },
  {
    merchantSlug: 'divine-pooja-store',
    categorySlug: 'diyas',
    name: 'Five-Wick Panchmukhi Diya',
    slug: 'five-wick-panchmukhi-diya',
    description: 'Traditional five-wick brass lamp for aarti and auspicious occasions.',
    priceInPence: 1299,
    stockQuantity: 18,
    sku: 'DPS-DIYA-002',
  },
  {
    merchantSlug: 'divine-pooja-store',
    categorySlug: 'diyas',
    name: 'Cotton Diya Wicks Pack of 100',
    slug: 'cotton-diya-wicks-100',
    description: 'Ready-to-use pure cotton wicks suitable for ghee and oil lamps.',
    priceInPence: 249,
    stockQuantity: 90,
    sku: 'DPS-WICK-003',
  },
  {
    merchantSlug: 'divine-pooja-store',
    categorySlug: 'rangoli',
    name: 'Reusable Rangoli Stencil Kit',
    slug: 'reusable-rangoli-stencil-kit',
    description: 'Six reusable stencils for creating neat floral and geometric rangoli patterns.',
    priceInPence: 649,
    stockQuantity: 42,
    sku: 'DPS-RANGOLI-004',
  },
  {
    merchantSlug: 'divine-pooja-store',
    categorySlug: 'rangoli',
    name: 'Decorative Door Toran',
    slug: 'decorative-door-toran',
    description: 'Colourful fabric toran with bells for festive doorways and mandirs.',
    priceInPence: 1199,
    stockQuantity: 16,
    sku: 'DPS-DECOR-005',
  },
  {
    merchantSlug: 'divine-pooja-store',
    categorySlug: 'diyas',
    name: 'Pooja Thali Set',
    slug: 'complete-pooja-thali-set',
    description: 'Stainless steel pooja thali with diya, kumkum holders, bell and incense stand.',
    priceInPence: 1899,
    stockQuantity: 14,
    sku: 'DPS-THALI-006',
  },
  {
    merchantSlug: 'vastra-and-gems',
    categorySlug: 'traditional-clothing',
    name: 'Banarasi Silk Saree - Ruby',
    slug: 'banarasi-silk-saree-ruby',
    description: 'Rich ruby Banarasi-style saree with gold zari motifs and matching blouse piece.',
    priceInPence: 8999,
    stockQuantity: 8,
    sku: 'VAG-SAREE-001',
    imageCount: 3,
  },
  {
    merchantSlug: 'vastra-and-gems',
    categorySlug: 'traditional-clothing',
    name: 'Mens Navy Kurta Set',
    slug: 'mens-navy-kurta-set',
    description: 'Textured navy kurta and ivory pyjama set for weddings and festivals.',
    priceInPence: 5499,
    stockQuantity: 13,
    sku: 'VAG-KURTA-002',
  },
  {
    merchantSlug: 'vastra-and-gems',
    categorySlug: 'traditional-clothing',
    name: 'Girls Festive Lehenga Set',
    slug: 'girls-festive-lehenga-set',
    description: 'Comfortable embroidered lehenga, choli and dupatta set for celebrations.',
    priceInPence: 4299,
    stockQuantity: 11,
    sku: 'VAG-LEHENGA-003',
  },
  {
    merchantSlug: 'vastra-and-gems',
    categorySlug: 'jewellery-accessories',
    name: 'Kundan Necklace and Earring Set',
    slug: 'kundan-necklace-earring-set',
    description: 'Statement kundan-inspired necklace with coordinated drop earrings.',
    priceInPence: 3499,
    stockQuantity: 17,
    sku: 'VAG-JEWEL-004',
    imageCount: 3,
  },
  {
    merchantSlug: 'vastra-and-gems',
    categorySlug: 'jewellery-accessories',
    name: 'Gold-Tone Jhumka Earrings',
    slug: 'gold-tone-jhumka-earrings',
    description: 'Classic gold-tone jhumkas with pearl drops for festive and occasion wear.',
    priceInPence: 1299,
    stockQuantity: 24,
    sku: 'VAG-JEWEL-005',
  },
  {
    merchantSlug: 'vastra-and-gems',
    categorySlug: 'jewellery-accessories',
    name: 'Embroidered Potli Bag',
    slug: 'embroidered-potli-bag',
    description: 'Hand-finished drawstring potli with beadwork and a soft satin lining.',
    priceInPence: 1699,
    stockQuantity: 21,
    sku: 'VAG-ACC-006',
  },
]

async function removePreviousTemporaryAuthSeed() {
  // These records came from seed-auth-test.ts and are superseded by this full demo seed.
  // The merchant must be removed first because the User -> Merchant relation is restrictive.
  await prisma.merchant.deleteMany({
    where: { storeSlug: 'test-grocery' },
  })
  await prisma.user.deleteMany({
    where: { email: { in: TEMP_AUTH_TEST_EMAILS } },
  })
}

async function seedCategories() {
  const result = new Map<string, string>()

  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        iconUrl: category.iconUrl,
        isActive: true,
        sortOrder: category.sortOrder,
        parentId: null,
      },
      create: {
        name: category.name,
        slug: category.slug,
        iconUrl: category.iconUrl,
        isActive: true,
        sortOrder: category.sortOrder,
      },
    })
    result.set(category.slug, parent.id)

    for (const child of category.children) {
      const subcategory = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          parentId: parent.id,
          isActive: true,
          sortOrder: child.sortOrder,
        },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          isActive: true,
          sortOrder: child.sortOrder,
        },
      })
      result.set(child.slug, subcategory.id)
    }
  }

  return result
}

async function seedUsersAndMerchants(passwordHash: string) {
  await prisma.user.upsert({
    where: { email: 'admin@bharatmart.uk' },
    update: {
      name: 'BharatMart Administrator',
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: new Date('2026-01-01T09:00:00.000Z'),
    },
    create: {
      name: 'BharatMart Administrator',
      email: 'admin@bharatmart.uk',
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: new Date('2026-01-01T09:00:00.000Z'),
    },
  })

  const merchantIds = new Map<string, string>()
  for (const merchant of merchants) {
    const user = await prisma.user.upsert({
      where: { email: merchant.email },
      update: {
        name: merchant.name,
        phone: merchant.phone,
        role: UserRole.MERCHANT,
        passwordHash,
        emailVerified: new Date('2026-01-02T09:00:00.000Z'),
      },
      create: {
        name: merchant.name,
        email: merchant.email,
        phone: merchant.phone,
        role: UserRole.MERCHANT,
        passwordHash,
        emailVerified: new Date('2026-01-02T09:00:00.000Z'),
      },
    })

    const record = await prisma.merchant.upsert({
      where: { userId: user.id },
      update: {
        businessName: merchant.businessName,
        businessType: merchant.businessType,
        registrationNumber: merchant.registrationNumber,
        verificationStatus: MerchantVerificationStatus.APPROVED,
        storeName: merchant.storeName,
        storeSlug: merchant.storeSlug,
        storeLogoUrl: `https://picsum.photos/seed/${merchant.storeSlug}-logo/240/240`,
        storeBannerUrl: `https://picsum.photos/seed/${merchant.storeSlug}-banner/1200/400`,
        storeDescription: merchant.storeDescription,
        deliveryPostcodes: [...merchant.deliveryPostcodes],
      },
      create: {
        userId: user.id,
        businessName: merchant.businessName,
        businessType: merchant.businessType,
        registrationNumber: merchant.registrationNumber,
        verificationStatus: MerchantVerificationStatus.APPROVED,
        verificationDocumentUrls: [],
        storeName: merchant.storeName,
        storeSlug: merchant.storeSlug,
        storeLogoUrl: `https://picsum.photos/seed/${merchant.storeSlug}-logo/240/240`,
        storeBannerUrl: `https://picsum.photos/seed/${merchant.storeSlug}-banner/1200/400`,
        storeDescription: merchant.storeDescription,
        deliveryPostcodes: [...merchant.deliveryPostcodes],
      },
    })
    merchantIds.set(merchant.storeSlug, record.id)
  }

  const customerInputs = [
    {
      id: 'seed_address_ananya_home',
      email: 'ananya.patel@bharatmart.uk',
      name: 'Ananya Patel',
      phone: '+44 7700 900201',
      address: {
        label: 'Home',
        line1: '24 Willow Road',
        line2: 'Flat 3B',
        city: 'London',
        postcode: 'E14 8PX',
      },
    },
    {
      id: 'seed_address_rohan_home',
      email: 'rohan.singh@bharatmart.uk',
      name: 'Rohan Singh',
      phone: '+44 7700 900202',
      address: {
        label: 'Home',
        line1: '8 Victoria Terrace',
        line2: null,
        city: 'Birmingham',
        postcode: 'B15 2TT',
      },
    },
  ] as const

  const customers = new Map<string, { id: string; addressId: string }>()
  for (const customer of customerInputs) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {
        name: customer.name,
        phone: customer.phone,
        role: UserRole.CUSTOMER,
        passwordHash,
        emailVerified: new Date('2026-01-03T09:00:00.000Z'),
      },
      create: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: UserRole.CUSTOMER,
        passwordHash,
        emailVerified: new Date('2026-01-03T09:00:00.000Z'),
      },
    })

    const address = await prisma.address.upsert({
      where: { id: customer.id },
      update: {
        userId: user.id,
        ...customer.address,
        country: 'GB',
        isDefault: true,
      },
      create: {
        id: customer.id,
        userId: user.id,
        ...customer.address,
        country: 'GB',
        isDefault: true,
      },
    })
    customers.set(customer.email, { id: user.id, addressId: address.id })
  }

  return { merchantIds, customers }
}

async function seedProducts(
  categoryIds: Map<string, string>,
  merchantIds: Map<string, string>,
) {
  const productRecords = new Map<
    string,
    { id: string; name: string; priceInPence: number; merchantId: string }
  >()

  for (const product of products) {
    const merchantId = merchantIds.get(product.merchantSlug)
    const categoryId = categoryIds.get(product.categorySlug)
    if (!merchantId || !categoryId) {
      throw new Error(`Missing seed relation for product ${product.slug}`)
    }

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        merchantId,
        categoryId,
        name: product.name,
        description: product.description,
        priceInPence: product.priceInPence,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        status: ProductStatus.ACTIVE,
      },
      create: {
        merchantId,
        categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInPence: product.priceInPence,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        status: ProductStatus.ACTIVE,
      },
    })

    productRecords.set(product.slug, {
      id: record.id,
      name: record.name,
      priceInPence: record.priceInPence,
      merchantId,
    })

    const imageCount = product.imageCount ?? 2
    for (let index = 1; index <= imageCount; index += 1) {
      await prisma.productImage.upsert({
        where: { id: `seed_image_${product.slug}_${index}` },
        update: {
          productId: record.id,
          url: `https://picsum.photos/seed/${product.slug}-${index}/600/600`,
          sortOrder: index,
        },
        create: {
          id: `seed_image_${product.slug}_${index}`,
          productId: record.id,
          url: `https://picsum.photos/seed/${product.slug}-${index}/600/600`,
          sortOrder: index,
        },
      })
    }
  }

  return productRecords
}

async function seedOrders(
  customers: Map<string, { id: string; addressId: string }>,
  merchantIds: Map<string, string>,
  productRecords: Map<
    string,
    { id: string; name: string; priceInPence: number; merchantId: string }
  >,
) {
  const orderSeeds = [
    {
      orderNumber: 'BM-2026-000101',
      customerEmail: 'ananya.patel@bharatmart.uk',
      placedAt: new Date('2026-06-15T11:30:00.000Z'),
      deliveryFeeInPence: 399,
      discountInPence: 300,
      groups: [
        {
          merchantSlug: 'shree-ganesh-grocers',
          status: MerchantOrderStatus.DELIVERED,
          trackingNumber: 'RM-BM101-GG',
          courierName: 'Royal Mail',
          shippedAt: new Date('2026-06-16T09:00:00.000Z'),
          deliveredAt: new Date('2026-06-17T14:25:00.000Z'),
          items: [
            { slug: 'premium-aged-basmati-rice-5kg', quantity: 2 },
            { slug: 'stoneground-chakki-atta-5kg', quantity: 1 },
          ],
        },
        {
          merchantSlug: 'divine-pooja-store',
          status: MerchantOrderStatus.DELIVERED,
          trackingNumber: 'DPD-BM101-DP',
          courierName: 'DPD',
          shippedAt: new Date('2026-06-16T10:30:00.000Z'),
          deliveredAt: new Date('2026-06-18T12:05:00.000Z'),
          items: [{ slug: 'brass-lotus-diya', quantity: 2 }],
        },
      ],
    },
    {
      orderNumber: 'BM-2026-000102',
      customerEmail: 'rohan.singh@bharatmart.uk',
      placedAt: new Date('2026-06-28T17:45:00.000Z'),
      deliveryFeeInPence: 299,
      discountInPence: 0,
      groups: [
        {
          merchantSlug: 'spice-route-uk',
          status: MerchantOrderStatus.DELIVERED,
          trackingNumber: 'EVRI-BM102-SR',
          courierName: 'Evri',
          shippedAt: new Date('2026-06-29T08:20:00.000Z'),
          deliveredAt: new Date('2026-06-30T16:40:00.000Z'),
          items: [
            { slug: 'kerala-garam-masala-100g', quantity: 2 },
            { slug: 'kashmiri-chilli-powder-200g', quantity: 1 },
            { slug: 'organic-chana-dal-1kg', quantity: 1 },
          ],
        },
      ],
    },
    {
      orderNumber: 'BM-2026-000103',
      customerEmail: 'ananya.patel@bharatmart.uk',
      placedAt: new Date('2026-07-08T13:20:00.000Z'),
      deliveryFeeInPence: 499,
      discountInPence: 1000,
      groups: [
        {
          merchantSlug: 'vastra-and-gems',
          status: MerchantOrderStatus.SHIPPED,
          trackingNumber: 'DPD-BM103-VG',
          courierName: 'DPD',
          shippedAt: new Date('2026-07-10T10:15:00.000Z'),
          deliveredAt: null,
          items: [
            { slug: 'banarasi-silk-saree-ruby', quantity: 1 },
            { slug: 'gold-tone-jhumka-earrings', quantity: 1 },
          ],
        },
      ],
    },
  ] as const

  for (const orderSeed of orderSeeds) {
    const customer = customers.get(orderSeed.customerEmail)
    if (!customer) throw new Error(`Missing customer ${orderSeed.customerEmail}`)

    const groups = orderSeed.groups.map((group) => {
      const merchantId = merchantIds.get(group.merchantSlug)
      if (!merchantId) throw new Error(`Missing merchant ${group.merchantSlug}`)

      const items = group.items.map((item) => {
        const product = productRecords.get(item.slug)
        if (!product) throw new Error(`Missing product ${item.slug}`)
        return { ...item, product }
      })
      const subtotalInPence = items.reduce(
        (total, item) => total + item.product.priceInPence * item.quantity,
        0,
      )
      return { ...group, merchantId, items, subtotalInPence }
    })
    const subtotal = groups.reduce((total, group) => total + group.subtotalInPence, 0)
    const totalInPence =
      subtotal + orderSeed.deliveryFeeInPence - orderSeed.discountInPence

    const order = await prisma.order.upsert({
      where: { orderNumber: orderSeed.orderNumber },
      update: {
        customerId: customer.id,
        addressId: customer.addressId,
        totalInPence,
        deliveryFeeInPence: orderSeed.deliveryFeeInPence,
        discountInPence: orderSeed.discountInPence,
        placedAt: orderSeed.placedAt,
      },
      create: {
        orderNumber: orderSeed.orderNumber,
        customerId: customer.id,
        addressId: customer.addressId,
        totalInPence,
        deliveryFeeInPence: orderSeed.deliveryFeeInPence,
        discountInPence: orderSeed.discountInPence,
        placedAt: orderSeed.placedAt,
      },
    })

    for (const group of groups) {
      const merchantOrder = await prisma.merchantOrder.upsert({
        where: {
          orderId_merchantId: {
            orderId: order.id,
            merchantId: group.merchantId,
          },
        },
        update: {
          status: group.status,
          subtotalInPence: group.subtotalInPence,
          trackingNumber: group.trackingNumber,
          courierName: group.courierName,
          shippedAt: group.shippedAt,
          deliveredAt: group.deliveredAt,
        },
        create: {
          orderId: order.id,
          merchantId: group.merchantId,
          status: group.status,
          subtotalInPence: group.subtotalInPence,
          trackingNumber: group.trackingNumber,
          courierName: group.courierName,
          shippedAt: group.shippedAt,
          deliveredAt: group.deliveredAt,
        },
      })

      for (const item of group.items) {
        const itemId = `seed_item_${orderSeed.orderNumber}_${item.slug}`
        await prisma.orderItem.upsert({
          where: { id: itemId },
          update: {
            merchantOrderId: merchantOrder.id,
            productId: item.product.id,
            productNameSnapshot: item.product.name,
            priceInPenceSnapshot: item.product.priceInPence,
            quantity: item.quantity,
          },
          create: {
            id: itemId,
            merchantOrderId: merchantOrder.id,
            productId: item.product.id,
            productNameSnapshot: item.product.name,
            priceInPenceSnapshot: item.product.priceInPence,
            quantity: item.quantity,
          },
        })
      }
    }
  }
}

async function seedReviews(
  customers: Map<string, { id: string; addressId: string }>,
  productRecords: Map<
    string,
    { id: string; name: string; priceInPence: number; merchantId: string }
  >,
) {
  const reviewSeeds = [
    {
      productSlug: 'premium-aged-basmati-rice-5kg',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 5,
      comment: 'Beautifully aromatic rice and the grains stayed separate after cooking.',
    },
    {
      productSlug: 'stoneground-chakki-atta-5kg',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 4,
      comment: 'Fresh atta and very soft rotis. Delivery was quick too.',
    },
    {
      productSlug: 'kerala-garam-masala-100g',
      customerEmail: 'rohan.singh@bharatmart.uk',
      rating: 5,
      comment: 'A little goes a long way—very fresh and fragrant.',
    },
    {
      productSlug: 'brass-lotus-diya',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 5,
      comment: 'Solid, well-finished diya that looked lovely on our pooja shelf.',
    },
    {
      productSlug: 'banarasi-silk-saree-ruby',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 5,
      comment: 'The colour and zari are even better in person. Beautifully packed.',
    },
    {
      productSlug: 'gold-tone-jhumka-earrings',
      customerEmail: 'rohan.singh@bharatmart.uk',
      rating: 4,
      comment: 'Bought as a gift and they were very well received.',
    },
  ] as const

  for (const review of reviewSeeds) {
    const customer = customers.get(review.customerEmail)
    const product = productRecords.get(review.productSlug)
    if (!customer || !product) throw new Error(`Missing review relation for ${review.productSlug}`)

    await prisma.review.upsert({
      where: {
        productId_customerId: {
          productId: product.id,
          customerId: customer.id,
        },
      },
      update: {
        rating: review.rating,
        comment: review.comment,
      },
      create: {
        productId: product.id,
        customerId: customer.id,
        rating: review.rating,
        comment: review.comment,
      },
    })
  }

  for (const product of productRecords.values()) {
    const rating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await prisma.product.update({
      where: { id: product.id },
      data: {
        avgRating: rating._avg.rating ?? 0,
        reviewCount: rating._count.rating,
      },
    })
  }

  const merchantIds = [...new Set([...productRecords.values()].map((product) => product.merchantId))]
  for (const merchantId of merchantIds) {
    const rating = await prisma.review.aggregate({
      where: { product: { merchantId } },
      _avg: { rating: true },
    })
    await prisma.merchant.update({
      where: { id: merchantId },
      data: { avgRating: rating._avg.rating ?? 0 },
    })
  }
}

async function seedBanners() {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), 0, 1)
  const endDate = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59)
  const banners = [
    {
      id: 'seed_banner_festival',
      imageUrl: 'https://picsum.photos/seed/bharatmart-festival/1600/600',
      headline: 'Festival essentials, delivered',
      subtext: 'Diyas, rangoli and pooja supplies from trusted UK merchants.',
      ctaText: 'Shop Pooja & Festival',
      ctaLink: '/products?category=pooja-festival',
      sortOrder: 1,
    },
    {
      id: 'seed_banner_pantry',
      imageUrl: 'https://picsum.photos/seed/bharatmart-pantry/1600/600',
      headline: 'Stock your Indian pantry',
      subtext: 'Discover rice, atta, dals and regional masalas for everyday cooking.',
      ctaText: 'Browse Groceries',
      ctaLink: '/products?category=indian-groceries',
      sortOrder: 2,
    },
    {
      id: 'seed_banner_fashion',
      imageUrl: 'https://picsum.photos/seed/bharatmart-fashion/1600/600',
      headline: 'Celebrate in style',
      subtext: 'Indian occasionwear and jewellery for weddings, festivals and gifting.',
      ctaText: 'Explore Fashion',
      ctaLink: '/products?category=fashion-jewellery',
      sortOrder: 3,
    },
  ] as const

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: {
        ...banner,
        startDate,
        endDate,
        isActive: true,
      },
      create: {
        ...banner,
        startDate,
        endDate,
        isActive: true,
      },
    })
  }
}

async function printSummary() {
  const [users, merchants, categories, productsCount, images, orders, reviews, banners] =
    await Promise.all([
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.productImage.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.banner.count(),
    ])

  console.log('BharatMart seed complete:')
  console.log({ users, merchants, categories, products: productsCount, images, orders, reviews, banners })
  console.log(`Demo password for seeded users: ${DEMO_PASSWORD}`)
}

async function main() {
  await removePreviousTemporaryAuthSeed()
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const categoryIds = await seedCategories()
  const { merchantIds, customers } = await seedUsersAndMerchants(passwordHash)
  const productRecords = await seedProducts(categoryIds, merchantIds)
  await seedOrders(customers, merchantIds, productRecords)
  await seedReviews(customers, productRecords)
  await seedBanners()
  await printSummary()
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
