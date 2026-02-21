import { Router } from 'express'
import {
  createBooking,
  listBookingsByEmail,
  updateBookingStatus,
} from '../controllers/bookingController.js'

const router = Router()

router.post('/', createBooking)
router.patch('/:id/status', updateBookingStatus)
router.get('/', listBookingsByEmail)

export default router
