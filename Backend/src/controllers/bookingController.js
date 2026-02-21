import mongoose from 'mongoose'
import { z } from 'zod'
import Booking from '../models/Booking.js'
import Expert from '../models/Expert.js'

const createBookingSchema = z.object({
  expertId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  date: z.string().min(4),
  timeSlot: z.string().min(1),
  notes: z.string().max(500).optional(),
})

const statusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed']),
})

const emailSchema = z.string().email()

export const createBooking = async (req, res, next) => {
  try {
    const payload = createBookingSchema.parse(req.body)

    if (!mongoose.Types.ObjectId.isValid(payload.expertId)) {
      return res.status(400).json({ message: 'Invalid expert id.' })
    }

    const expert = await Expert.findById(payload.expertId).select('availability')

    if (!expert) {
      return res.status(404).json({ message: 'Expert not found.' })
    }

    const day = expert.availability.find((item) => item.date === payload.date)

    if (!day || !day.slots.includes(payload.timeSlot)) {
      return res.status(400).json({ message: 'Requested slot is not available.' })
    }

    const booking = await Booking.create({
      expertId: payload.expertId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      date: payload.date,
      timeSlot: payload.timeSlot,
      notes: payload.notes || '',
    })

    if (req.app.locals.io) {
      req.app.locals.io.emit('slotBooked', {
        expertId: payload.expertId,
        date: payload.date,
        timeSlot: payload.timeSlot,
      })
    }

    res.status(201).json({ data: booking })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Slot already booked.' })
    }

    next(error)
  }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = statusSchema.parse(req.body)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking id.' })
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    )

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' })
    }

    res.json({ data: booking })
  } catch (error) {
    next(error)
  }
}

export const listBookingsByEmail = async (req, res, next) => {
  try {
    const email = emailSchema.parse(req.query.email)

    const bookings = await Booking.find({ email })
      .sort({ createdAt: -1 })
      .populate('expertId', 'name category')
      .lean()

    const data = bookings.map((booking) => ({
      ...booking,
      expert: booking.expertId,
      expertId: booking.expertId?._id,
    }))

    res.json({ data })
  } catch (error) {
    next(error)
  }
}
