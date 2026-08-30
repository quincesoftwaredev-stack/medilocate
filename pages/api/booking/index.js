import nextConnect from 'next-connect';
import { isAuth, isAdmin } from '@/utility';
import Booking from '@/database/model/Booking';
import User from '@/database/model/User'
import db from '@/database/connection';
import { generateUniqueID } from '@/utility/helper';
import Message from '@/services/message-service';
import BASE_URL from '@/config';

const handler = nextConnect();
const PAGE_SIZE = 10
// handler.use(isAuth, isAdmin)

handler.get(async (req, res) => {
    try {
        await db.connect();

        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * PAGE_SIZE;

        const {
            doctor,
            patient,
            status,
            date,
            userId,
        } = req.query;

        const filter = {};

        /* 🔹 doctor OR patient filter */
        if (userId) {
            filter.$or = [
                { doctor: userId },
                { patient: userId }
            ]
        }

        // 🔹 Filter by doctor
        if (doctor) {
            filter.doctor = doctor;
        }

        // 🔹 Filter by patient
        if (patient) {
            filter.patient = patient;
        }

        // 🔹 Filter by status
        if (status) {
            filter.status = status;
        }

        // 🔹 Filter by date (single day)
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            filter.appointmentDate = { $gte: start, $lte: end };
        }

        // 🔹 Total count
        const totalCount = await Booking.countDocuments(filter);

        // 🔹 Total pages
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);

        console.log(filter)
        // 🔹 Fetch paginated bookings
        const bookings = await Booking.find(filter)
            .populate("patient", "fullName firstName lastName phone image location")
            .populate("doctor", "fullName firstName lastName speciality image location")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(PAGE_SIZE);

        console.log(bookings)
        res.status(200).json({
            page,
            totalPages,
            count: totalCount,
            bookings,
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST create a new booking
handler.post(isAuth, async (req, res) => {
    try {
        await db.connect();
        const { doctorId, doctorProfileId, department, chamberId, date, appointmentDate, startTime, endTime, symptoms, consultationMode, consultationFee, followUpFee } = req.body;

        const selectedDate = appointmentDate || date;
        if (!selectedDate || !startTime || !endTime) {
            return res.status(400).json({ error: 'Appointment date, start time and end time are required' });
        }

        // Calculate serial number

        const booking = await Booking.create({
            patient: req.user._id,
            doctor: doctorId,
            doctorProfile: doctorProfileId || null,
            department: department || null,
            chamberId: chamberId || null,
            appointmentDate: selectedDate,
            startTime,
            endTime,
            serial: generateUniqueID([]),
            symptoms,
            consultationMode: consultationMode || 'chamber',
            consultationFee,
            followUpFee,
            status: 'pending',
            statusTimeline: [{ status: "pending" }],

            paymentStatus: 'pending',
        });
        if (booking) {
            const bookindDetails = await Booking.findById(booking._id)
                .populate("patient", "fullName phone image location")
                .populate("doctor", "fullName  phone image location")
            // send Message
            const messageService = new Message()
            messageService.sendMessage({
                message: `You have New Appointment From MediLocate ${BASE_URL}/booking/${booking._id}`,
                number: bookindDetails.doctor.phone
            })
            messageService.sendMessage({
                message: ` Your Appointment Details ${BASE_URL}/booking/${booking._id}`,
                number: bookindDetails.patient.phone
            })
        }
        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// PUT update booking (e.g., status, time, symptoms)
handler.put(isAuth, async (req, res) => {
    try {
        await db.connect();
        const booking = await Booking.findByIdAndUpdate(
            req.query.id,
            { ...req.body },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// DELETE booking
handler.delete(isAuth, async (req, res) => {
    try {
        await db.connect();
        const booking = await Booking.findByIdAndDelete(req.query.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.status(200).json({ message: 'Booking cancelled', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

export default handler;
