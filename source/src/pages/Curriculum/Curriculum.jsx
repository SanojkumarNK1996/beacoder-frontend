import { useEffect, useMemo, useRef, useState } from "react";
import { FaBookOpen, FaChevronDown, FaChevronRight, FaCode, FaCloud, FaDatabase, FaGraduationCap, FaLaptopCode, FaSearch, FaShieldAlt, FaTimes } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchCurriculum, fetchCurriculumRoadmap } from "../../api/Curriculum";
import { getCourseImageUrl } from "../../utils/courseImage";
import "./Curriculum.css";

const domainIcons = [FaLaptopCode, FaCode, FaShieldAlt, FaCloud, FaDatabase, FaBookOpen, FaGraduationCap, FaBookOpen];

const Curriculum = () => {
  const [curriculum, setCurriculum] = useState({ careerDomains: [], totals: {} });
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const explorerRef = useRef(null);

  useEffect(() => {
    Promise.all([fetchCurriculum(), fetchCurriculumRoadmap()])
      .then(([data]) => {
        const domains = data.careerDomains || [];
        setCurriculum(data);
        setSelectedDomain(domains[0] || null);
        setSelectedProgram(domains[0]?.programs?.[0] || null);
      })
      .catch((error) => console.error("Unable to load curriculum", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredDomains = useMemo(() => {
    const query = search.toLowerCase();
    return curriculum.careerDomains.filter((domain) => domain.name.toLowerCase().includes(query) || domain.programs.some((program) => program.name.toLowerCase().includes(query)));
  }, [curriculum.careerDomains, search]);
  const visiblePrograms = selectedDomain?.programs || [];
  const roadmapCourses = useMemo(() => {
    const query = search.toLowerCase();
    return (selectedProgram?.courses || []).filter((course) => course.courseName.toLowerCase().includes(query) || course.topics.some((topic) => topic.title.toLowerCase().includes(query) || topic.subtopics.some((subtopic) => subtopic.title.toLowerCase().includes(query))));
  }, [selectedProgram, search]);

  const chooseDomain = (domain) => {
    setSelectedDomain(domain);
    setSelectedProgram(domain.programs?.[0] || null);
    setSelected(null);
    setExpanded({});
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const chooseProgram = (program) => {
    setSelectedProgram((current) => current?.name === program.name ? null : program);
    setSelected(null);
    setExpanded({});
  };
  const toggle = (key) => setExpanded((current) => ({ ...current, [key]: !current[key] }));
  const choose = (item, type, parent) => {
    setSelected({ ...item, type, parent });
  };

  if (loading) return <DashboardLayout contentClassName="curriculum-scroll"><div className="dashboard-layout__loading" role="status">Loading curriculum…</div></DashboardLayout>;

  return (
    <DashboardLayout contentClassName="curriculum-scroll">
          <div className="curriculum-search"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your curriculum" aria-label="Search curriculum" />{search && <button onClick={() => setSearch("")} aria-label="Clear search"><FaTimes /></button>}</div>
          <section className="curriculum-stats">{[["Career Domains", curriculum.totals.careerDomains], ["Programs", curriculum.totals.programs], ["Courses", curriculum.totals.courses], ["Topics", curriculum.totals.topics]].map(([label, value]) => <div className="curriculum-stat" key={label}><strong>{value || 0}</strong><span>{label}</span></div>)}</section>
          <section><div className="section-heading"><div><span className="curriculum-eyebrow">LEARN YOUR WAY</span><h2>Career Domains</h2></div><span className="muted-copy">{filteredDomains.length} domains to explore</span></div><div className="stream-grid">{filteredDomains.map((domain, index) => { const Icon = domainIcons[index % domainIcons.length]; return <button className={`stream-card ${selectedDomain?.name === domain.name ? "selected" : ""}`} onClick={() => chooseDomain(domain)} key={domain.name}><div className="stream-icon"><Icon /></div><div><h3>{domain.name}</h3><p>{domain.programs.length} job-ready programs</p></div><span className="stream-arrow">{selectedDomain?.name === domain.name ? "✓" : "→"}</span></button>; })}</div></section>
          <section className="explorer-section" ref={explorerRef}><div className="section-heading"><div><span className="curriculum-eyebrow">EXPLORE CAREER PATHS</span><h2>{selectedDomain?.name || "Select a career domain"}</h2></div><span className="muted-copy">Select a job-ready program</span></div><div className="explorer-grid">
            <div className="tree-card"><div className="tree-title"><FaBookOpen /> Curriculum tree</div>{visiblePrograms.map((program) => <div className="tree-course" key={program.name}><button className={`tree-row program-row ${selectedProgram?.name === program.name ? "active" : ""}`} onClick={() => chooseProgram(program)}><span>{selectedProgram?.name === program.name ? <FaChevronDown /> : <FaChevronRight />}</span><FaGraduationCap /><b style={{ color: "#17213b", fontSize: "15px", fontWeight: 800 }}>{program.name}</b></button>{selectedProgram?.name === program.name && roadmapCourses.map((course) => <div className="tree-children" key={course.id}><button className={`tree-row ${selected?.id === course.id ? "active" : ""}`} onClick={() => { toggle(`course-${course.id}`); choose(course, "Course", program); }}><span>{expanded[`course-${course.id}`] ? <FaChevronDown /> : <FaChevronRight />}</span><b>{course.courseName}</b></button>{expanded[`course-${course.id}`] && course.topics.map((topic) => <div className="tree-children" key={topic.id}><button className={`tree-row ${selected?.id === topic.id ? "active" : ""}`} onClick={() => { toggle(`topic-${topic.id}`); choose(topic, "Topic", course); }}><span>{expanded[`topic-${topic.id}`] ? <FaChevronDown /> : <FaChevronRight />}</span><FaCode /><span>{topic.title}</span></button>{expanded[`topic-${topic.id}`] && topic.subtopics.map((subtopic) => <button className="tree-row subtopic" onClick={() => choose(subtopic, "Subtopic", course)} key={subtopic.id}><span>•</span><span>{subtopic.title}</span></button>)}</div>)}</div>)}</div>)}</div>
            <div className="roadmap-card"><div className="tree-title"><FaGraduationCap /> Roadmap for {selectedProgram?.name || "Selected Program"}</div>{roadmapCourses.map((course, index) => <div className="roadmap-step" key={course.id}><div className={`roadmap-dot ${index === 0 ? "current" : "upcoming"}`}>{index === 0 ? "●" : index + 1}</div><img className="roadmap-thumb" src={getCourseImageUrl(course.imageUrl, course.courseName)} alt="" /><div><strong>{course.courseName}</strong></div>{index < roadmapCourses.length - 1 && <div className="roadmap-line" />}</div>)}</div>
          </div></section>
    </DashboardLayout>
  );
};

export default Curriculum;