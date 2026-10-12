import { useEffect, useState } from "react";
import { FaBriefcase, FaBuilding, FaCode, FaLanguage, FaLinkedin, FaMapMarkerAlt, FaRedo, FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchUserProfile } from "../../api/CourseList";
import { fetchMentors } from "../../api/Mentors";
import "./Mentors.css";

const splitList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const formatExperience = (value) => {
  if (value === null || value === undefined || value === "") return "Not specified";
  const years = Number(value);
  return `${Number.isFinite(years) ? Number(years.toFixed(2)) : value} years`;
};

const Mentors = () => {
  const [userName, setUserName] = useState("User");
  const [mentors, setMentors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetchUserProfile(token)
      .then((profile) => setUserName(profile.userName || "User"))
      .catch((profileError) => console.error("Unable to load user profile", profileError));
  }, []);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    fetchMentors()
      .then((data) => {
        if (current) setMentors(data);
      })
      .catch((fetchError) => {
        if (current) {
          setError(fetchError.response?.data?.message || "Unable to load mentors. Please try again.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [retryCount]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const filteredMentors = mentors.filter((mentor) => {
    const profile = mentor.mentorProfile || mentor;
    const searchableText = [
      mentor.user?.name,
      mentor.name,
      profile.professionalTitle,
      profile.currentCompany,
      profile.previousCompanies,
      profile.district,
      profile.state,
      profile.location,
      profile.technologiesKnown,
      profile.expertise,
      profile.technologies,
      profile.languagesKnown,
      profile.motherTongue,
    ].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(appliedSearch.trim().toLowerCase());
  });

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(searchText);
  };

  const clearSearch = () => {
    setSearchText("");
    setAppliedSearch("");
  };

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="mentors-main">
        {loading ? (
          <p className="mentors-message">Loading mentors...</p>
        ) : error ? (
          <div className="mentors-message error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
              <FaRedo /> Retry
            </button>
          </div>
        ) : (
          <>
            <form className="mentors-search" onSubmit={handleSearch} role="search">
              <label className="mentors-search-field">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search mentors"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search by name, expertise, company, or location"
                />
              </label>
              {searchText && (
                <button className="mentors-search-clear" type="button" onClick={clearSearch} aria-label="Clear mentor search">
                  <FaTimes />
                </button>
              )}
              <button className="mentors-search-submit" type="submit"><FaSearch /> Search</button>
            </form>
            {filteredMentors.length ? (
              <div className="mentors-grid">
                {filteredMentors.map((mentor) => {
              const profile = mentor.mentorProfile || mentor;
              const name = mentor.user?.name || mentor.name || "Mentor";
              const location = [profile.district, profile.state].filter(Boolean).join(", ") || profile.location;
              const technologies = splitList(profile.technologiesKnown || profile.expertise || profile.technologies);
              const languages = splitList(profile.languagesKnown);
              const previousCompanies = splitList(profile.previousCompanies);
              const linkedinUrl = profile.linkedinUrl || profile.linkedInUrl;
              return (
                <article className="mentor-card" key={mentor.user?.id || mentor.id || name}>
                  <div className="mentor-card-heading">
                    <img className="mentor-avatar" src={profile.imageUrl || "/images/mentor-placeholder.svg"} alt={`${name} profile`} onError={(event) => { event.currentTarget.src = "/images/mentor-placeholder.svg"; }} />
                    <div className="mentor-identity"><h2>{name}</h2><p>{profile.professionalTitle || "Learning mentor"}</p></div>
                    <span className="mentor-status">Active mentor</span>
                  </div>
                  {profile.currentCompany && (
                    <div className="mentor-company"><FaBuilding /><span>Currently at <strong>{profile.currentCompany}</strong></span></div>
                  )}
                  <div className="mentor-highlights">
                    <div className="mentor-highlight"><span className="mentor-highlight-icon"><FaBriefcase /></span><span><small>Experience</small><strong>{formatExperience(profile.totalExperience)}</strong></span></div>
                    <div className="mentor-highlight"><span className="mentor-highlight-icon"><FaMapMarkerAlt /></span><span><small>Location</small><strong>{location || "Not specified"}</strong></span></div>
                  </div>
                  {technologies.length > 0 && (
                    <section className="mentor-expertise" aria-label={`${name} areas of expertise`}>
                      <h3><FaCode /> Technologies &amp; expertise</h3>
                      <div className="mentor-tags">{technologies.map((technology) => <span className="mentor-tag" key={technology}>{technology}</span>)}</div>
                    </section>
                  )}
                  {(languages.length > 0 || profile.motherTongue || previousCompanies.length > 0) && (
                    <div className="mentor-more-details">
                      {languages.length > 0 && <div><FaLanguage /><span><strong>Languages</strong>{languages.join(", ")}</span></div>}
                      {profile.motherTongue && <div><FaLanguage /><span><strong>Mother tongue</strong>{profile.motherTongue}</span></div>}
                      {previousCompanies.length > 0 && <div><FaBuilding /><span><strong>Previously at</strong>{previousCompanies.join(", ")}</span></div>}
                    </div>
                  )}
                  {linkedinUrl ? (
                    <a className="mentor-linkedin" href={linkedinUrl} target="_blank" rel="noreferrer"><FaLinkedin /> View LinkedIn profile</a>
                  ) : (
                    <span className="mentor-linkedin mentor-linkedin--private"><FaLinkedin aria-hidden="true" /> Profile hidden for privacy</span>
                  )}
                </article>
              );
            })}
              </div>
            ) : (
              <div className="mentors-empty" role="status">
                <span className="mentors-empty-icon"><FaSearch /></span>
                <h2>{mentors.length ? "No matching mentors" : "No mentors are available right now"}</h2>
                <p>{mentors.length ? "Try another name, skill, company, or location." : "Please check back later for mentor profiles."}</p>
                {mentors.length > 0 && appliedSearch && (
                  <button type="button" onClick={clearSearch}>Clear search</button>
                )}
              </div>
            )}
          </>
        )}
    </DashboardLayout>
  );
};

export default Mentors;
