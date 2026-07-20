import bcrypt from 'bcryptjs'
import {
  BusinessType,
  MerchantOrderStatus,
  MerchantVerificationStatus,
  PaymentMethod,
  PaymentStatus,
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
    name: 'Homemade Foods',
    slug: 'homemade-foods',
    iconUrl: 'https://picsum.photos/seed/homemade-foods/160/160',
    sortOrder: 1,
    children: [
      { name: 'Homemade Pickles', slug: 'homemade-pickles', sortOrder: 1 },
      { name: 'Homemade Snacks', slug: 'homemade-snacks', sortOrder: 2 },
    ],
  },
] as const

const merchants = [
  {
    email: 'lakshmi.reddy@bharatmart.uk',
    name: 'Lakshmi Reddy',
    phone: '+44 7700 900301',
    businessName: "Amma's Andhra Pickle House Ltd",
    businessType: BusinessType.GROCERY,
    registrationNumber: 'UK-AP-20001',
    storeName: "Amma's Andhra Pickle House",
    storeSlug: 'ammas-andhra-pickle-house',
    storeDescription:
      'Small-batch Andhra pickles made from family recipes — mango avakaya, gongura, lemon and more, packed fresh for UK homes.',
    deliveryPostcodes: ['E1', 'E2', 'E3', 'E14', 'IG1', 'RM8'],
  },
  {
    email: 'suresh.narasimha@bharatmart.uk',
    name: 'Suresh Narasimha',
    phone: '+44 7700 900302',
    businessName: "Narasimha's Village Snacks Ltd",
    businessType: BusinessType.SWEETS_SNACKS,
    registrationNumber: 'UK-VS-20002',
    storeName: "Narasimha's Village Snacks",
    storeSlug: 'narasimhas-village-snacks',
    storeDescription:
      'Crispy Andhra snacks from a family kitchen in Leicester — murukulu, sakinalu, chekkalu, mixture and festival sweets made to order.',
    deliveryPostcodes: ['LE1', 'LE2', 'LE3', 'LE4', 'LE5', 'CV1'],
  },
] as const

const products: SeedProduct[] = [
  // Pickles — Amma's Andhra Pickle House
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: "Amma's Homemade Andhra Avakaya",
    slug: 'ammas-homemade-andhra-avakaya',
    description:
      'Classic spicy mango avakaya prepared with mustard oil, chilli and family-ground spices. Tangy, fiery and perfect with rice and ghee.',
    priceInPence: 699,
    stockQuantity: 40,
    sku: 'AAP-AVK-001',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Traditional Village Mango Pickle',
    slug: 'traditional-village-mango-pickle',
    description:
      'Sun-ripened mango pieces pickled the village way with sesame oil and aromatic spices for everyday meals.',
    priceInPence: 649,
    stockQuantity: 45,
    sku: 'AAP-MNG-002',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: "Grandma's Recipe Lemon Pickle",
    slug: 'grandmas-recipe-lemon-pickle',
    description:
      'Slow-cured lemon pickle with ginger, green chilli and a hint of jaggery — bright, sour and deeply flavoured.',
    priceInPence: 599,
    stockQuantity: 50,
    sku: 'AAP-LMN-003',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Authentic Andhra Gongura Pickle',
    slug: 'authentic-andhra-gongura-pickle',
    description:
      'Tangy gongura leaves cooked with garlic and red chilli — a true Andhra favourite for rice, dosa and roti.',
    priceInPence: 679,
    stockQuantity: 38,
    sku: 'AAP-GNG-004',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Handmade Garlic Mango Pickle',
    slug: 'handmade-garlic-mango-pickle',
    description:
      'Chunky mango pickle layered with fresh garlic cloves for a bold, aromatic kick with every spoonful.',
    priceInPence: 729,
    stockQuantity: 35,
    sku: 'AAP-GRC-005',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Sun-Cured Homemade Lemon Pickle',
    slug: 'sun-cured-homemade-lemon-pickle',
    description:
      'Lemons sun-cured for days then finished with mustard and fenugreek — sharp, zesty and long-lasting.',
    priceInPence: 619,
    stockQuantity: 42,
    sku: 'AAP-SCL-006',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Heritage Andhra Chicken Pickle',
    slug: 'heritage-andhra-chicken-pickle',
    description:
      'Non-veg Andhra classic: tender chicken pieces in a spicy, gingery pickle masala. Best chilled after opening.',
    priceInPence: 899,
    stockQuantity: 28,
    sku: 'AAP-CHK-007',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Farm Fresh Tomato Pickle',
    slug: 'farm-fresh-tomato-pickle',
    description:
      'Ripe tomatoes simmered with chilli, garlic and mustard for a mild-spicy pickle that pairs with idli and rice.',
    priceInPence: 549,
    stockQuantity: 48,
    sku: 'AAP-TMT-008',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Spicy Village Style Gongura Pickle',
    slug: 'spicy-village-style-gongura-pickle',
    description:
      'Extra-hot village-style gongura with plenty of chilli and garlic — for those who like true Andhra heat.',
    priceInPence: 699,
    stockQuantity: 32,
    sku: 'AAP-SPG-009',
  },
  {
    merchantSlug: 'ammas-andhra-pickle-house',
    categorySlug: 'homemade-pickles',
    name: 'Premium Homemade Mixed Vegetable Pickle',
    slug: 'premium-homemade-mixed-vegetable-pickle',
    description:
      'Carrot, cauliflower, lemon and mango in a rich mixed pickle masala — a festive jar for the whole family.',
    priceInPence: 749,
    stockQuantity: 36,
    sku: 'AAP-MXV-010',
  },

  // Snacks — Narasimha's Village Snacks
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: "Amma's Homemade Murukulu",
    slug: 'ammas-homemade-murukulu',
    description:
      'Crispy spiral murukulu made with rice flour and butter, lightly spiced — tea-time crunch the Amma way.',
    priceInPence: 499,
    stockQuantity: 55,
    sku: 'NVS-MUR-001',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Village Style Karapusa',
    slug: 'village-style-karapusa',
    description:
      'Crunchy Andhra karapusa (chekodi-style) fried in small batches with cumin and chilli.',
    priceInPence: 479,
    stockQuantity: 50,
    sku: 'NVS-KAR-002',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Traditional Andhra Chekkalu',
    slug: 'traditional-andhra-chekkalu',
    description:
      'Thin, crisp rice-flour discs seasoned with sesame and chilli — a festival staple from coastal Andhra.',
    priceInPence: 529,
    stockQuantity: 48,
    sku: 'NVS-CHK-003',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Handmade Sakinalu',
    slug: 'handmade-sakinalu',
    description:
      'Hand-pressed sakinalu with sesame and carom seeds — light, fragrant and perfect with filter coffee.',
    priceInPence: 549,
    stockQuantity: 44,
    sku: 'NVS-SAK-004',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: "Grandma's Special Mixture",
    slug: 'grandmas-special-mixture',
    description:
      'A homestyle mixture of sev, peanuts, curry leaves and spices — snackable and generously seasoned.',
    priceInPence: 599,
    stockQuantity: 60,
    sku: 'NVS-MIX-005',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Premium Dry Fruit Mixture',
    slug: 'premium-dry-fruit-mixture',
    description:
      'Cashews, almonds, raisins and crunchy sev tossed in a mild masala — premium gifting and evening snacks.',
    priceInPence: 899,
    stockQuantity: 30,
    sku: 'NVS-DFM-006',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Authentic Janthikalu',
    slug: 'authentic-janthikalu',
    description:
      'Fine extruded janthikalu with a delicate crunch and gentle spice — classic Andhra tea-time fare.',
    priceInPence: 499,
    stockQuantity: 52,
    sku: 'NVS-JAN-007',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Homemade Butter Murukulu',
    slug: 'homemade-butter-murukulu',
    description:
      'Rich butter murukulu that melt as you bite — milder spice, extra crisp, made in small batches.',
    priceInPence: 549,
    stockQuantity: 46,
    sku: 'NVS-BMU-008',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Festival Special Ariselu',
    slug: 'festival-special-ariselu',
    description:
      'Soft jaggery-coated ariselu prepared for festivals — sweet, sticky and fragrant with ghee.',
    priceInPence: 699,
    stockQuantity: 34,
    sku: 'NVS-ARI-009',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Crispy Ribbon Pakoda',
    slug: 'crispy-ribbon-pakoda',
    description:
      'Ribbon pakoda strips fried until golden with a peppery, savoury finish — ideal for sharing.',
    priceInPence: 479,
    stockQuantity: 58,
    sku: 'NVS-RIB-010',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Premium Masala Boondi',
    slug: 'premium-masala-boondi',
    description:
      'Tiny boondi pearls tossed in chaat-style masala — crunchy, tangy and lightly spicy.',
    priceInPence: 449,
    stockQuantity: 62,
    sku: 'NVS-BOO-011',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Classic Andhra Chegodilu',
    slug: 'classic-andhra-chegodilu',
    description:
      'Ring-shaped chegodilu with sesame and chilli — a beloved Andhra crunch for evenings and guests.',
    priceInPence: 529,
    stockQuantity: 40,
    sku: 'NVS-CGD-012',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Homemade Banana Chips',
    slug: 'homemade-banana-chips',
    description:
      'Thin Kerala-style banana chips fried in coconut oil and lightly salted — crisp and lightly sweet.',
    priceInPence: 499,
    stockQuantity: 55,
    sku: 'NVS-BAN-013',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Handcrafted Sunnundalu',
    slug: 'handcrafted-sunnundalu',
    description:
      'Roasted urad dal laddoos bound with jaggery and ghee — traditional protein-rich sweets.',
    priceInPence: 649,
    stockQuantity: 36,
    sku: 'NVS-SUN-014',
  },
  {
    merchantSlug: 'narasimhas-village-snacks',
    categorySlug: 'homemade-snacks',
    name: 'Authentic Rice Chekkalu',
    slug: 'authentic-rice-chekkalu',
    description:
      'Rice-flour chekkalu with curry leaves and sesame — thin, brittle and addictive.',
    priceInPence: 519,
    stockQuantity: 48,
    sku: 'NVS-RCK-015',
  },
]

async function removePreviousTemporaryAuthSeed() {
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
      orderNumber: 'BM-2026-000201',
      customerEmail: 'ananya.patel@bharatmart.uk',
      placedAt: new Date('2026-06-15T11:30:00.000Z'),
      deliveryFeeInPence: 399,
      discountInPence: 200,
      groups: [
        {
          merchantSlug: 'ammas-andhra-pickle-house',
          status: MerchantOrderStatus.DELIVERED,
          trackingNumber: 'RM-BM201-AP',
          courierName: 'Royal Mail',
          shippedAt: new Date('2026-06-16T09:00:00.000Z'),
          deliveredAt: new Date('2026-06-17T14:25:00.000Z'),
          items: [
            { slug: 'ammas-homemade-andhra-avakaya', quantity: 2 },
            { slug: 'grandmas-recipe-lemon-pickle', quantity: 1 },
          ],
        },
        {
          merchantSlug: 'narasimhas-village-snacks',
          status: MerchantOrderStatus.DELIVERED,
          trackingNumber: 'DPD-BM201-VS',
          courierName: 'DPD',
          shippedAt: new Date('2026-06-16T10:30:00.000Z'),
          deliveredAt: new Date('2026-06-18T12:05:00.000Z'),
          items: [
            { slug: 'ammas-homemade-murukulu', quantity: 2 },
            { slug: 'handmade-sakinalu', quantity: 1 },
          ],
        },
      ],
    },
    {
      orderNumber: 'BM-2026-000202',
      customerEmail: 'rohan.singh@bharatmart.uk',
      placedAt: new Date('2026-06-28T17:45:00.000Z'),
      deliveryFeeInPence: 299,
      discountInPence: 0,
      groups: [
        {
          merchantSlug: 'narasimhas-village-snacks',
          status: MerchantOrderStatus.DELIVERED,
          trackingNumber: 'EVRI-BM202-VS',
          courierName: 'Evri',
          shippedAt: new Date('2026-06-29T08:20:00.000Z'),
          deliveredAt: new Date('2026-06-30T16:40:00.000Z'),
          items: [
            { slug: 'grandmas-special-mixture', quantity: 2 },
            { slug: 'festival-special-ariselu', quantity: 1 },
          ],
        },
      ],
    },
    {
      orderNumber: 'BM-2026-000203',
      customerEmail: 'ananya.patel@bharatmart.uk',
      placedAt: new Date('2026-07-08T13:20:00.000Z'),
      deliveryFeeInPence: 399,
      discountInPence: 100,
      groups: [
        {
          merchantSlug: 'ammas-andhra-pickle-house',
          status: MerchantOrderStatus.SHIPPED,
          trackingNumber: 'DPD-BM203-AP',
          courierName: 'DPD',
          shippedAt: new Date('2026-07-10T10:15:00.000Z'),
          deliveredAt: null,
          items: [
            { slug: 'authentic-andhra-gongura-pickle', quantity: 1 },
            { slug: 'heritage-andhra-chicken-pickle', quantity: 1 },
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
    const totalInPence = subtotal + orderSeed.deliveryFeeInPence - orderSeed.discountInPence

    const order = await prisma.order.upsert({
      where: { orderNumber: orderSeed.orderNumber },
      update: {
        customerId: customer.id,
        addressId: customer.addressId,
        totalInPence,
        deliveryFeeInPence: orderSeed.deliveryFeeInPence,
        discountInPence: orderSeed.discountInPence,
        paymentStatus: PaymentStatus.CAPTURED,
        paymentMethod: PaymentMethod.CARD,
        placedAt: orderSeed.placedAt,
      },
      create: {
        orderNumber: orderSeed.orderNumber,
        customerId: customer.id,
        addressId: customer.addressId,
        totalInPence,
        deliveryFeeInPence: orderSeed.deliveryFeeInPence,
        discountInPence: orderSeed.discountInPence,
        paymentStatus: PaymentStatus.CAPTURED,
        paymentMethod: PaymentMethod.CARD,
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
      productSlug: 'ammas-homemade-andhra-avakaya',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 5,
      comment: 'Proper Andhra heat and mango flavour — tastes just like home.',
    },
    {
      productSlug: 'grandmas-recipe-lemon-pickle',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 5,
      comment: 'Bright, sour and perfectly spiced. Already ordered again.',
    },
    {
      productSlug: 'ammas-homemade-murukulu',
      customerEmail: 'rohan.singh@bharatmart.uk',
      rating: 5,
      comment: 'Crispy and fresh — disappeared during our tea-time.',
    },
    {
      productSlug: 'handmade-sakinalu',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 4,
      comment: 'Light and fragrant. Packaging was excellent for UK delivery.',
    },
    {
      productSlug: 'grandmas-special-mixture',
      customerEmail: 'rohan.singh@bharatmart.uk',
      rating: 5,
      comment: 'Best homemade mixture we have found online.',
    },
    {
      productSlug: 'authentic-andhra-gongura-pickle',
      customerEmail: 'ananya.patel@bharatmart.uk',
      rating: 5,
      comment: 'Authentic gongura tang — perfect with hot rice.',
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
  const startDate = new Date('2026-01-01T00:00:00.000Z')
  const endDate = new Date('2028-01-01T23:59:59.000Z')
  const banners = [
    {
      id: 'carousel_homemade_pickles',
      imageUrl: '/carousel/homemade-pickles.png',
      headline: 'Homemade Indian Pickles',
      subtext:
        'Tangy mango, lemon and family-recipe achar — made for everyday meals and festive thalis.',
      ctaText: 'Shop pickles',
      ctaLink: '/products?category=homemade-pickles',
      sortOrder: 1,
    },
    {
      id: 'carousel_homemade_snacks',
      imageUrl: '/carousel/homemade-snacks.png',
      headline: 'Crispy Homemade Snacks',
      subtext:
        'Murukulu, janthikalu, sakinalu, gaarelu and more — festive crunch, delivered across the UK.',
      ctaText: 'Shop snacks',
      ctaLink: '/products?category=homemade-snacks',
      sortOrder: 2,
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
  const [users, merchantsCount, categoriesCount, productsCount, images, orders, reviews, banners] =
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
  console.log({
    users,
    merchants: merchantsCount,
    categories: categoriesCount,
    products: productsCount,
    images,
    orders,
    reviews,
    banners,
  })
  console.log(`Demo password for seeded users: ${DEMO_PASSWORD}`)
  console.log('Key logins:')
  console.log('- Admin:    admin@bharatmart.uk')
  console.log('- Customer: ananya.patel@bharatmart.uk')
  console.log("- Pickles:  lakshmi.reddy@bharatmart.uk  (Amma's Andhra Pickle House)")
  console.log("- Snacks:   suresh.narasimha@bharatmart.uk  (Narasimha's Village Snacks)")
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
