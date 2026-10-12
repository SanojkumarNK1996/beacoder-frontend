import "./PageHeader.css";
import {
  FaBookOpen,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaClipboardList,
  FaCode,
  FaComments,
  FaFileAlt,
  FaLaptopCode,
  FaLightbulb,
  FaPen,
  FaQuestionCircle,
  FaTasks,
  FaUserCheck,
  FaUserFriends,
} from "react-icons/fa";

const illustrationFor = (title) => {
  const page = title.toLowerCase();
  if (page.includes("questionnaire")) return { type: "assessment", Primary: FaClipboardCheck, Secondary: FaLightbulb };
  if (page.includes("quiz")) return { type: "quiz", Primary: FaQuestionCircle, Secondary: FaCheckCircle };
  if (page.includes("progress") || page.includes("dashboard")) return { type: "progress", Primary: FaChartLine, Secondary: FaCheckCircle };
  if (page.includes("discussion")) return { type: "discussion", Primary: FaComments, Secondary: FaUserFriends };
  if (page.includes("mentor") || page.includes("instructor")) return { type: "people", Primary: FaChalkboardTeacher, Secondary: FaUserCheck };
  if (page.includes("recruit") || page.includes("partner") || page.includes("job")) return { type: "career", Primary: FaBriefcase, Secondary: FaChartLine };
  if (page.includes("editor") || page.includes("content")) return { type: "editor", Primary: FaPen, Secondary: FaFileAlt };
  if (page.includes("programming") || page.includes("code") || page.includes("engineering")) return { type: "code", Primary: FaLaptopCode, Secondary: FaCode };
  if (page.includes("assignment") || page.includes("task")) return { type: "tasks", Primary: FaTasks, Secondary: FaCheckCircle };
  if (page.includes("user") || page.includes("account") || page.includes("log in") || page.includes("sign")) return { type: "people", Primary: FaUserFriends, Secondary: FaUserCheck };
  if (page.includes("test")) return { type: "assessment", Primary: FaFileAlt, Secondary: FaCheckCircle };
  return { type: "learning", Primary: FaBookOpen, Secondary: FaLightbulb };
};

export default function PageHeader({ title, description, className = "", titleId, iconImage, iconAlt }) {
  const { type, Primary, Secondary } = illustrationFor(title);

  return (
    <header className={`page-header ${className}`.trim()}>
      <div className={`page-header__icon${iconImage ? " page-header__icon--image" : ""}`} aria-hidden={iconImage ? undefined : "true"}>
        {iconImage ? <img src={iconImage} alt={iconAlt || `${title} icon`} /> : <FaClipboardList />}
      </div>
      <div className="page-header__content">
        <h1 id={titleId}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className={`page-header__illustration page-header__illustration--${type}`} aria-hidden="true">
        <span className="page-header__spark page-header__spark--one">✦</span>
        <span className="page-header__spark page-header__spark--two">✦</span>
        <Primary className="page-header__art-primary" />
        <Secondary className="page-header__art-secondary" />
      </div>
    </header>
  );
}
