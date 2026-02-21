import mongoose from 'mongoose'
import { z } from 'zod'
import Expert from '../models/Expert.js'
import Booking from '../models/Booking.js'

const listSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
})

export const listExperts = async (req, res, next) => {
  try {
    const { search, category, page, limit } = listSchema.parse(req.query)
    const filter = {}

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    if (category) {
      filter.category = category
    }

    const [experts, total, categories] = await Promise.all([
      Expert.find(filter)
        .select('name title category experienceYears rating')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expert.countDocuments(filter),
      Expert.distinct('category'),
    ])

    res.json({
      data: experts,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      categories,
    })
  } catch (error) {
    next(error)
  }
}

export const getExpertById = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expert id.' })
    }

    const expert = await Expert.findById(id).lean()

    if (!expert) {
      return res.status(404).json({ message: 'Expert not found.' })
    }

    const dates = expert.availability.map((item) => item.date)
    const bookings = await Booking.find({
      expertId: id,
      date: { $in: dates },
    })
      .select('date timeSlot')
      .lean()

    const bookedSet = new Set(
      bookings.map((item) => `${item.date}|${item.timeSlot}`),
    )

    const availability = expert.availability.map((day) => ({
      date: day.date,
      slots: day.slots.map((time) => ({
        time,
        isBooked: bookedSet.has(`${day.date}|${time}`),
      })),
    }))

    res.json({ data: { ...expert, availability } })
  } catch (error) {
    next(error)
  }
}
