import 'server-only'

import { addressSchema, type AddressInput } from '@bharatmart/validation'
import { addressRepository } from '../repositories/address.repository'
import { NotFoundError, ValidationError } from '../errors'

function toWriteData(input: AddressInput) {
  return {
    label: input.label,
    line1: input.line1,
    line2: input.line2?.trim() ? input.line2.trim() : null,
    city: input.city,
    postcode: input.postcode,
    country: input.country,
    isDefault: input.isDefault,
  }
}

export const AddressService = {
  getForUser(userId: string) {
    return addressRepository.findForUser(userId)
  },

  getByIdForUser(id: string, userId: string) {
    return addressRepository.findByIdForUser(id, userId)
  },

  async createForUser(userId: string, input: AddressInput) {
    const parsed = addressSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError('Please check the address details.')
    }

    return addressRepository.create({
      userId,
      ...toWriteData(parsed.data),
    })
  },

  async updateForUser(addressId: string, userId: string, input: AddressInput) {
    const parsed = addressSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError('Please check the address details.')
    }

    const updated = await addressRepository.update(addressId, userId, toWriteData(parsed.data))
    if (!updated) throw new NotFoundError('Address not found.')
    return updated
  },

  async setDefaultForUser(addressId: string, userId: string) {
    const updated = await addressRepository.setDefault(addressId, userId)
    if (!updated) throw new NotFoundError('Address not found.')
    return updated
  },

  async deleteForUser(addressId: string, userId: string) {
    const deleted = await addressRepository.delete(addressId, userId)
    if (!deleted) throw new NotFoundError('Address not found.')
    return deleted
  },
}

export const addressService = AddressService
