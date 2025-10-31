import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { fetchUserProfile } from "../api/CourseList";
import MainLoader from "../components/MainPageLoader";
import "./Homepage.css";
import { motion } from "framer-motion";


// ✅ Logout Toast Component
const LogoutToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="logout-toast">
      <span className="logout-toast-icon">✔</span>
      Logout Successful! Redirecting to login...
    </div>
  );
};

const students = [
    {
        name: "Rahul Sharma",
        title: "Software Developer at Infosys",
        text: "LearnSphere transformed my career! The live mentorship and hands-on projects helped me crack my first software role.",
        img: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        name: "Sneha Verma",
        title: "Cloud Engineer at TCS",
        text: "The AWS course was detailed, interactive, and practical. I cleared my certification with confidence!",
        img: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
        name: "Arjun Nair",
        title: "Frontend Developer at Zoho",
        text: "I loved the affordable subscription model — quality courses and amazing mentors without breaking the bank.",
        img: "https://randomuser.me/api/portraits/men/56.jpg",
    },
    {
        name: "Meera Krishnan",
        title: "React Developer Intern",
        text: "Coming from a non-tech background, I was nervous. LearnSphere mentors made everything clear and practical.",
        img: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
        name: "Ravi Iyer",
        title: "DevOps Engineer at Cognizant",
        text: "The discussion forum is a gem — I got instant help from peers and mentors whenever I got stuck.",
        img: "https://randomuser.me/api/portraits/men/71.jpg",
    },
    {
        name: "Aditi Singh",
        title: "Data Analyst at Accenture",
        text: "The career guidance team really helped me structure my resume and prepare for interviews. Highly recommended!",
        img: "https://randomuser.me/api/portraits/women/32.jpg",
    },
    {
        name: "Vikram Patel",
        title: "Full Stack Engineer at IBM",
        text: "I found the projects very practical and close to real-world challenges. It made interviews much easier.",
        img: "https://randomuser.me/api/portraits/men/21.jpg",
    },
    {
        name: "Priya Menon",
        title: "ML Engineer at Wipro",
        text: "LearnSphere’s AI and ML courses are top-notch! Loved the blend of theory and projects.",
        img: "https://randomuser.me/api/portraits/women/66.jpg",
    },
    {
        name: "Aman Gupta",
        title: "Backend Developer at Capgemini",
        text: "The Node.js course structure is excellent. The live coding sessions helped me master APIs.",
        img: "https://randomuser.me/api/portraits/men/34.jpg",
    },
    {
        name: "Divya Ramesh",
        title: "Cybersecurity Analyst at Deloitte",
        text: "The mentors are super supportive. The real-world labs gave me confidence for my job role.",
        img: "https://randomuser.me/api/portraits/women/64.jpg",
    },
    {
        name: "Karan Malhotra",
        title: "UI/UX Designer at Byjus",
        text: "I learned so much about design thinking and user research. Great content and instructors!",
        img: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    {
        name: "Neha Suresh",
        title: "Data Scientist at Flipkart",
        text: "The data science bootcamp was incredibly detailed — I landed a job right after completion!",
        img: "https://randomuser.me/api/portraits/women/52.jpg",
    },
];

const mentors = [
    {
        name: "Sanoj Kumar",
        role: "Senior Software Engineer",
        exp: "8+ years in Backend developments",
        img: "/images/beacoder_tutor_sanoj.png",
        linkedinUrl : "www.linkedin.com/in/sanoj-kumar-nk",
    },
    {
        name: "Naveen Kumar",
        role: "Senior Software Engineer",
        exp: "9+ years in UI/UX and JS Frameworks",
        img: "/images/beacoder_tutor_naveen.png",
        linkedinUrl : "https://www.linkedin.com/in/naveenkumar-a-001/",
    },
    {
        name: "Arun S K",
        role: "Lead Software Engineer I",
        exp: "8+ years in Backend developments",
        img: "/images/beacoder_tutor_arun.png",
        linkedinUrl : "https://www.linkedin.com/in/arunkavi115/",
    },
    {
        name: "Akshay S",
        role: "Full Stack Developer",
        exp: "6+ years in MERN Stack",
        img: "/images/beacoder_tutor_akshay.png",
        linkedinUrl : "https://www.linkedin.com/in/arunkavi115/",
    },
    {
        name: "Ahalya",
        role: "Full Stack Developer",
        exp: "6+ years in MERN Stack",
        img: "/images/beacoder_tutor_ahalya.png",
        linkedinUrl : "https://www.linkedin.com/in/arunkavi115/",
    },
];

const features = [
    {
        title: "Live Classes",
        text: "Engage in interactive live sessions led by expert instructors who make learning dynamic and fun.",
        img: "https://images.stockcake.com/public/d/c/4/dc43867d-5a5b-49e4-82e7-3eb135eb8dea_large/coding-classroom-activity-stockcake.jpg",
    },
    {
        title: "Certified Courses",
        text: "Earn industry-recognized certificates to showcase your technical expertise and boost your resume.",
        img: "https://www.cio.com/wp-content/uploads/2023/05/certificate_certification_by_svetazi_gettyimages-655331082_2400x1600-100788475-orig-2.jpg",
    },
    {
        title: "Hands-on Projects",
        text: "Work on real-world projects and build a strong portfolio that makes you job-ready from day one.",
        img: "https://www.webstackacademy.com/wp-content/uploads/2023/09/5-2-1.jpg",
    },
    {
        title: "Career Mentorship",
        text: "Get one-on-one mentorship from experienced developers to guide your career growth effectively.",
        img: "https://images.stockcake.com/public/d/c/4/dc43867d-5a5b-49e4-82e7-3eb135eb8dea_large/coding-classroom-activity-stockcake.jpg",
    },
    {
        title: "Discussion Forums",
        text: "Collaborate and solve doubts with a community of learners and mentors available 24/7.",
        img: "https://www.webstackacademy.com/wp-content/uploads/2023/09/5-2-1.jpg",
    },
    {
        title: "Affordable Learning",
        text: "Access all premium content at an unbeatable price — learning should be for everyone.",
        img: "https://www.cio.com/wp-content/uploads/2023/05/certificate_certification_by_svetazi_gettyimages-655331082_2400x1600-100788475-orig-2.jpg",
    },
];

// Duplicate mentors for infinite scroll effect
const loopedMentors = [...mentors, ...mentors];


const HomePage = () => {
    const [hovered, setHovered] = useState(null);
    const [active, setActive] = useState(0);
    const [userName, setUserName] = useState("User");
    const [showLogoutToast, setShowLogoutToast] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [x, setX] = useState(0);
    const [showFirstSet, setShowFirstSet] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setX((prev) => (prev <= -100 * mentors.length ? 0 : prev - 0.3)); // speed and reset
        }, 30);
        return () => clearInterval(interval);
    }, [mentors.length]);

    useEffect(() => {
        const flipInterval = setInterval(() => {
            setFlipped((prev) => !prev);
        }, 5000); // flips every 5s
        return () => clearInterval(flipInterval);
    }, []);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (!current) return;
        const scrollAmount = direction === "left" ? -400 : 400;
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const courses = [
        {
            title: "JAVA",
            img: "https://as2.ftcdn.net/v2/jpg/02/92/83/57/1000_F_292835773_oImixQGFKLpOPnjfsbesHyqdjOk5hsxL.jpg",
            rating : "4.7",
            viewers : "(5.3k)",
        },
        {
            title: "Data Structure & Algorithm",
            img: "https://as1.ftcdn.net/v2/jpg/00/51/66/86/1000_F_51668666_ySJrR1BTXPw4bPbUPm0rxMK0U4ofS9kH.jpg",
            rating : "4.6",
            viewers : "(4.1k)",
        },
        {
            title: "Database Fundamentals (SQL)",
            img: "https://as1.ftcdn.net/v2/jpg/01/38/58/62/1000_F_138586261_nYWe7WbUi9ouurv6tcl2WmpLaXV1xdea.jpg",
            rating : "4.2",
            viewers : "(6.2k)",
        },
        {
            title: "Cloud Computing (AWS)",
            img: "https://as2.ftcdn.net/v2/jpg/05/42/29/57/1000_F_542295701_fZVdsAuV5OBjQ2BUDhjOTBR32JThLRa6.jpg",
            rating : "4.1",
            viewers : "(7.4k)",
        },
        {
            title: "React JS",
            img: "https://as2.ftcdn.net/v2/jpg/16/68/26/85/1000_F_1668268577_NQLAdRVIYMx9iBQq6OwCqwCH2mW6KN1R.jpg",
            rating : "4.0",
            viewers : "(3.3k)",
        },
    ];

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        const fetchData = async () => {
            try {
                const [coursesData, userData] = await Promise.all([
                    fetchUserProfile(token),
                ]);
                setUserName(userData.userName);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setShowLogoutToast(true);
    };

    useEffect(() => {
        if (showLogoutToast) {
            const timer = setTimeout(() => {
                setShowLogoutToast(false);
                navigate("/login");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showLogoutToast, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowFirstSet((prev) => !prev);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentSet = showFirstSet ? students.slice(0, 6) : students.slice(6, 12);

    if (isLoading) {
        return <MainLoader variant="headerSidebarSkeleton" text="Loading courses..." />;
    }

    return (
        <div className="course-list-container">
            <Sidebar active={active} hovered={hovered} setActive={setActive} setHovered={setHovered} />

            <div className="course-list-main" style={{ overflowX: 'hidden' }}>
                <TopBar userName={userName} onLogout={handleLogout} />

                <div
                    style={{
                        flex: '1 1 auto',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        paddingBottom: '40px',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#333',
                        lineHeight: 1.6,
                        margin: 0,
                        padding: 0,
                        overflowX: "hidden",
                        background: "linear-gradient(135deg, rgb(240, 247, 255) 0%, rgb(220, 235, 255) 100%)"
                    }}
                >

                    {/* ================= Hero Section ================= */}
                    <section
                        style={{
                            backgroundImage: 'url("/hero.png")',
                            backgroundSize: '110%',
                            backgroundPosition: 'right -100px top -310px',
                            backgroundRepeat: 'no-repeat',
                            height: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            color: '#fff',
                            textAlign: 'left',
                            position: 'relative',
                            paddingLeft: '8%',
                            borderRadius: '0 0 60px 60px',
                            overflow: 'hidden',
                            // boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* ✨ Gradient Overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                    'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2)), radial-gradient(circle at bottom left, rgba(0,123,255,0.25), transparent 70%)',
                                zIndex: 1,
                            }}
                        ></div>

                        <motion.div
                            style={{
                                position: 'relative',
                                zIndex: 2,
                                maxWidth: '600px',
                                padding: '30px 40px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '20px', lineHeight: 1.2 }}>
                                Empower Your <span style={{ color: '#00c3ff' }}>Learning Journey</span>
                            </h1>

                            <p
                                style={{
                                    fontSize: '1.15rem',
                                    marginBottom: '35px',
                                    opacity: 0.9,
                                    color: 'rgba(255,255,255,0.95)',
                                }}
                            >
                                Learn from industry experts anytime, anywhere. Upgrade your skills with our
                                e-learning platform and take your career to the next level.
                            </p>

                            <motion.button
                                whileHover={{
                                    scale: 1.08,
                                    boxShadow: '0 8px 25px rgba(0,195,255,0.6)',
                                    backgroundColor: '#00c3ff',
                                    color: '#fff',
                                }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#007bff',
                                    border: 'none',
                                    padding: '15px 45px',
                                    borderRadius: '30px',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    transition: '0.4s',
                                }}
                            >
                                Explore Courses
                            </motion.button>
                        </motion.div>
                    </section>

                    {/* ================= What We Do ================= */}
                    <motion.section
                        style={{
                            background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                            padding: "100px 20px",
                            textAlign: "center",
                            width: "100%",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {/* Floating Glow Circles */}

                        {/* Animated Heading */}
                        <motion.h2
                            style={{
                                fontSize: "3rem", // Increased by 4px (was 2.8rem)
                                color: "#0b2546",
                                fontWeight: 800,
                                marginBottom: "50px",
                                position: "relative",
                                display: "inline-block",
                                zIndex: 1,
                                letterSpacing: "1px",
                                textShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            }}
                        >
                            What We Do
                            {/* Animated Underline */}
                            <motion.span
                                style={{
                                    position: "absolute",
                                    bottom: -10,
                                    left: 0,
                                    height: "4px",
                                    width: "40%",
                                    borderRadius: "4px",
                                    background: "linear-gradient(90deg, #00c3ff, #007bff, #00c3ff)",
                                    boxShadow: "0 0 10px rgba(0, 195, 255, 0.6)",
                                }}
                                animate={{
                                    x: ["0%", "150%", "0%"], // moves left to right and back
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.h2>

                        {/* Glass Paragraph Box */}
                        <motion.div
                            style={{
                                maxWidth: "950px",
                                margin: "0 auto",
                                background: "rgba(255, 255, 255, 0.55)",
                                backdropFilter: "blur(12px)",
                                borderRadius: "25px",
                                padding: "60px 70px",
                                zIndex: 1,
                                boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                                lineHeight: 1.9,
                                color: "#475569",
                                textAlign: "left",
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <p style={{ fontSize: "1.45rem", marginBottom: "25px" }}>
                                We turn <strong style={{ color: "#007bff" }}>learners</strong> into{" "}
                                <strong style={{ color: "#00c3ff" }}>creators</strong>. Our platform
                                bridges the gap between theory and practice through{" "}
                                <strong>structured learning paths</strong>,{" "}
                                <strong>mentor-led guidance</strong>, and{" "}
                                <strong>hands-on projects</strong>.
                            </p>

                            <p style={{ fontSize: "1.45rem", marginBottom: "25px" }}>
                                From <strong style={{ color: "#007bff" }}>DSA</strong> to{" "}
                                <strong style={{ color: "#00c3ff" }}>system design</strong>,{" "}
                                <strong>mock interviews</strong> to{" "}
                                <strong>resume building</strong> and{" "}
                                <strong>interview referral</strong> — we prepare you for every stage of your{" "}
                                <strong>software engineering journey</strong>.
                            </p>

                            <p style={{ fontSize: "1.45rem", marginBottom: "25px" }}>
                                Our <strong>mentors</strong> are <strong>engineers</strong> from{" "}
                                <span style={{ background: "linear-gradient(90deg, #007bff, #00c3ff)", 
                                                color: "#fff", padding: "2px 8px", borderRadius: "8px" }}>
                                    leading product-based companies
                                </span>{" "}
                                with years of real-world experience guiding aspiring developers.
                            </p>
                            <p
                                style={{
                                    fontSize: "1.6rem",
                                    marginBottom: "25px",
                                    padding: "15px 20px",
                                    backgroundColor: "#f4f8ff",
                                    borderLeft: "5px solid #007bff",
                                    borderRadius: "10px",
                                    lineHeight: "1.8",
                                }}
                                >
                                <strong style={{ color: "#007bff" }}>Our promise:</strong> You pay the main fee{" "}
                                <strong style={{ color: "#00b894" }}>only after you get a job. </strong>  
                                That’s how confident we are in our methods.
                            </p>
                        </motion.div>
                    </motion.section>


                    {/* ================= What You Should Do ================= */}
                    <motion.section
                        style={{
                            background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                            padding: "100px 20px",
                            textAlign: "center",
                            width: "100%",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {/* Floating Glow Circles */}

                        {/* Animated Heading */}
                        <motion.h2
                            style={{
                                fontSize: "3rem", // Increased by 4px (was 2.8rem)
                                color: "#0b2546",
                                fontWeight: 800,
                                marginBottom: "50px",
                                position: "relative",
                                display: "inline-block",
                                zIndex: 1,
                                letterSpacing: "1px",
                                textShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            }}
                        >
                            What You Should Do ?
                            {/* Animated Underline */}
                            <motion.span
                                style={{
                                    position: "absolute",
                                    bottom: -10,
                                    left: 0,
                                    height: "4px",
                                    width: "40%",
                                    borderRadius: "4px",
                                    background: "linear-gradient(90deg, #00c3ff, #007bff, #00c3ff)",
                                    boxShadow: "0 0 10px rgba(0, 195, 255, 0.6)",
                                }}
                                animate={{
                                    x: ["0%", "150%", "0%"], // moves left to right and back
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.h2>

                        {/* Glass Paragraph Box */}
                        <motion.div
                            style={{
                                maxWidth: "950px",
                                margin: "0 auto",
                                background: "rgba(255, 255, 255, 0.55)",
                                backdropFilter: "blur(12px)",
                                borderRadius: "25px",
                                padding: "60px 70px",
                                zIndex: 1,
                                boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                                lineHeight: 1.9,
                                color: "#475569",
                                textAlign: "left",
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div style={{ fontSize: "1.25rem", lineHeight: "1.8", marginBottom: "35px" }}>
                            <p style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#007bff" }}>
                                Before choosing any course,
                                </strong>{" "}
                                ask the right questions — to yourself, to AI, or to anyone who’s been in IT.
                            </p>

                            <ul style={{ listStyleType: "disc", marginLeft: "25px", marginTop: "10px" }}>
                                <li style={{ marginBottom: "10px" }}>
                                Which are the best <strong>programming languages</strong> and{" "}
                                <strong>frameworks</strong> to learn right now for getting hired?
                                </li>
                                <li style={{ marginBottom: "10px" }}>
                                How do <strong>Referrals</strong> actually work? If companies pay so much for referrals, why aren’t people getting them?
                                </li>
                                <li style={{ marginBottom: "10px" }}>
                                What’s the current <strong>demand for software engineers</strong> in the Indian market?
                                </li>
                                <li style={{ marginBottom: "10px" }}>
                                Are the <strong>mentors</strong> in your course truly experienced — 
                                with at least <strong>5+ years</strong> in real product-based roles?
                                </li>
                                <li>
                                And finally — is there any platform confident enough to say:{" "}
                                <em style={{ color: "#00b894", fontWeight: "600" }}>
                                    “Pay us only after you liked the course”?
                                </em>
                                </li>
                            </ul>
                            </div>

                        </motion.div>
                    </motion.section>

                    {/* ================= Popular Courses ================= */}
                    <motion.section
                        style={{
                            padding: "60px 20px",
                            textAlign: "center",
                            width: "100%",
                            background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                        }}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <motion.h2
                            style={{
                                fontSize: "3rem",
                                color: "#0b2546",
                                fontWeight: 800,
                                marginBottom: "60px",
                                position: "relative",
                                display: "inline-block",
                                zIndex: 1,
                                textShadow: "0 3px 6px rgba(0,0,0,0.1)",
                            }}
                        >
                            Popular Courses
                            <span
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    bottom: -8,
                                    width: "100%",
                                    height: "3px",
                                    background: "linear-gradient(90deg, #00c3ff 0%, #007bff 100%)",
                                    borderRadius: "2px",
                                }}
                            ></span>
                        </motion.h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                                gap: "35px", // increased spacing between cards
                                justifyContent: "center",
                                maxWidth: "1100px",
                                margin: "0 auto",
                            }}
                        >
                            {courses.slice(0, 5).map((course, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -10,
                                        boxShadow: "0 20px 40px rgba(0, 123, 255, 0.25)",
                                        borderColor: "rgba(255,255,255,0.8)",
                                    }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    style={{
                                        background: "rgba(255, 255, 255, 0.6)", // more visible
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.4)",
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        textAlign: "left",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 6px 15px rgba(0,0,0,0.08)", // subtle shadow even before hover
                                    }}
                                >
                                    <img
                                        src={course.img}
                                        alt={course.title}
                                        style={{
                                            width: "100%",
                                            height: "230px",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <div style={{ padding: "18px 22px" }}>
                                        <h3
                                            style={{
                                                color: "#0b2546",
                                                fontWeight: 700,
                                                marginBottom: "6px",
                                                fontSize: "1.2rem",
                                                lineHeight: "1.3",
                                            }}
                                        >
                                            {course.title}
                                        </h3>
                                        <div style={{ marginBottom: "10px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} style={{ color: i < 4 ? "#FFD700" : "#ccc" }}>★</span>
                                            ))}
                                            <span style={{ color: "#475569", marginLeft: "6px", fontSize: "0.9rem" }}>
                                                {course.rating} {course.viewers}
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                color: "#475569",
                                                marginBottom: "15px",
                                                fontSize: "0.9rem",
                                                lineHeight: "1.4",
                                            }}
                                        >
                                            Master industry-level skills with real-time mentorship and hands-on projects.
                                        </p>
                                        <button
                                            style={{
                                                background: "linear-gradient(90deg, #00c3ff, #007bff)",
                                                color: "#fff",
                                                border: "none",
                                                padding: "10px 22px",
                                                borderRadius: "30px",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                fontSize: "0.95rem",
                                                boxShadow: "0 6px 15px rgba(0,195,255,0.3)",
                                            }}
                                        >
                                            View Course
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ================= Instructors ================= */}
                    <motion.section
                        style={{
                            padding: "100px 20px",
                            textAlign: "center",
                            background: "linear-gradient(135deg, #eaf3ff 0%, #d4e4ff 100%)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {/* Floating Glow Circles */}


                        {/* Animated Heading */}
                        <motion.h2
                            style={{
                                fontSize: "3rem",
                                color: "#0b2546",
                                fontWeight: 800,
                                marginBottom: "60px",
                                position: "relative",
                                display: "inline-block",
                                zIndex: 1,
                                textShadow: "0 3px 6px rgba(0,0,0,0.1)",
                            }}
                        >
                            Meet Our Mentors
                            <motion.span
                                style={{
                                    position: "absolute",
                                    bottom: -10,
                                    left: 0,
                                    height: "4px",
                                    width: "40%",
                                    borderRadius: "4px",
                                    background: "linear-gradient(90deg, #00c3ff, #007bff, #00c3ff)",
                                    boxShadow: "0 0 10px rgba(0,195,255,0.5)",
                                }}
                                animate={{
                                    x: ["0%", "150%", "0%"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.h2>

                        {/* Continuous Infinite Scroll Slider */}
                        <div
                            style={{
                                overflow: "hidden",
                                position: "relative",
                                width: "100%",
                            }}
                        >
                            <motion.div
                                style={{
                                    display: "flex",
                                    gap: "35px",
                                }}
                                animate={{
                                    x: ["0%", "-50%"], // Move left half the width (since we doubled the list)
                                }}
                                transition={{
                                    duration: 40, // <-- Slower speed: increase this number to move slower (e.g., 60 for very slow)
                                    ease: "linear",
                                    repeat: Infinity,
                                }}
                            >
                                {loopedMentors.map((mentor, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: 1,
                                            boxShadow: "0 15px 25px rgba(0,123,255,0.25)",
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                        style={{
                                            flex: "0 0 280px",
                                            background: "rgba(255, 255, 255, 0.75)",
                                            backdropFilter: "blur(8px)",
                                            borderRadius: "20px",
                                            padding: "30px",
                                            boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                                            textAlign: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <motion.img
                                            src={mentor.img}
                                            alt={mentor.name}
                                            style={{
                                                width: "100%",
                                                height: "250px",
                                                objectFit: "cover",
                                                borderRadius: "15px",
                                                marginBottom: "20px",
                                                boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
                                            }}
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <h3
                                            style={{
                                                color: "#0b2546",
                                                fontWeight: 700,
                                                fontSize: "1.4rem",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {mentor.name}
                                        </h3>
                                        <p
                                            style={{
                                                color: "#007bff",
                                                fontWeight: 600,
                                                marginBottom: "8px",
                                                fontSize: "1.1rem",
                                            }}
                                        >
                                            {mentor.role}
                                        </p>
                                        <p style={{ color: "#475569", fontSize: "1rem" }}>{mentor.exp}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* ================= Testimonials ================= */}
                    <motion.section
                        style={{
                            padding: "60px 20px",
                            textAlign: "center",
                            width: "100%",
                            background: "linear-gradient(135deg, rgb(234, 243, 255) 0%, rgb(212, 228, 255) 100%)"
                        }}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}

                    >
                        {/* Floating Glow Orbs */}


                        {/* Heading */}
                        <motion.h2
                            style={{
                                fontSize: "3rem",
                                color: "#0b2546",
                                fontWeight: 800,
                                marginBottom: "60px",
                                position: "relative",
                                display: "inline-block",
                                zIndex: 1,
                                textShadow: "0 3px 6px rgba(0,0,0,0.1)",
                            }}
                        >
                            What Our Students Say
                            <span
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    bottom: -8,
                                    width: "100%",
                                    height: "3px",
                                    background: "linear-gradient(90deg, #00c3ff 0%, #007bff 100%)",
                                    borderRadius: "2px",
                                }}
                            ></span>
                        </motion.h2>

                        {/* Grid of Flipping Cards */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "80px 80px", // more vertical + horizontal gap
                                justifyItems: "center",
                                alignItems: "start",
                                zIndex: 1,
                                position: "relative",
                                maxWidth: "1200px",
                                margin: "0 auto",
                                padding: "0 20px",
                                boxSizing: "border-box",
                            }}
                        >
                            {currentSet.map((student, i) => (
                                <div
                                    key={i}
                                    style={{
                                        perspective: "1000px",
                                        width: "100%",
                                        maxWidth: "340px",
                                        height: "220px",
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            rotateY: showFirstSet ? 0 : 180,
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            ease: "easeInOut",
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            position: "relative",
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        {/* Front Side */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                width: "100%",
                                                height: "100%",
                                                backfaceVisibility: "hidden",
                                                background: "rgba(255,255,255,0.85)",
                                                borderRadius: "20px",
                                                padding: "20px",
                                                textAlign: "left",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                                backdropFilter: "blur(10px)",
                                                transform: "rotateY(0deg)",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <img
                                                    src={student.img}
                                                    alt={student.name}
                                                    style={{
                                                        width: "45px",
                                                        height: "45px",
                                                        borderRadius: "50%",
                                                        marginRight: "10px",
                                                        // boxShadow:
                                                        //     "0 4px 10px rgba(0,0,0,0.1)",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <div>
                                                    <h4
                                                        style={{
                                                            color: "#0b2546",
                                                            fontWeight: 700,
                                                            margin: 0,
                                                            fontSize: "1rem",
                                                        }}
                                                    >
                                                        {student.name}
                                                    </h4>
                                                    <p
                                                        style={{
                                                            color: "#007bff",
                                                            margin: 0,
                                                            fontSize: "0.8rem",
                                                        }}
                                                    >
                                                        {student.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <p
                                                style={{
                                                    color: "#475569",
                                                    fontSize: "0.9rem",
                                                    lineHeight: "1.4",
                                                }}
                                            >
                                                “{student.text}”
                                            </p>
                                        </div>

                                        {/* Back Side */}
                                        {students[i + 6] && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    width: "100%",
                                                    height: "100%",
                                                    backfaceVisibility: "hidden",
                                                    background: "rgba(255,255,255,0.9)",
                                                    borderRadius: "20px",
                                                    padding: "20px",
                                                    textAlign: "left",
                                                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                                    backdropFilter: "blur(10px)",
                                                    transform: "rotateY(180deg)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            marginBottom: "10px",
                                                        }}
                                                    >
                                                        <img
                                                            src={students[i + 6].img}
                                                            alt={students[i + 6].name}
                                                            style={{
                                                                width: "45px",
                                                                height: "45px",
                                                                borderRadius: "50%",
                                                                marginRight: "10px",
                                                                boxShadow:
                                                                    "0 4px 10px rgba(0,0,0,0.1)",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                        <div>
                                                            <h4
                                                                style={{
                                                                    color: "#0b2546",
                                                                    fontWeight: 700,
                                                                    margin: 0,
                                                                    fontSize: "1rem",
                                                                }}
                                                            >
                                                                {students[i + 6].name}
                                                            </h4>
                                                            <p
                                                                style={{
                                                                    color: "#007bff",
                                                                    margin: 0,
                                                                    fontSize: "0.8rem",
                                                                }}
                                                            >
                                                                {students[i + 6].title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p
                                                        style={{
                                                            color: "#475569",
                                                            fontSize: "0.9rem",
                                                            lineHeight: "1.4",
                                                        }}
                                                    >
                                                        “{students[i + 6].text}”
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ================= Platform Features ================= */}
                    <motion.section
                        style={{
                            padding: "100px 20px",
                            textAlign: "center",
                            background: "linear-gradient(135deg, #eaf3ff 0%, #d4e4ff 100%)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {/* Animated Heading */}
                        <motion.h2
                            style={{
                                fontSize: "3rem",
                                color: "#0b2546",
                                fontWeight: 800,
                                marginBottom: "80px",
                                position: "relative",
                                display: "inline-block",
                                zIndex: 1,
                                textShadow: "0 3px 6px rgba(0,0,0,0.1)",
                            }}
                        >
                            Platform Features
                            <motion.span
                                style={{
                                    position: "absolute",
                                    bottom: -10,
                                    left: 0,
                                    height: "4px",
                                    width: "40%",
                                    borderRadius: "4px",
                                    background: "linear-gradient(90deg, #00c3ff, #007bff, #00c3ff)",
                                    boxShadow: "0 0 10px rgba(0,195,255,0.5)",
                                }}
                                animate={{
                                    x: ["0%", "150%", "0%"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.h2>

                        {/* 3D Circular Center Rotation */}
                        <div
                            style={{
                                perspective: "1000px",
                                width: "100%",
                                height: "350px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            <motion.div
                                style={{
                                    position: "absolute",
                                    width: "250px",
                                    height: "180px",
                                    transformStyle: "preserve-3d",
                                }}
                                animate={{
                                    rotateY: [0, 360],
                                }}
                                transition={{
                                    duration: 30,
                                    ease: "linear",
                                    repeat: Infinity,
                                }}
                            >
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            position: "absolute",
                                            width: "100%",
                                            height: "100%",
                                            transform: `rotateY(${(i * 360) / features.length}deg) translateZ(350px)`,
                                            background: "rgba(255,255,255,0.85)",
                                            backdropFilter: "blur(8px)",
                                            borderRadius: "16px",
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            textAlign: "center",
                                            padding: "15px",
                                        }}
                                    >
                                        <img
                                            src={feature.img}
                                            alt={feature.title}
                                            style={{
                                                width: "100%",
                                                height: "90px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                                // marginBottom: "10px",
                                                paddingTop: "7px",
                                            }}
                                        />
                                        <h3 style={{ color: "#0b2546", fontWeight: 700, fontSize: "1.1rem", marginBottom: "5px" }}>
                                            {feature.title}
                                        </h3>
                                        <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.2 }}>
                                            {feature.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* ================= Footer ================= */}
                    <footer
                        style={{
                            background: "linear-gradient(135deg, #0b2546 0%, #00172d 100%)",
                            color: "#eaf3ff",
                            padding: "60px 20px 20px",
                            textAlign: "center",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Decorative Glow Circles */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-50px",
                                left: "-50px",
                                width: "150px",
                                height: "150px",
                                background: "rgba(0,195,255,0.2)",
                                borderRadius: "50%",
                                filter: "blur(60px)",
                                zIndex: 0,
                            }}
                        ></div>
                        <div
                            style={{
                                position: "absolute",
                                bottom: "-60px",
                                right: "-40px",
                                width: "180px",
                                height: "180px",
                                background: "rgba(0,123,255,0.25)",
                                borderRadius: "50%",
                                filter: "blur(70px)",
                                zIndex: 0,
                            }}
                        ></div>

                        {/* Footer Content */}
                        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
                            <h2
                                style={{
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    marginBottom: "20px",
                                    letterSpacing: "1px",
                                }}
                            >
                                Learn2Code
                            </h2>
                            <p
                                style={{
                                    color: "#b8c7e0",
                                    fontSize: "1rem",
                                    lineHeight: 1.6,
                                    marginBottom: "30px",
                                }}
                            >
                                Empowering learners to achieve their dreams through high-quality online education and mentorship.
                            </p>

                            {/* Social Links */}
                            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px" }}>
                                {[
                                    { name: "Facebook", icon: "🌐" },
                                    { name: "Twitter", icon: "🐦" },
                                    { name: "Instagram", icon: "📸" },
                                    { name: "LinkedIn", icon: "💼" },
                                ].map((social, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        title={social.name}
                                        style={{
                                            fontSize: "1.6rem",
                                            textDecoration: "none",
                                            color: "#00c3ff",
                                            transition: "transform 0.3s ease, color 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.2)";
                                            e.currentTarget.style.color = "#007bff";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.color = "#00c3ff";
                                        }}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>

                            {/* Divider Line */}
                            <div
                                style={{
                                    height: "2px",
                                    background: "linear-gradient(90deg, transparent, #00c3ff, transparent)",
                                    width: "100%",
                                    marginBottom: "25px",
                                }}
                            ></div>

                            {/* Bottom Text */}
                            <p style={{ fontSize: "0.9rem", color: "#b8c7e0" }}>
                                © {new Date().getFullYear()} <strong>Learn2Code</strong> — All Rights Reserved
                                <br />
                            </p>
                        </div>
                    </footer>

                </div>
            </div>

            <LogoutToast show={showLogoutToast} />
        </div>
    );
};

export default HomePage;

