import nextConnect from 'next-connect';
import { isAuth } from '@/utility';
import Booking from '@/database/model/Booking';
import User from '@/database/model/User'
import db from '@/database/connection';
import { generateUniqueID } from '@/utility/helper';
import mongoose from 'mongoose';

const handler = nextConnect();

// GET booking by ID
handler.get(isAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    await db.connect();
    const booking = await Booking.findById(req.query.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const userId = String(req.user._id);
    const canView = req.user.role === 'admin'
      || String(booking.patient) === userId
      || String(booking.doctor) === userId;

    if (!canView) return res.status(403).json({ error: 'Not authorized to view this booking' });

    await booking.populate('patient', 'fullName firstName lastName');
    await booking.populate('doctor', 'fullName firstName lastName speciality workingIn');
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// update status
handler.put(async (req, res) => {
  const { id: bookingId } = req.query
  const { newStatus } = req.body

  const ALLOWED_STATUS = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
  ]

  try {
    await db.connect()

    // Validate status
    if (!ALLOWED_STATUS.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" })
    }

    const booking = await Booking.findById(bookingId)
      .populate("patient", "name phone email")
      .populate("doctor", "name department phone")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Prevent changing final states
    if (["completed", "cancelled", "no-show"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: "Booking status cannot be changed" })
    }

    // Same status check
    if (booking.status === newStatus) {
      return res
        .status(400)
        .json({ message: "New status is same as current status" })
    }

    const previousStatus = booking.status

    // Update status
    booking.status = newStatus

    // Optional: status timeline (recommended)
    if (!booking.statusTimeline) {
      booking.statusTimeline = []
    }

    booking.statusTimeline.push({
      status: newStatus,
      timestamp: Date.now(),
    })

    await booking.save()

    return res.status(200).json({
      message: `Booking status updated from ${previousStatus} to ${newStatus}`,
      booking,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
})


handler.patch(async (req, res) => {
  try {
    await db.connect()

    const { id } = req.query
    const { dateOfConsultation, startTime, endTime } = req.body
    console.log({ dateOfConsultation, startTime, endTime })
    // if (!dateOfConsultation || !startTime || !endTime) {
    //   return res.status(400).json({
    //     message: 'dateOfConsultation, startTime and endTime are required'
    //   })
    // }
    await db.connect()

    const booking = await Booking.findById(id)
    console.log(booking)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    // Optional: prevent update if completed/cancelled
    // if (['completed', 'cancelled', 'no-show'].includes(booking.status)) {
    //   return res.status(400).json({
    //     message: 'Time cannot be updated for this booking status'
    //   })
    // }

    booking.dateOfConsultation = dateOfConsultation
    booking.startTime = startTime
    booking.endTime = endTime

    await booking.save()
    await db.disconnect()

    res.status(200).json({
      message: 'Consultation time updated successfully',
      booking
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})
export default handler
