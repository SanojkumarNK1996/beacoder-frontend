import { useEffect, useMemo, useState } from "react";
import { FaBriefcase, FaEdit, FaPlus, FaSearch, FaTrash, FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../../api/CourseList";
import { createRecruiter, deleteRecruiter, fetchRecruiters, updateRecruiter } from "../../api/Recruiters";
import "./Recruiters.css";
import DashboardLayout from "../../components/DashboardLayout";

const statuses = ["Not applied", "Applied", "Interview scheduled", "Selected", "Rejected"];
const PremiumPartnersNotice = () => (
  <div className="recruiters-premium-notice" role="status">
    <strong>A private network for premium members</strong>
    <span>Kyrox Recruitment Partners are available only to premium members. We keep partner details within our trusted community to respect their time and protect the information they share.</span>
  </div>
);
const emptyForm = {
  type: "Company",
  name: "",
  location: "",
  technologies: "",
  hiringRoles: "",
  careerPage: "",
  hrPhone: "",
  hrEmail: "",
  hrLinkedinUrl: "",
  status: "Not applied",
};

const fieldLabels = {
  name: "Company/person name",
  location: "Location",
  technologies: "Technologies",
  hiringRoles: "Hiring roles",
  careerPage: "Company career page",
  hrPhone: "HR/referral phone",
  hrEmail: "HR/referral email",
  hrLinkedinUrl: "HR/referral LinkedIn URL",
};

const RecruitersView = ({ tab, onTabChange }) => {
  const [userName, setUserName] = useState("User");
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requiresPremium, setRequiresPremium] = useState(false);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("userRole") === "admin";
  const isMine = tab === "mine";

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    fetchUserProfile(token).then((profile) => setUserName(profile.userName || "User"))
      .catch((profileError) => console.error("Unable to load user profile", profileError));
  }, []);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    setRequiresPremium(false);
    fetchRecruiters(isMine ? "mine" : "recruitment")
      .then((result) => { if (current) setRecords(result); })
      .catch((requestError) => {
        if (current) {
          setRecords([]);
          if (requestError.response?.status === 403) {
            setRequiresPremium(true);
          } else {
            setError(requestError.response?.data?.message || "Unable to load recruiter records.");
          }
        }
      })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [isMine]);

  const locations = useMemo(() => {
    const uniqueLocations = new Map();
    for (const record of records) {
      const location = record.location?.trim();
      if (location) uniqueLocations.set(location.toLowerCase(), location);
    }
    return [...uniqueLocations.entries()].sort((left, right) => left[1].localeCompare(right[1]));
  }, [records]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records
      .filter((record) => {
        const matchesQuery = !query || [record.name, record.location, record.type, record.technologies, record.hiringRoles]
          .some((value) => String(value || "").toLowerCase().includes(query));
        const matchesType = typeFilter === "all" || record.type === typeFilter;
        const matchesLocation = !locationFilter || record.location?.trim().toLowerCase() === locationFilter;
        const matchesStatus = (!isMine && !isAdmin) || statusFilter === "all" || record.status === statusFilter;
        return matchesQuery && matchesType && matchesLocation && matchesStatus;
      })
      .sort((left, right) => {
        const leftValue = String(left[sortField] || "").toLowerCase();
        const rightValue = String(right[sortField] || "").toLowerCase();
        return leftValue.localeCompare(rightValue, undefined, { numeric: true }) * (sortDirection === "asc" ? 1 : -1);
      });
  }, [records, search, typeFilter, locationFilter, statusFilter, sortField, sortDirection, isMine, isAdmin]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return <FaSort aria-hidden="true" />;
    return sortDirection === "asc" ? <FaSortUp aria-hidden="true" /> : <FaSortDown aria-hidden="true" />;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setForm(Object.fromEntries(Object.keys(emptyForm).map((field) => [field, record[field] ?? emptyForm[field]])));
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const changeField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const values = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null]));
    values.type = form.type;
    values.status = form.status;
    try {
      if (editingId) {
        const saved = await updateRecruiter(editingId, values);
        setRecords((current) => current.map((record) => record.id === editingId ? { ...record, ...saved } : record));
        setMessage("Recruiter details updated.");
      } else {
        const created = await createRecruiter(values);
        if (isMine || isAdmin) setRecords((current) => [created, ...current]);
        setMessage("Recruiter details added.");
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save recruiter details.");
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (record) => {
    if (!window.confirm(`Delete ${record.name}?`)) return;
    try {
      await deleteRecruiter(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      setMessage("Recruiter record deleted.");
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete recruiter record.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="recruiters-content">
        <div className="recruiters-header">
        </div>

        <section className="recruiters-panel">
          <div className="recruiters-tabs" role="tablist" aria-label="Recruiter views">
            <button type="button" role="tab" aria-selected={isMine} className={isMine ? "active" : ""} onClick={() => onTabChange("mine")}>My Recruiter</button>
            <button type="button" role="tab" aria-selected={!isMine} className={!isMine ? "active" : ""} onClick={() => onTabChange("recruitment")}>Kyrox Recruitment Partners</button>
          </div>
          {!requiresPremium && <div className="recruiters-toolbar">
            <label className="recruiters-search">
              <FaSearch aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recruiters..." />
            </label>
            <select className="recruiters-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by type">
              <option value="all">All types</option>
              <option value="Company">Companies</option>
              <option value="Person">People</option>
            </select>
            <select className="recruiters-filter" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} aria-label="Filter by location">
              <option value="">All locations</option>
              {locations.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {(isMine || isAdmin) && (
              <select className="recruiters-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            )}
            {isMine || isAdmin ? (
              <button className="recruiters-primary-button" onClick={openCreate}><FaPlus /> Add recruiter</button>
            ) : null}
          </div>}
          {!loading && !requiresPremium && !error && (
            <div className="recruiters-results-summary" aria-live="polite">
              {visibleRecords.length} {visibleRecords.length === 1 ? "record" : "records"}
            </div>
          )}
          {message && <div className="recruiters-notice">{message}</div>}
          {error && <div className="recruiters-error" role="alert">{error}</div>}
          {requiresPremium && (
            <PremiumPartnersNotice />
          )}

          {showForm && (
            <form className="recruiters-form" onSubmit={saveRecord}>
              <div className="recruiters-form-heading">
                <h2>{editingId ? "Edit recruiter" : "Add recruiter"}</h2>
                <button type="button" className="recruiters-close" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
              <div className="recruiters-form-grid">
                <label>Type<select name="type" value={form.type} onChange={changeField}><option>Company</option><option>Person</option></select></label>
                {Object.keys(fieldLabels).map((field) => (
                  <label key={field}>{fieldLabels[field]}<input name={field} value={form[field]} onChange={changeField} required={field === "name"} type={field === "hrEmail" ? "email" : "text"} /></label>
                ))}
                <label>Status<select name="status" value={form.status} onChange={changeField}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              </div>
              <button className="recruiters-primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save recruiter"}</button>
            </form>
          )}

          {loading ? <div className="recruiters-empty">Loading recruiter records...</div> : requiresPremium || error ? null : visibleRecords.length === 0 ? (
            records.length > 0 ? (
              <div className="recruiters-empty">No recruiter records match your filters.</div>
            ) : isMine ? (
              <div className="recruiters-empty">You have not added any recruiter records yet.</div>
            ) : (
              <div className="recruiters-empty">No Kyrox Recruitment Partners records are available.</div>
            )
          ) : (
            <div className="recruiters-table-wrapper">
              <table className="recruiters-table">
                <thead>
                  <tr>
                    <th><button onClick={() => toggleSort("type")}>Type {sortIcon("type")}</button></th>
                    <th><button onClick={() => toggleSort("name")}>Name {sortIcon("name")}</button></th>
                    <th><button onClick={() => toggleSort("location")}>Location {sortIcon("location")}</button></th>
                    <th>Technologies</th>
                    <th>Hiring roles</th>
                    <th>HR contact</th>
                    <th>Links</th>
                    {(isMine || isAdmin) && <th><button onClick={() => toggleSort("status")}>Status {sortIcon("status")}</button></th>}
                    {(isMine || isAdmin) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
              {visibleRecords.map((record) => (
                <tr key={record.id}>
                  <td><span className="recruiter-type">{record.type}</span></td>
                  <td className="recruiter-name-cell">{record.name}</td>
                  <td>{record.location || "Not provided"}</td>
                  <td>{record.technologies || "Not specified"}</td>
                  <td>{record.hiringRoles || "Not specified"}</td>
                  <td>
                    {record.hrEmail && <div>{record.hrEmail}</div>}
                    {record.hrPhone && <div>{record.hrPhone}</div>}
                    {!record.hrEmail && !record.hrPhone && "Not provided"}
                  </td>
                  <td>
                    {record.careerPage && <a href={record.careerPage} target="_blank" rel="noreferrer">Career page</a>}
                    {record.hrLinkedinUrl && <a href={record.hrLinkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                    {!record.careerPage && !record.hrLinkedinUrl && "None"}
                  </td>
                  {(isMine || isAdmin) && <td><span className={`recruiter-status${record.status ? ` status-${record.status.toLowerCase().replaceAll(" ", "-")}` : ""}`}>{record.status || "Not provided"}</span></td>}
                  {(isMine || isAdmin) && <td><div className="recruiter-card-actions"><button onClick={() => openEdit(record)} aria-label={`Edit ${record.name}`}><FaEdit /></button><button onClick={() => removeRecord(record)} aria-label={`Delete ${record.name}`}><FaTrash /></button></div></td>}
                </tr>
              ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </DashboardLayout>
  );
};

const Recruiters = () => {
  const [tab, setTab] = useState("mine");
  // Remount the view so records and pending mutations stay scoped to their tab.
  return <RecruitersView key={tab} tab={tab} onTabChange={setTab} />;
};

export default Recruiters;
