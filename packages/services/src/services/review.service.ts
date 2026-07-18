import 'server-only'

import { reviewRepository } from '../repositories/review.repository'

export const ReviewService = {
  getForProduct(productId: string, page = 1, pageSize = 10) {
    return reviewRepository.findForProduct(productId, page, pageSize)
  },
}

export const reviewService = ReviewService
