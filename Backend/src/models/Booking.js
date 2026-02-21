import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true },
)

BookingSchema.index(
  { expertId: 1, date: 1, timeSlot: 1 },
  { unique: true },
)

export default mongoose.model('Booking', BookingSchema)
