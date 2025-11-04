import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/CourseList";
import "./Homepage.css";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import LandingPageLoader from "../components/LandingPageLoader";


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
        linkedinUrl: "www.linkedin.com/in/sanoj-kumar-nk",
    },
    {
        name: "Naveen Kumar",
        role: "Senior Software Engineer",
        exp: "9+ years in UI/UX and JS Frameworks",
        img: "/images/beacoder_tutor_naveen.png",
        linkedinUrl: "https://www.linkedin.com/in/naveenkumar-a-001/",
    },
    {
        name: "Arun S K",
        role: "Lead Software Engineer I",
        exp: "8+ years in Backend developments",
        img: "/images/beacoder_tutor_arun.png",
        linkedinUrl: "https://www.linkedin.com/in/arunkavi115/",
    },
    {
        name: "Akshay S",
        role: "Full Stack Developer",
        exp: "6+ years in MERN Stack",
        img: "/images/beacoder_tutor_akshay.png",
        linkedinUrl: "https://www.linkedin.com/in/arunkavi115/",
    },
    {
        name: "Ahalya",
        role: "Full Stack Developer",
        exp: "6+ years in MERN Stack",
        img: "/images/beacoder_tutor_ahalya.png",
        linkedinUrl: "https://www.linkedin.com/in/arunkavi115/",
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


const LandingPage = () => {
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
            rating: "4.7",
            viewers: "(5.3k)",
        },
        {
            title: "Data Structure & Algorithm",
            img: "https://as1.ftcdn.net/v2/jpg/00/51/66/86/1000_F_51668666_ySJrR1BTXPw4bPbUPm0rxMK0U4ofS9kH.jpg",
            rating: "4.6",
            viewers: "(4.1k)",
        },
        {
            title: "Database Fundamentals (SQL)",
            img: "https://as1.ftcdn.net/v2/jpg/01/38/58/62/1000_F_138586261_nYWe7WbUi9ouurv6tcl2WmpLaXV1xdea.jpg",
            rating: "4.2",
            viewers: "(6.2k)",
        },
        {
            title: "Cloud Computing (AWS)",
            img: "https://as2.ftcdn.net/v2/jpg/05/42/29/57/1000_F_542295701_fZVdsAuV5OBjQ2BUDhjOTBR32JThLRa6.jpg",
            rating: "4.1",
            viewers: "(7.4k)",
        },
        {
            title: "React JS",
            img: "https://as2.ftcdn.net/v2/jpg/16/68/26/85/1000_F_1668268577_NQLAdRVIYMx9iBQq6OwCqwCH2mW6KN1R.jpg",
            rating: "4.0",
            viewers: "(3.3k)",
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
        return <LandingPageLoader />;
    }

    return (
        <div
            style={{
                display: "flex",
                height: "100vh", // make the page fill viewport
                overflow: "hidden", // prevent body scroll, we'll scroll inner content
                background: "#f6f8fb",
                width: "100vw",           // ensure full viewport width
                boxSizing: "border-box",  // include paddings in width calculation
                overflowX: "hidden",
            }}
        >
            <div
                style={{
                    flex: "1 1 auto",
                    width: "100%",                // ensure full width inside parent
                    boxSizing: "border-box",      // important to avoid overflow due to padding
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    paddingBottom: "40px",
                    fontFamily: "Poppins, sans-serif",
                    color: "#333",
                    lineHeight: 1.6,
                    margin: 0,
                    overflowX: "hidden",
                    background:
                        "linear-gradient(135deg, rgb(240, 247, 255) 0%, rgb(220, 235, 255) 100%)",
                }}
            >
                <Navbar />

                {/* ================= Hero Section ================= */}
                <section
                    id="home"
                    style={{
                        backgroundImage: 'url("/hero.png")',
                        backgroundSize: "cover",
                        backgroundPosition: window.innerWidth <= 768 ? "center top" : "center 30%", // ✅ bring image slightly down on desktop
                        backgroundRepeat: "no-repeat",
                        minHeight: "clamp(60vh, 80vw, 80vh)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        color: "#fff",
                        textAlign: "left",
                        position: "relative",
                        padding: "0 clamp(4%, 6vw, 8%)",
                        borderRadius: "0 0 60px 60px",
                        overflow: "hidden",
                    }}

                >
                    {/* ✨ Gradient Overlay */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25)), radial-gradient(circle at bottom left, rgba(0,123,255,0.3), transparent 70%)",
                            zIndex: 1,
                        }}
                    ></div>

                    <motion.div
                        style={{
                            position: "relative",
                            zIndex: 2,
                            maxWidth: "700px",
                            padding: "clamp(20px, 5vw, 40px)",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "20px",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1
                            style={{
                                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                                fontWeight: 700,
                                marginBottom: "20px",
                                lineHeight: 1.2,
                            }}
                        >
                            Empower Your{" "}
                            <span style={{ color: "#00c3ff" }}>Learning Journey</span>
                        </h1>

                        <p
                            style={{
                                fontSize: "clamp(1rem, 2vw, 1.3rem)",
                                marginBottom: "35px",
                                opacity: 0.9,
                                color: "rgba(255,255,255,0.95)",
                                lineHeight: 1.6,
                            }}
                        >
                            Learn from industry experts anytime, anywhere. Upgrade your skills
                            with our e-learning platform and take your career to the next level.
                        </p>

                        <motion.button
                            onClick={() => navigate("/signup")}
                            whileHover={{
                                scale: 1.08,
                                boxShadow: "0 8px 25px rgba(0,195,255,0.6)",
                                backgroundColor: "#00c3ff",
                                color: "#fff",
                            }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                backgroundColor: "#fff",
                                color: "#007bff",
                                border: "none",
                                padding: "clamp(12px, 2vw, 16px) clamp(30px, 4vw, 45px)",
                                borderRadius: "30px",
                                fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
                                cursor: "pointer",
                                fontWeight: 600,
                                transition: "0.4s",
                            }}
                        >
                            Register Now
                        </motion.button>
                    </motion.div>
                </section>

                {/* ================= What We Do ================= */}
                <motion.section
                    style={{
                        background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                        padding: "80px 5vw",
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Heading */}
                    <motion.h2
                        style={{
                            fontSize: "clamp(2rem, 5vw, 3rem)", // Responsive font size
                            color: "#0b2546",
                            fontWeight: 800,
                            marginBottom: "40px",
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
                            animate={{ x: ["0%", "150%", "0%"] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.h2>

                    {/* Paragraph Container */}
                    <motion.div
                        style={{
                            maxWidth: "950px",
                            margin: "0 auto",
                            background: "rgba(255, 255, 255, 0.55)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "25px",
                            padding: "clamp(30px, 6vw, 60px) clamp(20px, 5vw, 70px)", // Responsive padding
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
                        <p style={{
                            fontSize: "clamp(1rem, 2vw, 1.45rem)",
                            marginBottom: "25px",
                        }}>
                            We turn <strong style={{ color: "#007bff" }}>learners</strong> into{" "}
                            <strong style={{ color: "#00c3ff" }}>creators</strong>. Our platform
                            bridges the gap between theory and practice through{" "}
                            <strong>structured learning paths</strong>,{" "}
                            <strong>mentor-led guidance</strong>, and{" "}
                            <strong>hands-on projects</strong>.
                        </p>

                        <p style={{
                            fontSize: "clamp(1rem, 2vw, 1.45rem)",
                            marginBottom: "25px",
                        }}>
                            From <strong style={{ color: "#007bff" }}>DSA</strong> to{" "}
                            <strong style={{ color: "#00c3ff" }}>system design</strong>,{" "}
                            <strong>mock interviews</strong> to{" "}
                            <strong>resume building</strong> and{" "}
                            <strong>interview referral</strong> — we prepare you for every stage of your{" "}
                            <strong>software engineering journey</strong>.
                        </p>

                        <p style={{
                            fontSize: "clamp(1rem, 2vw, 1.45rem)",
                            marginBottom: "25px",
                        }}>
                            Our <strong>mentors</strong> are <strong>engineers</strong> from{" "}
                            <span
                                style={{
                                    background: "linear-gradient(90deg, #007bff, #00c3ff)",
                                    color: "#fff",
                                    padding: "2px 8px",
                                    borderRadius: "8px",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                leading product-based companies
                            </span>{" "}
                            with years of real-world experience guiding aspiring developers.
                        </p>

                    </motion.div>
                </motion.section>


                {/* ================= Platform Features ================= */}
                <motion.section
                    id="features"
                    style={{
                        padding: "clamp(20px, 5vw, 50px) clamp(12px, 3vw, 40px) clamp(70px, 8vw, 120px)",
                        textAlign: "center",
                        background: "linear-gradient(135deg, #eaf3ff 0%, #d4e4ff 100%)",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Animated Heading */}
                    <motion.h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 3rem)",
                            color: "#0b2546",
                            fontWeight: 800,
                            marginBottom: "clamp(40px, 8vw, 80px)",
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
                            height: "clamp(280px, 45vw, 400px)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            overflow: "visible",
                        }}
                    >
                        <motion.div
                            style={{
                                position: "absolute",
                                width: "clamp(180px, 25vw, 260px)",
                                height: "clamp(130px, 18vw, 200px)",
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
                                        minHeight: "clamp(150px, 25vw, 220px)", // ✅ flexible height
                                        transform: `rotateY(${(i * 360) / features.length}deg) translateZ(clamp(180px, 30vw, 350px))`,
                                        background: "rgba(255,255,255,0.88)",
                                        backdropFilter: "blur(8px)",
                                        borderRadius: "16px",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        textAlign: "center",
                                        padding: "clamp(10px, 2vw, 20px)",
                                        boxSizing: "border-box", // ✅ important for consistent sizing
                                        overflow: "hidden", // ✅ ensures nothing visually bleeds out
                                    }}
                                >
                                    <img
                                        src={feature.img}
                                        alt={feature.title}
                                        style={{
                                            width: "100%",
                                            height: "clamp(70px, 12vw, 100px)", // ✅ smaller on mobile
                                            objectFit: "cover",
                                            borderRadius: "10px",
                                            marginBottom: "8px",
                                        }}
                                    />
                                    <h3
                                        style={{
                                            color: "#0b2546",
                                            fontWeight: 700,
                                            fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: "#475569",
                                            fontSize: "clamp(0.7rem, 1.3vw, 0.9rem)",
                                            lineHeight: 1.3,
                                            margin: 0,
                                        }}
                                    >
                                        {feature.text}
                                    </p>
                                </motion.div>
                            ))}

                        </motion.div>
                    </div>
                </motion.section>


                {/* ================= What You Should Do ================= */}
                <motion.section
                    style={{
                        background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                        padding: "clamp(40px, 6vw, 100px) clamp(16px, 5vw, 80px)", // ✅ reduced min padding for mobile
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Animated Heading */}
                    <motion.h2
                        style={{
                            fontSize: "clamp(1.6rem, 4vw, 2.8rem)", // ✅ more fluid on small screens
                            color: "#0b2546",
                            fontWeight: 800,
                            marginBottom: "clamp(25px, 5vw, 60px)", // ✅ dynamic margin
                            position: "relative",
                            display: "inline-block",
                            zIndex: 1,
                            letterSpacing: "0.5px",
                            textShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                    >
                        What You Should Do ?
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
                            animate={{ x: ["0%", "150%", "0%"] }}
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
                            maxWidth: "clamp(300px, 90vw, 950px)", // ✅ full width on mobile
                            margin: "0 auto",
                            background: "rgba(255, 255, 255, 0.55)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "20px",
                            padding: "clamp(20px, 6vw, 60px) clamp(16px, 5vw, 50px)", // ✅ flexible padding
                            zIndex: 1,
                            boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                            lineHeight: "1.8",
                            color: "#475569",
                            textAlign: "left",
                            boxSizing: "border-box",
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div
                            style={{
                                fontSize: "clamp(0.9rem, 2vw, 1.25rem)", // ✅ readable at all sizes
                                lineHeight: "clamp(1.5, 2.5vw, 1.8)", // ✅ smooth line height scaling
                                marginBottom: "clamp(20px, 5vw, 35px)",
                            }}
                        >
                            <p style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#007bff" }}>Before choosing any course,</strong>{" "}
                                ask the right questions — to yourself, to AI, or to anyone who’s been in IT.
                            </p>

                            <ul
                                style={{
                                    listStyleType: "disc",
                                    paddingLeft: "clamp(16px, 5vw, 40px)",
                                    marginTop: "10px",
                                    marginBottom: 0,
                                }}
                            >
                                <li style={{ marginBottom: "10px" }}>
                                    Which are the best <strong>programming languages</strong> and{" "}
                                    <strong>frameworks</strong> to learn right now for getting hired?
                                </li>
                                <li style={{ marginBottom: "10px" }}>
                                    How do <strong>Referrals</strong> actually work? If companies pay so much
                                    for referrals, why aren’t people getting them?
                                </li>
                                <li style={{ marginBottom: "10px" }}>
                                    What’s the current <strong>demand for software engineers</strong> in the Indian market?
                                </li>
                                <li style={{ marginBottom: "10px" }}>
                                    Are the <strong>mentors</strong> in your course truly experienced — with at least{" "}
                                    <strong>5+ years</strong> in real product-based roles?
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
                    id="courses"
                    style={{
                        background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                        padding: "clamp(40px, 6vw, 100px) clamp(16px, 5vw, 80px)", // ✅ reduced min padding for mobile
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <motion.h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 3rem)",
                            color: "#0b2546",
                            fontWeight: 800,
                            marginBottom: "clamp(30px, 5vw, 60px)",
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
                                bottom: "-6px",
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
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "clamp(20px, 4vw, 40px)",
                            justifyContent: "center",
                            maxWidth: "1200px",
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
                                }}
                                transition={{ type: "spring", stiffness: 200 }}
                                style={{
                                    background: "rgba(255, 255, 255, 0.75)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.4)",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    textAlign: "left",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
                                }}
                            >
                                <img
                                    src={course.img}
                                    alt={course.title}
                                    style={{
                                        width: "100%",
                                        height: "clamp(160px, 25vw, 230px)",
                                        objectFit: "cover",
                                    }}
                                />
                                <div
                                    style={{
                                        padding: "clamp(14px, 3vw, 22px)",
                                    }}
                                >
                                    <h3
                                        style={{
                                            color: "#0b2546",
                                            fontWeight: 700,
                                            marginBottom: "6px",
                                            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                                            lineHeight: "1.3",
                                        }}
                                    >
                                        {course.title}
                                    </h3>

                                    <div style={{ marginBottom: "8px" }}>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} style={{ color: i < 4 ? "#FFD700" : "#ccc" }}>★</span>
                                        ))}
                                        <span
                                            style={{
                                                color: "#475569",
                                                marginLeft: "6px",
                                                fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                                            }}
                                        >
                                            {course.rating} {course.viewers}
                                        </span>
                                    </div>

                                    <p
                                        style={{
                                            color: "#475569",
                                            marginBottom: "clamp(10px, 2vw, 15px)",
                                            fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                                            lineHeight: "1.5",
                                        }}
                                    >
                                        Master industry-level skills with real-time mentorship and hands-on projects.
                                    </p>

                                    <button
                                        onClick={() => navigate("/login")} // ✅ Redirects to signup
                                        style={{
                                            background: "linear-gradient(90deg, #00c3ff, #007bff)",
                                            color: "#fff",
                                            border: "none",
                                            padding: "clamp(8px, 2vw, 10px) clamp(18px, 3vw, 22px)",
                                            borderRadius: "30px",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
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


                {/* ================= Testimonials ================= */}
                <motion.section
                    style={{
                        background: "linear-gradient(135deg, #f0f7ff 0%, #dcecff 100%)",
                        padding: "clamp(40px, 6vw, 100px) clamp(16px, 5vw, 80px)",
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Heading */}
                    <motion.h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 3rem)",
                            color: "#0b2546",
                            fontWeight: 800,
                            marginBottom: "clamp(30px, 5vw, 60px)",
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

                    {/* Responsive Grid of Cards */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "clamp(40px, 6vw, 100px)", // 🔥 increased horizontal gap
                            rowGap: "clamp(60px, 8vw, 120px)", // 🔥 increased vertical gap
                            justifyItems: "center",
                            alignItems: "start",
                            position: "relative",
                            maxWidth: "1200px",
                            margin: "0 auto",
                            boxSizing: "border-box",
                        }}
                    >
                        {currentSet.map((student, i) => (
                            <div
                                key={i}
                                style={{
                                    perspective: "1000px",
                                    width: "85%", // take only 90% width of the column
                                    maxWidth: "320px", // slightly smaller on desktop
                                    height: "clamp(200px, 35vw, 240px)",
                                    margin: "0 auto",
                                    boxSizing: "border-box",
                                }}
                            >
                                <motion.div
                                    animate={{ rotateY: showFirstSet ? 0 : 180 }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
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
                                            padding: "clamp(18px, 4vw, 25px)",
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
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div>
                                                <h4
                                                    style={{
                                                        color: "#0b2546",
                                                        fontWeight: 700,
                                                        margin: 0,
                                                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                                                    }}
                                                >
                                                    {student.name}
                                                </h4>
                                                <p
                                                    style={{
                                                        color: "#007bff",
                                                        margin: 0,
                                                        fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
                                                    }}
                                                >
                                                    {student.title}
                                                </p>
                                            </div>
                                        </div>
                                        <p
                                            style={{
                                                color: "#475569",
                                                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                                                lineHeight: "1.6",
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
                                                padding: "clamp(18px, 4vw, 25px)",
                                                textAlign: "left",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                                backdropFilter: "blur(10px)",
                                                transform: "rotateY(180deg)",
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
                                                    src={students[i + 6].img}
                                                    alt={students[i + 6].name}
                                                    style={{
                                                        width: "45px",
                                                        height: "45px",
                                                        borderRadius: "50%",
                                                        marginRight: "10px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <div>
                                                    <h4
                                                        style={{
                                                            color: "#0b2546",
                                                            fontWeight: 700,
                                                            margin: 0,
                                                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                                                        }}
                                                    >
                                                        {students[i + 6].name}
                                                    </h4>
                                                    <p
                                                        style={{
                                                            color: "#007bff",
                                                            margin: 0,
                                                            fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
                                                        }}
                                                    >
                                                        {students[i + 6].title}
                                                    </p>
                                                </div>
                                            </div>
                                            <p
                                                style={{
                                                    color: "#475569",
                                                    fontSize: "clamp(0.85rem, 2vw, 1rem)",
                                                    lineHeight: "1.6",
                                                }}
                                            >
                                                “{students[i + 6].text}”
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ================= Contact Section ================= */}
                <motion.section
                    id="contact"
                    style={{
                        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                        padding: "clamp(50px, 6vw, 120px) clamp(20px, 5vw, 80px)",
                        textAlign: "center",
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Title */}
                    <motion.h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 3rem)",
                            color: "#0b2546",
                            fontWeight: 800,
                            marginBottom: "clamp(25px, 5vw, 50px)",
                            position: "relative",
                            display: "inline-block",
                            zIndex: 1,
                            textShadow: "0 3px 6px rgba(0,0,0,0.1)",
                        }}
                    >
                        Contact Us
                        <span
                            style={{
                                position: "absolute",
                                left: 0,
                                bottom: "-6px",
                                width: "100%",
                                height: "3px",
                                background: "linear-gradient(90deg, #00c3ff 0%, #007bff 100%)",
                                borderRadius: "2px",
                            }}
                        ></span>
                    </motion.h2>

                    {/* Contact Container */}
                    <div
                        style={{
                            maxWidth: "800px",
                            margin: "0 auto",
                            background: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "20px",
                            padding: "clamp(20px, 5vw, 40px)",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            textAlign: "center",
                        }}
                    >
                        <motion.p
                            style={{
                                color: "#0b2546",
                                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                                fontWeight: 600,
                                marginBottom: "clamp(15px, 3vw, 25px)",
                                lineHeight: "1.6",
                            }}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            For more details or support, feel free to reach out to us on WhatsApp:
                        </motion.p>

                        {/* WhatsApp Cards */}
                        <motion.div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: "clamp(15px, 3vw, 30px)",
                            }}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {[7411572269, 9633375384].map((num, i) => (
                                <motion.a
                                    key={i}
                                    href={`https://wa.me/${num}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{
                                        scale: 1.05,
                                        y: -5,
                                        boxShadow: "0 10px 20px rgba(0,195,255,0.3)",
                                    }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    style={{
                                        background: "linear-gradient(90deg, #00c3ff, #007bff)",
                                        color: "#fff",
                                        padding: "clamp(10px, 2vw, 14px) clamp(18px, 3vw, 28px)",
                                        borderRadius: "40px",
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        boxShadow: "0 6px 15px rgba(0,195,255,0.3)",
                                    }}
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                        alt="WhatsApp"
                                        style={{ width: "clamp(20px, 3vw, 25px)", height: "auto" }}
                                    />
                                    +91 {num}
                                </motion.a>
                            ))}
                        </motion.div>

                        {/* Footer Text */}
                        <motion.p
                            style={{
                                color: "#475569",
                                marginTop: "clamp(25px, 4vw, 40px)",
                                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                                fontWeight: 500,
                            }}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            We’re available 24/7 to assist you with any queries.
                            <br /> Your success is our priority!
                        </motion.p>
                    </div>
                </motion.section>


                {/* ================= Footer ================= */}
                <footer
                    style={{
                        background: "linear-gradient(135deg, #0b2546 0%, #00172d 100%)",
                        color: "#eaf3ff",
                        padding: "clamp(40px, 6vw, 80px) clamp(16px, 5vw, 40px)", // responsive padding
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
                    <div
                        style={{
                            position: "relative",
                            zIndex: 1,
                            maxWidth: "900px",
                            margin: "0 auto",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* Logo / Title */}
                        <h2
                            style={{
                                fontSize: "clamp(1.5rem, 4vw, 2.5rem)", // responsive font size
                                fontWeight: 700,
                                color: "#fff",
                                marginBottom: "clamp(16px, 3vw, 25px)",
                                letterSpacing: "1px",
                            }}
                        >
                            Learn2Code
                        </h2>

                        {/* Description */}
                        <p
                            style={{
                                color: "#b8c7e0",
                                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                                lineHeight: 1.7,
                                marginBottom: "clamp(20px, 4vw, 40px)",
                                padding: "0 10px", // adds breathing room on small screens
                            }}
                        >
                            Empowering learners to achieve their dreams through high-quality online education and mentorship.
                        </p>

                        {/* Social Links */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexWrap: "wrap", // ✅ ensures wrapping on smaller screens
                                gap: "clamp(12px, 3vw, 24px)",
                                marginBottom: "clamp(25px, 4vw, 50px)",
                            }}
                        >
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
                                        fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
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
                                marginBottom: "clamp(16px, 3vw, 30px)",
                            }}
                        ></div>

                        {/* Bottom Text */}
                        <p
                            style={{
                                fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
                                color: "#b8c7e0",
                                lineHeight: 1.6,
                                padding: "0 10px",
                            }}
                        >
                            © {new Date().getFullYear()} <strong>Learn2Code</strong> — All Rights Reserved
                        </p>
                    </div>
                </footer>


            </div>


            <LogoutToast show={showLogoutToast} />
        </div>
    );
};

export default LandingPage;

