import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaUserMd, FaCalendarAlt, FaClock, FaHourglass } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import Message from '../components/Message';
import Loader from '../components/Loader';
import api from '../utils/api';
import './DoctorDashboard.css'; // Import custom CSS

const generateAvatarData = (name) => {
  // Hash the name to create a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a color based on the hash
  const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 16777215)).toString(16);
  const bgColor = '#' + color.padStart(6, '0');

  // Get initials (up to 2 characters)
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return { bgColor, initials };
};

const renderStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <Badge bg="warning">Pending</Badge>;
    case 'confirmed':
      return <Badge bg="success">Confirmed</Badge>;
    case 'completed':
      return <Badge bg="primary">Completed</Badge>;
    case 'cancelled':
      return <Badge bg="danger">Cancelled</Badge>;
    default:
      return <Badge bg="secondary">Unknown</Badge>;
  }
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const { success } = useAlerts();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');

  // Doctor profile form state
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [timings, setTimings] = useState([
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: false },
    { day: 'Sunday', startTime: '09:00', endTime: '14:00', isAvailable: false }
  ]);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Define fetchDoctorProfile with useCallback
  const fetchDoctorProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all doctors
      const { data: doctors } = await api.get('/doctors');
      console.log('Fetched doctors:', doctors);

      // Find the doctor profile for the current user
      const doctorData = doctors.find(doc => doc.user && doc.user._id === userInfo._id);
      console.log('Current user ID:', userInfo._id);
      console.log('Found doctor profile:', doctorData);

      if (doctorData) {
        setDoctorProfile(doctorData);
        setSpecialization(doctorData.specialization || '');
        setExperience(doctorData.experience || '');
        setFees(doctorData.fees || '');
        setAddress(doctorData.address || '');
        setBio(doctorData.bio || '');

        // Validate timings data before setting it
        if (doctorData.timings && Array.isArray(doctorData.timings) && doctorData.timings.length > 0) {
          // Make sure each timing has the correct structure
          const validTimings = doctorData.timings.map((timing, index) => {
            // If timing is not an object or is missing properties, create a default one
            if (!timing || typeof timing !== 'object') {
              console.warn(`Invalid timing at index ${index}, creating default timing`);
              return {
                day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index] || 'Day',
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: false
              };
            }

            // Ensure all required properties exist with default values if needed
            return {
              day: timing.day || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index] || 'Day',
              startTime: typeof timing.startTime === 'string' ? timing.startTime : '09:00',
              endTime: typeof timing.endTime === 'string' ? timing.endTime : '17:00',
              isAvailable: typeof timing.isAvailable === 'boolean' ? timing.isAvailable : false
            };
          });

          setTimings(validTimings);
        }
      } else {
        console.log('No doctor profile found for current user');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error fetching doctor profile'
      );
      setLoading(false);
    }
  }, [userInfo]);

  // Define fetchAppointments with useCallback
  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError('');

      // For doctor dashboard, we need to get doctor-specific appointments
      const { data: appointmentsData } = await api.get('/appointments/doctor');
      console.log('Fetched appointments:', appointmentsData);

      // Directly use the data from the response
      setAppointments(appointmentsData || []);
      setAppointmentsLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointmentsError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error fetching appointments'
      );
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Current user info:', userInfo);

    if (!userInfo) {
      console.log('No user info, redirecting to login');
      navigate('/login');
      return;
    }

    if (userInfo.role !== 'doctor') {
      console.log(`User role ${userInfo.role} is not 'doctor', redirecting to login`);
      navigate('/login');
      return;
    }

    console.log('User is a doctor, fetching profile and appointments');
    fetchDoctorProfile();
    fetchAppointments();
  }, [userInfo, navigate, fetchDoctorProfile, fetchAppointments]);

  const handleTimingChange = (index, field, value) => {
    const newTimings = [...timings];

    // Validate the timing object before modifying it
    if (!newTimings[index] || typeof newTimings[index] !== 'object') {
      console.error('Invalid timing object at index', index, newTimings[index]);
      // Create a new valid timing object if needed
      newTimings[index] = {
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index] || 'Day',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false
      };
    }

    if (field === 'isAvailable') {
      newTimings[index].isAvailable = !newTimings[index].isAvailable;
    } else {
      newTimings[index][field] = value;
    }

    setTimings(newTimings);
  };

  const submitProfileHandler = async (e) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      setProfileError('');

      // Ensure timings are valid objects with required properties
      const validTimings = timings.map(timing => {
        if (typeof timing === 'string') {
          console.warn('Found string timing, converting to object:', timing);
          return {
            day: 'Unknown',
            startTime: timing,
            endTime: '17:00',
            isAvailable: true
          };
        }
        return {
          day: timing.day || 'Unknown',
          startTime: timing.startTime || '09:00',
          endTime: timing.endTime || '17:00',
          isAvailable: typeof timing.isAvailable === 'boolean' ? timing.isAvailable : true
        };
      });

      const profileData = {
        specialization,
        experience: Number(experience),
        fees: Number(fees),
        address,
        bio,
        timings: validTimings
      };

      if (doctorProfile) {
        // Update existing profile
        await api.put(`/doctors/${doctorProfile._id}`, profileData);
        success('Doctor profile updated successfully');
      } else {
        // Create new profile
        await api.post('/doctors', profileData);
        success('Doctor profile created successfully');
      }

      setProfileLoading(false);
      fetchDoctorProfile();
    } catch (err) {
      setProfileError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error updating profile'
      );
      setProfileLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPendingAppointmentsCount = () => {
    if (!appointments || !Array.isArray(appointments)) {
      return 0;
    }
    return appointments.filter(app => app && app.status === 'pending').length;
  };

  const getConfirmedAppointmentsCount = () => {
    if (!appointments || !Array.isArray(appointments)) {
      return 0;
    }
    return appointments.filter(app => app && app.status === 'confirmed').length;
  };

  const getTodayAppointments = () => {
    if (!appointments || !Array.isArray(appointments)) {
      console.error('Appointments data is not an array:', appointments);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter(app => {
      if (!app || !app.appointmentDate) {
        console.warn('Invalid appointment data:', app);
        return false;
      }

      try {
        const appDate = new Date(app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() === today.getTime();
      } catch (err) {
        console.error('Error parsing appointment date:', err);
        return false;
      }
    }).sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
  };

  const getUpcomingAppointments = () => {
    if (!appointments || !Array.isArray(appointments)) {
      console.error('Appointments data is not an array:', appointments);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter(app => {
      if (!app || !app.appointmentDate) {
        console.warn('Invalid appointment data:', app);
        return false;
      }

      try {
        const appDate = new Date(app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() > today.getTime() &&
          (app.status === 'pending' || app.status === 'confirmed');
      } catch (err) {
        console.error('Error parsing appointment date:', err);
        return false;
      }
    }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  };

  const getPastAppointments = () => {
    if (!appointments || !Array.isArray(appointments)) {
      console.error('Appointments data is not an array:', appointments);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter(app => {
      if (!app || !app.appointmentDate) {
        console.warn('Invalid appointment data:', app);
        return false;
      }

      try {
        const appDate = new Date(app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() < today.getTime() || app.status === 'completed';
      } catch (err) {
        console.error('Error parsing appointment date:', err);
        return false;
      }
    }).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status });

      // Update the appointments state with the updated appointment
      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === appointmentId ? { ...app, status } : app
        )
      );

      success(`Appointment ${status} successfully`);
    } catch (err) {
      console.error(`Error updating appointment to ${status}:`, err);
      // You might want to add a proper error handling here
    }
  };

  const renderAppointmentItem = (appointment, showDate = true) => {
    const patientName = appointment.user?.name || 'Unknown Patient';
    const { bgColor, initials } = generateAvatarData(patientName);

    return (
      <ListGroup.Item
        className="mb-2 border rounded appointment-item"
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
          <div className="mb-2 mb-md-0 w-100">
            <div className="d-flex align-items-center mb-1">
              <div
                style={{
                  backgroundColor: bgColor,
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  fontWeight: 'bold'
                }}
              >
                {initials}
              </div>
              <div className="fw-bold">{patientName}</div>
            </div>
            <div className="small text-muted">{appointment.user?.phoneNumber || 'No phone number'}</div>
            {showDate && (
              <div className="small text-muted">
                {formatDate(appointment.appointmentDate)} at {appointment.timeSlot || 'No time specified'}
              </div>
            )}
            {!showDate && (
              <div className="small text-muted">
                Time: {appointment.timeSlot || 'No time specified'}
              </div>
            )}
            <div className="mt-1">
              <strong>Reason:</strong> {appointment.reason || 'No reason specified'}
            </div>
            <div className="mt-1 d-flex align-items-center">
              <span className="me-2">Status: {renderStatusBadge(appointment.status)}</span>
              {appointment.isPaid && <Badge bg="success" className="ms-2">Paid</Badge>}
            </div>
          </div>
          <div className="d-flex flex-wrap mt-2 mt-md-0 appointment-buttons-mobile">
            <Button
              onClick={() => navigate(`/appointments/${appointment._id}`)}
              variant="outline-primary"
              size="sm"
              className="me-2 mb-1"
            >
              View
            </Button>
            {appointment.status === 'pending' && (
              <Button
                onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                variant="success"
                size="sm"
                className="me-2 mb-1"
              >
                Confirm
              </Button>
            )}
            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
              <Button
                onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                variant="primary"
                size="sm"
                className="me-2 mb-1"
              >
                Complete
              </Button>
            )}
            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
              <Button
                onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                variant="danger"
                size="sm"
                className="mb-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </ListGroup.Item>
    );
  };

  return (
    <Container className="py-4 doctor-dashboard-container">
      <h1 className="mb-4">Doctor Dashboard</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="overview" title="Overview">
              <Row>
                <Col xs={12} md={4} className="mb-4">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>
                        <FaUserMd className="me-2" /> Doctor Profile
                      </Card.Title>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Name:</strong> {userInfo.name}
                        </ListGroup.Item>
                        {doctorProfile && (
                          <>
                            <ListGroup.Item>
                              <strong>Specialization:</strong> {doctorProfile.specialization}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Experience:</strong> {doctorProfile.experience} years
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Fee:</strong> ₹{doctorProfile.fees}
                            </ListGroup.Item>
                          </>
                        )}
                      </ListGroup>
                      <Button
                        onClick={() => setActiveTab('profile')}
                        variant="outline-primary"
                        className="w-100 mt-3"
                      >
                        {doctorProfile ? 'Edit Profile' : 'Create Profile'}
                      </Button>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>
                        <FaCalendarAlt className="me-2" /> Appointment Stats
                      </Card.Title>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          Today's Appointments
                          <Badge bg="primary" pill>{getTodayAppointments().length}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          Pending Confirmation
                          <Badge bg="warning" pill>{getPendingAppointmentsCount()}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          Confirmed
                          <Badge bg="success" pill>{getConfirmedAppointmentsCount()}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          Total Appointments
                          <Badge bg="secondary" pill>{appointments.length}</Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} md={8}>
                  {appointmentsLoading ? (
                    <Loader />
                  ) : appointmentsError ? (
                    <Message variant="danger">{appointmentsError}</Message>
                  ) : (
                    <>
                      {getTodayAppointments().length > 0 && (
                        <Card className="mb-4">
                          <Card.Body>
                            <Card.Title>
                              <FaClock className="me-2" /> Today's Appointments
                            </Card.Title>
                            <ListGroup variant="flush">
                              {getTodayAppointments().map(appointment => (
                                <React.Fragment key={appointment._id}>
                                  {renderAppointmentItem(appointment, false)}
                                </React.Fragment>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      )}

                      {getPendingAppointmentsCount() > 0 && (
                        <Card className="mb-4">
                          <Card.Body>
                            <Card.Title>
                              <FaHourglass className="me-2" /> Pending Appointments
                            </Card.Title>
                            <ListGroup variant="flush">
                              {appointments
                                .filter(app => app.status === 'pending')
                                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                                .slice(0, 5)
                                .map(appointment => (
                                  <React.Fragment key={appointment._id}>
                                    {renderAppointmentItem(appointment)}
                                  </React.Fragment>
                                ))}
                            </ListGroup>
                            {appointments.filter(app => app.status === 'pending').length > 5 && (
                              <div className="text-center mt-3">
                                <Button
                                  onClick={() => setActiveTab('appointments')}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  View All Pending Appointments
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      )}

                      {getUpcomingAppointments().length > 0 && (
                        <Card className="mb-4">
                          <Card.Body>
                            <Card.Title>
                              <FaCalendarAlt className="me-2" /> Upcoming Appointments
                            </Card.Title>
                            <ListGroup variant="flush">
                              {getUpcomingAppointments()
                                .slice(0, 5)
                                .map(appointment => (
                                  <React.Fragment key={appointment._id}>
                                    {renderAppointmentItem(appointment)}
                                  </React.Fragment>
                                ))}
                            </ListGroup>
                            {getUpcomingAppointments().length > 5 && (
                              <div className="text-center mt-3">
                                <Button
                                  onClick={() => setActiveTab('appointments')}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  View All Upcoming Appointments
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="profile" title="Doctor Profile">
              <Card>
                <Card.Body>
                  <Card.Title>
                    {doctorProfile ? 'Update Profile' : 'Create Doctor Profile'}
                  </Card.Title>

                  {profileError && <Message variant="danger">{profileError}</Message>}

                  <Form onSubmit={submitProfileHandler}>
                    <Form.Group className="mb-3" controlId="specialization">
                      <Form.Label>Specialization</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Cardiologist, Dermatologist"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3" controlId="experience">
                          <Form.Label>Years of Experience</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3" controlId="fees">
                          <Form.Label>Consultation Fee (₹)</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={fees}
                            onChange={(e) => setFees(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label>Practice Address</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Full address of your practice"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="bio">
                      <Form.Label>Professional Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Brief description of your qualifications and expertise"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <h5 className="mt-4 mb-3">Available Timings</h5>
                    {timings.map((timing, index) => (
                      <Card key={timing.day} className="mb-3">
                        <Card.Body>
                          <Card.Title>{timing.day}</Card.Title>
                          <Row>
                            <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                              <Form.Group>
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control
                                  type="time"
                                  value={timing.startTime}
                                  onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
                                  disabled={!timing.isAvailable}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                              <Form.Group>
                                <Form.Label>End Time</Form.Label>
                                <Form.Control
                                  type="time"
                                  value={timing.endTime}
                                  onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
                                  disabled={!timing.isAvailable}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={12} sm={4} className="d-flex align-items-center justify-content-start justify-content-sm-center">
                              <Form.Check
                                type="switch"
                                id={`availability-switch-${index}`}
                                label="Available"
                                checked={timing.isAvailable}
                                onChange={() => handleTimingChange(index, 'isAvailable')}
                                className="mt-2 mt-sm-4"
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mt-3"
                      disabled={profileLoading}
                    >
                      {profileLoading ? 'Saving...' : (doctorProfile ? 'Update Profile' : 'Create Profile')}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="appointments" title="All Appointments">
              {appointmentsLoading ? (
                <Loader />
              ) : appointmentsError ? (
                <Message variant="danger">{appointmentsError}</Message>
              ) : (
                <Tabs defaultActiveKey="upcoming" id="appointments-tabs" className="mb-3 flex-nowrap overflow-auto appointment-tabs">
                  <Tab eventKey="upcoming" title="Upcoming">
                    {getUpcomingAppointments().length === 0 ? (
                      <Message>No upcoming appointments</Message>
                    ) : (
                      <ListGroup>
                        {getUpcomingAppointments().map(appointment => (
                          <React.Fragment key={appointment._id}>
                            {renderAppointmentItem(appointment)}
                          </React.Fragment>
                        ))}
                      </ListGroup>
                    )}
                  </Tab>
                  <Tab eventKey="today" title="Today">
                    {getTodayAppointments().length === 0 ? (
                      <Message>No appointments for today</Message>
                    ) : (
                      <ListGroup>
                        {getTodayAppointments().map(appointment => (
                          <React.Fragment key={appointment._id}>
                            {renderAppointmentItem(appointment, false)}
                          </React.Fragment>
                        ))}
                      </ListGroup>
                    )}
                  </Tab>
                  <Tab eventKey="past" title="Past">
                    {getPastAppointments().length === 0 ? (
                      <Message>No past appointments</Message>
                    ) : (
                      <ListGroup>
                        {getPastAppointments().slice(0, 10).map(appointment => (
                          <React.Fragment key={appointment._id}>
                            {renderAppointmentItem(appointment)}
                          </React.Fragment>
                        ))}
                      </ListGroup>
                    )}
                  </Tab>
                  <Tab eventKey="pending" title={`Pending (${getPendingAppointmentsCount()})`}>
                    {getPendingAppointmentsCount() === 0 ? (
                      <Message>No pending appointments</Message>
                    ) : (
                      <ListGroup>
                        {appointments
                          .filter(app => app.status === 'pending')
                          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                          .map(appointment => (
                            <React.Fragment key={appointment._id}>
                              {renderAppointmentItem(appointment)}
                            </React.Fragment>
                          ))}
                      </ListGroup>
                    )}
                  </Tab>
                </Tabs>
              )}
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
};

export default DoctorDashboard; 