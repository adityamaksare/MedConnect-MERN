const Doctor = require('../models/doctorModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { specialization, search, limit = 20 } = req.query;

    console.log('GET /api/doctors request received');
    console.log('Query params:', { specialization, search, limit });

    // Build filter object
    const filter = {};

    // Add specialization filter if provided
    if (specialization) {
      filter.specialization = specialization;
    }

    // Add search filter if provided
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Log the filter to help with debugging
    console.log('Doctor filter:', filter);

    // Check database connection before attempting query
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected, connection state:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'Database connection issue, please try again later',
        readyState: mongoose.connection.readyState
      });
    }

    // Execute query with filters
    const doctors = await Doctor.find(filter)
      .populate('user', 'name email')
      .limit(parseInt(limit));

    console.log(`Found ${doctors.length} doctors matching criteria`);

    // Normalize timings for each doctor before sending response
    const normalizedDoctors = doctors.map(doc => {
      const docObj = doc.toObject();

      // Normalize timings to ensure consistent format
      if (docObj.timings) {
        if (Array.isArray(docObj.timings)) {
          // Handle old format (array of strings)
          if (typeof docObj.timings[0] === 'string') {
            const defaultTimes = [`${docObj.timings[0] || '09:00'}`, `${docObj.timings[1] || '17:00'}`];
            docObj.timings = [
              { day: 'Monday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Monday') || true },
              { day: 'Tuesday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Tuesday') || true },
              { day: 'Wednesday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Wednesday') || true },
              { day: 'Thursday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Thursday') || true },
              { day: 'Friday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Friday') || true },
              { day: 'Saturday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Saturday') || false },
              { day: 'Sunday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Sunday') || false }
            ];
          }
        } else {
          // If timings is not an array, create a default array
          docObj.timings = [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Monday') || true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Tuesday') || true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Wednesday') || true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Thursday') || true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Friday') || true },
            { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: docObj.availableDays?.includes('Saturday') || false },
            { day: 'Sunday', startTime: '09:00', endTime: '14:00', isAvailable: docObj.availableDays?.includes('Sunday') || false }
          ];
        }
      }

      return docObj;
    });

    // Success response
    return res.status(200).json(normalizedDoctors);
  } catch (error) {
    console.error('Error in getDoctors:', error);

    // Detailed error response
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
      error: error.toString()
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    console.log('Fetching doctor with ID:', req.params.id);

    const doctor = await Doctor.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (doctor) {
      console.log('Doctor found:', doctor.name);

      // Normalize timings to ensure consistent format
      const docObj = doctor.toObject();

      if (docObj.timings) {
        if (Array.isArray(docObj.timings)) {
          // Handle old format (array of strings)
          if (typeof docObj.timings[0] === 'string') {
            const defaultTimes = [`${docObj.timings[0] || '09:00'}`, `${docObj.timings[1] || '17:00'}`];
            docObj.timings = [
              { day: 'Monday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Monday') || true },
              { day: 'Tuesday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Tuesday') || true },
              { day: 'Wednesday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Wednesday') || true },
              { day: 'Thursday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Thursday') || true },
              { day: 'Friday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Friday') || true },
              { day: 'Saturday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Saturday') || false },
              { day: 'Sunday', startTime: defaultTimes[0], endTime: defaultTimes[1], isAvailable: docObj.availableDays?.includes('Sunday') || false }
            ];
          }
        } else {
          // If timings is not an array, create a default array
          docObj.timings = [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Monday') || true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Tuesday') || true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Wednesday') || true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Thursday') || true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: docObj.availableDays?.includes('Friday') || true },
            { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: docObj.availableDays?.includes('Saturday') || false },
            { day: 'Sunday', startTime: '09:00', endTime: '14:00', isAvailable: docObj.availableDays?.includes('Sunday') || false }
          ];
        }
      }

      res.json(docObj);
    } else {
      console.log('No doctor found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching doctor'
    });
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctorProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      fees,
      phone,
      address,
      bio,
      image,
    } = req.body;

    // Normalize timings
    let normalizedTimings = req.body.timings;
    if (!normalizedTimings || !Array.isArray(normalizedTimings) || normalizedTimings.length === 0) {
      // Create default timings
      normalizedTimings = [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: false },
        { day: 'Sunday', startTime: '09:00', endTime: '14:00', isAvailable: false }
      ];
    } else {
      // Make sure timings is in the expected format
      normalizedTimings = normalizedTimings.map((timing, index) => {
        if (typeof timing === 'string') {
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          return {
            day: dayNames[index % 7] || 'Unknown',
            startTime: timing,
            endTime: '17:00',
            isAvailable: true
          };
        }

        if (typeof timing === 'object' && timing !== null) {
          return {
            day: timing.day || 'Unknown Day',
            startTime: timing.startTime || '09:00',
            endTime: timing.endTime || '17:00',
            isAvailable: typeof timing.isAvailable === 'boolean' ? timing.isAvailable : true
          };
        }

        return {
          day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index % 7] || 'Unknown',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: false
        };
      });
    }

    // Calculate availableDays from timings for backward compatibility
    const availableDays = normalizedTimings
      .filter(t => t.isAvailable)
      .map(t => t.day);

    // Create doctor profile linked to the current user
    const doctor = new Doctor({
      user: req.user._id,
      specialization,
      experience: Number(experience) || 0,
      fees: Number(fees) || 500,
      phone: phone || '',
      address: address || '',
      timings: normalizedTimings,
      availableDays: availableDays.length > 0 ? availableDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      bio: bio || '',
      image: image || '',
    });

    const createdDoctor = await doctor.save();

    if (createdDoctor) {
      console.log('New doctor profile created:', createdDoctor._id);
      return res.status(201).json(createdDoctor);
    } else {
      console.error('Doctor creation failed with valid data');
      return res.status(400).json({
        success: false,
        message: 'Doctor creation failed'
      });
    }
  } catch (error) {
    console.error('Error creating doctor profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during doctor profile creation'
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private/Admin/Doctor
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Normalize timings to ensure they're in the correct format
    let normalizedTimings = req.body.timings;
    if (normalizedTimings) {
      // Make sure timings is in the expected format (array of objects with day, startTime, endTime, isAvailable)
      if (Array.isArray(normalizedTimings)) {
        normalizedTimings = normalizedTimings.map((timing, index) => {
          // If timing is a string, convert to object format
          if (typeof timing === 'string') {
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            return {
              day: dayNames[index % 7] || 'Unknown',
              startTime: timing,
              endTime: '17:00',
              isAvailable: true
            };
          }

          // If timing is already an object, ensure it has all required properties
          if (typeof timing === 'object' && timing !== null) {
            return {
              day: timing.day || 'Unknown Day',
              startTime: timing.startTime || '09:00',
              endTime: timing.endTime || '17:00',
              isAvailable: typeof timing.isAvailable === 'boolean' ? timing.isAvailable : true
            };
          }

          // Default timing object for invalid entries
          return {
            day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index % 7] || 'Unknown',
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: false
          };
        });
      } else {
        // If timings isn't an array, create a default array
        console.warn('Received invalid timings format:', normalizedTimings);
        normalizedTimings = [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: false },
          { day: 'Sunday', startTime: '09:00', endTime: '14:00', isAvailable: false }
        ];
      }
    }

    // Update doctor fields
    doctor.name = req.body.name || doctor.name;
    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.fees = req.body.fees || doctor.fees;
    doctor.phone = req.body.phone || doctor.phone;
    doctor.address = req.body.address || doctor.address;
    doctor.bio = req.body.bio || doctor.bio;
    doctor.image = req.body.image || doctor.image;

    // Only update timings if provided in the request
    if (normalizedTimings) {
      doctor.timings = normalizedTimings;

      // Update availableDays based on the timings for backward compatibility
      doctor.availableDays = normalizedTimings
        .filter(t => t.isAvailable)
        .map(t => t.day);
    }

    const updatedDoctor = await doctor.save();

    console.log('Doctor profile updated successfully');
    console.log('Updated timings:', updatedDoctor.timings);

    return res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating doctor profile'
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
}; 