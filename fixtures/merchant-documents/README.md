# Merchant onboarding test pack

Use this when signing up as a **new merchant** on the merchant app (`/register-business`).

All files here are **mock / sample only** - not real Companies House, DVLA, or food authority documents.

---

## Files to upload

| Onboarding field | File to upload | Formats |
| --- | --- | --- |
| Business document | `business-registration.pdf` or `.png` | PDF / PNG / JPG / WEBP |
| Owner ID proof | `id-proof-driving-licence.pdf` or `.png` | PDF / PNG / JPG / WEBP |
| Food hygiene / licence | `food-hygiene-licence.pdf` or `.png` | **Required** for Grocery / Restaurant / Sweets & Snacks |
| Physical store photo | `physical-store-photo.jpg` | **Required only if** you tick “I have a physical store” |
| Store logo | `store-logo.png` | Required during store setup |

**Upload limit:** max **4 MB** per file (Cloudinary via the merchant API).

### Cloudinary (required on Vercel)

Merchant documents and store photos are stored in `bharatmart/merchant-documents`.
Store logos and product images are stored in `bharatmart/products`.

On each Vercel project (**merchant**, **admin**, and **web**), set:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

(same values as in the root `.env`), for Production + Preview, then **Redeploy**.

Without these, uploads fail on `bharatmart-uk-merchant.vercel.app`.

---

## Copy-paste test merchant details

Use a **new email** each time (seed emails like `lakshmi.reddy@bharatmart.uk` are already taken).

### Step 0 - Seller account

| Field | Value |
| --- | --- |
| Full name | `Priya Sharma` |
| Email | `priya.pickle.test@example.com` |
| Password | `Password123!` |

### Step 1 - Business details

| Field | Value |
| --- | --- |
| Business name | `Priya Pickle Kitchen Ltd` |
| Company number | `14958201` |
| Business type | `Grocery` |
| Registered address | `42 Brick Lane, London E1 6RF` |
| Contact phone | `07700 900301` |

### Step 2 - Documents

1. Upload **business-registration.pdf** (or `.png`)
2. Upload **id-proof-driving-licence.pdf** (or `.png`)
3. Tick **I have a physical store** → upload **physical-store-photo.jpg**
4. Upload **food-hygiene-licence.pdf** (or `.png`) - required because Grocery is a food type

### Step 3 - Store setup

| Field | Value |
| --- | --- |
| Store name | `Priya's Pickle Kitchen` |
| Store slug | `priyas-pickle-kitchen` |
| Store description | `Small-batch Andhra pickles made from family recipes - mango avakaya, gongura, lemon and garlic, packed fresh for UK homes.` |
| Delivery postcodes | `E1` `E2` `E3` `E14` `IG1` `RM8` |
| Store logo | `store-logo.png` |

### Step 4 - Review & submit

After submit the store goes to **PENDING** verification. An admin must approve it before the merchant can sell.

---

## Non-food merchant (optional)

If you want to skip the food licence:

| Field | Value |
| --- | --- |
| Business type | `Clothing` |
| Business name | `Saree & Style Studio Ltd` |
| Store name | `Saree & Style Studio` |
| Store slug | `saree-style-studio-test` |
| Store description | `Ethnic wear for everyday and occasions - sarees, kurtis and festive sets for UK customers.` |
| Food licence | Not required |
| Store photo | Only if physical store is ticked |

Still upload business document + ID proof.

---

## Regenerate files

```bash
python fixtures/merchant-documents/generate_samples.py
```
