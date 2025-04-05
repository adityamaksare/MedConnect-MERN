import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaUserPlus, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { AuthContext } from '../context/AuthContext';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

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

const Home = () => {
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    // Set home page title
    document.title = 'MedConnect | Your Health, Our Priority';

    const fetchTopDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/doctors?limit=4');
        console.log('Fetched top doctors:', data);
        // Filter out Ragesh Sharma from the doctors list
        const filteredDoctors = data.filter(doctor =>
          doctor.user?.name !== 'Ragesh Sharma'
        );
        setTopDoctors(filteredDoctors);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top doctors:', err);
        setError('Failed to fetch top doctors');
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, []);

  // Features for the home page
  const features = [
    { title: 'Expert Doctors', icon: <FaUserMd />, text: 'Access to a network of qualified and experienced healthcare professionals.' },
    { title: 'Easy Scheduling', icon: <FaCalendarAlt />, text: 'Book appointments online 24/7 with just a few clicks, no phone calls needed.' },
    { title: 'Patient Profiles', icon: <FaUserPlus />, text: 'Manage your health information and appointment history in one place.' },
    { title: 'Health Tracking', icon: <FaChartLine />, text: 'Keep track of your appointments and health records over time.' }
  ];

  return (
    <>
      {/* Hero Section */}
      <motion.section
        className="hero py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(135deg, #104c80 0%, #3a8ade 100%)',
          borderRadius: '24px',
          margin: '20px 0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          zIndex: 0
        }}></div>

        <Container>
          <Row className="align-items-center">
            <Col className="text-white text-center py-5" style={{ zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="display-4 fw-bold mb-3">Welcome to MedConnect</h1>
                <AnimatedHeadline />
              </motion.div>
              <motion.p
                className="lead mb-4 text-white mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{ maxWidth: '700px', fontSize: '1.2rem' }}
              >
                Find the right doctor, book an appointment, and get the care you deserve.
                MedConnect makes healthcare accessible and convenient.
              </motion.p>
              <motion.div
                className="d-flex flex-wrap gap-3 justify-content-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  as={Link}
                  to="/doctors"
                  size="lg"
                  variant="light"
                  className="fw-bold px-4"
                  style={{
                    borderRadius: '50px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  Find Doctors
                </Button>
                {!userInfo && (
                  <Button
                    as={Link}
                    to="/register"
                    size="lg"
                    variant="outline-light"
                    className="fw-bold px-4"
                    style={{
                      borderRadius: '50px',
                      borderWidth: '2px'
                    }}
                  >
                    Sign Up Now
                  </Button>
                )}
              </motion.div>
            </Col>
          </Row>
        </Container>
      </motion.section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <motion.h2
            className="text-center mb-5 fw-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Why Choose MedConnect
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} className="mb-4" key={index}>
                  <motion.div
                    variants={fadeInUp}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-100 text-center py-4 border-0 shadow-sm">
                      <div className="text-center mb-3">
                        <motion.span
                          style={{ fontSize: '3rem', color: 'var(--primary-blue)' }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {feature.icon}
                        </motion.span>
                      </div>
                      <Card.Body>
                        <Card.Title className="fw-bold">{feature.title}</Card.Title>
                        <Card.Text>
                          {feature.text}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-5 bg-light">
        <Container>
          <motion.h2
            className="text-center mb-5 fw-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Top Doctors
          </motion.h2>

          {loading ? (
            <Loader />
          ) : error ? (
            <Message>{error}</Message>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Row>
                {topDoctors && topDoctors.length > 0 ? (
                  topDoctors.slice(0, 3).map((doctor, index) => (
                    <Col key={doctor._id} lg={4} md={6} className="mb-4">
                      <motion.div
                        variants={fadeInUp}
                        whileHover={{ y: -10, transition: { duration: 0.2 } }}
                      >
                        <Card className="doctor-card h-100 border-0 shadow-sm">
                          <div className="text-center pt-4">
                            <motion.div
                              style={{
                                backgroundColor: generateAvatarData(doctor.user?.name || 'Doctor').bgColor,
                                color: '#ffffff',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                marginBottom: '15px',
                                fontSize: '32px',
                                fontWeight: 'bold'
                              }}
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {generateAvatarData(doctor.user?.name || 'Doctor').initials}
                            </motion.div>
                          </div>
                          <Card.Body>
                            <Card.Title className="fw-bold">{doctor.user?.name || 'Doctor'}</Card.Title>
                            <div className="d-flex align-items-center mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} style={{ color: i < (doctor.ratings || 4) ? '#FFD700' : '#e4e5e9' }}>
                                  ★
                                </span>
                              ))}
                              <span className="ms-1 small text-muted">({doctor.reviewCount || '24'})</span>
                            </div>
                            <Card.Text className="mb-1">
                              <strong>{doctor.specialization}</strong>
                            </Card.Text>
                            <Card.Text className="small text-muted mb-3">
                              {doctor.bio?.substring(0, 60) || `${doctor.experience || '10'}+ years of experience with expertise in ${doctor.specialization?.toLowerCase() || 'healthcare'}.`}
                              {doctor.bio?.length > 60 && '...'}
                            </Card.Text>
                            <div className="text-center mt-3">
                              <Button
                                as={Link}
                                to={`/doctors/${doctor._id}`}
                                variant="primary"
                                size="sm"
                                className="w-100"
                              >
                                View and Book
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    </Col>
                  ))
                ) : (
                  <Col>No doctors found.</Col>
                )}
              </Row>
            </motion.div>
          )}
        </Container>
      </section>
    </>
  );
};

export default Home;