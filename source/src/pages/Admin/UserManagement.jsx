import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchUserProfile } from "../../api/CourseList";
import { fetchAdminUsers, updateAdminUser } from "../../api/AdminUsers";
import "./UserManagement.css";

const editableFields = [
  "name", "email", "phone", "address", "officeCollege", "tag", "role",
  "isActive", "showMentor", "paymentStatus", "accessStartsAt", "accessExpiresAt",
];
const mentorFields = [
  "professionalTitle",
  "state",
  "district",
  "currentCompany",
  "previousCompanies",
  "totalExperience",
  "linkedinUrl",
  "imageUrl",
  "profileStatus",
  "visibility",
  "motherTongue",
  "languagesKnown",
  "technologiesKnown",
];
const roles = ["student", "instructor", "partner", "admin"];
const roleLabels = { student: "Student", instructor: "Instructor", partner: "Partner", admin: "Admin" };
const paymentStatuses = ["pending", "paid", "premium", "failed", "refunded", "expired"];
const userTags = ["CUSTOMER", "COMPANY"];
const profileStatuses = ["Active", "Inactive"];

const getUserId = (user) => user?.id ?? user?._id ?? user?.userId ?? "";
const getUserName = (user) => user?.name ?? user?.userName ?? "";
const getUserRole = (user) => {
  const role = user?.role ?? user?.userRole ?? "";
  if (!role) return "Role not set";
  return roleLabels[role] ?? String(role).replace(/\b\w/g, (char) => char.toUpperCase());
};
const getFieldValue = (user, field) => {
  if (field === "name") return getUserName(user);
  if (field === "showMentor") return user?.showMentor === true;
  return user?.[field] ?? (field === "tag" ? "COMPANY" : "");
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const makeDraft = (user) => ({
  ...Object.fromEntries(editableFields.map((field) => [
    field,
    ["accessStartsAt", "accessExpiresAt"].includes(field)
      ? toDateTimeLocal(getFieldValue(user, field))
      : getFieldValue(user, field),
  ])),
  mentorProfile: Object.fromEntries(mentorFields.map((field) => [
    field,
    user.mentorProfile?.[field] ?? (
      field === "profileStatus" ? "Inactive" : field === "visibility" ? "no" : ""
    ),
  ])),
});

const UserManagement = () => {
  const [userName, setUserName] = useState("User");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
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
    const timer = window.setTimeout(() => {
      setLoading(true);
      setLoadError("");
      setSaveError("");
      fetchAdminUsers(search.trim())
        .then((result) => {
          if (current) setUsers(result);
        })
        .catch((requestError) => {
          if (current) {
            setUsers([]);
            setLoadError(requestError.response?.data?.message || "Unable to load users. Please try again.");
          }
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, search ? 250 : 0);

    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [search, retryCount]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery = !query
        || String(getUserName(user)).toLowerCase().includes(query)
        || String(getUserId(user)).toLowerCase().includes(query)
        || String(getUserRole(user)).toLowerCase().includes(query)
        || String(user?.tag || "COMPANY").toLowerCase().includes(query);

      const matchesRole = roleFilter === "all" || String(user?.role || "").toLowerCase() === roleFilter;
      const matchesTag = tagFilter === "all" || String(user?.tag || "COMPANY").toLowerCase() === tagFilter;

      return matchesQuery && matchesRole && matchesTag;
    });
  }, [users, search, roleFilter, tagFilter]);

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setTagFilter("all");
  };

  const chooseUser = (user) => {
    setSelectedUser(user);
    setDraft(makeDraft(user));
    setSaveError("");
    setNotice("");
  };

  const changeField = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: ["isActive", "showMentor"].includes(name) ? value === "true" : value,
    }));
    setNotice("");
    setSaveError("");
  };

  const changeMentorField = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...current,
      mentorProfile: { ...current.mentorProfile, [name]: value },
    }));
    setNotice("");
    setSaveError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedUser || !draft) return;
    setSaving(true);
    setSaveError("");
    setNotice("");

    const updates = Object.fromEntries(editableFields.map((field) => [
      field,
      ["phone", "address", "officeCollege", "accessStartsAt", "accessExpiresAt"].includes(field) && draft[field] === ""
        ? null
        : ["accessStartsAt", "accessExpiresAt"].includes(field)
          ? toIsoDateTime(draft[field])
          : draft[field],
    ]));
    if (draft.role === "instructor") {
      updates.mentorProfile = Object.fromEntries(mentorFields.map((field) => [
        field,
        field === "totalExperience"
          ? (draft.mentorProfile[field] === "" ? null : Number(draft.mentorProfile[field]))
          : (draft.mentorProfile[field] === "" ? null : draft.mentorProfile[field]),
      ]));
    }
    try {
      const savedUser = await updateAdminUser(getUserId(selectedUser), updates);
      const updated = { ...selectedUser, ...updates };
      if (savedUser && typeof savedUser === "object" && !Array.isArray(savedUser)) {
        for (const field of editableFields) {
          if (Object.prototype.hasOwnProperty.call(savedUser, field)) updated[field] = savedUser[field];
        }
        if (Object.hasOwn(savedUser, "mentorProfile")) updated.mentorProfile = savedUser.mentorProfile;
      }
      setSelectedUser(updated);
      setDraft(makeDraft(updated));
      setUsers((current) => current.map((user) =>
        String(getUserId(user)) === String(getUserId(selectedUser)) ? { ...user, ...updated } : user,
      ));
      setNotice("User details saved.");
    } catch (saveError) {
      setSaveError(saveError.response?.data?.message || "Unable to save user details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const grantOneDayDemo = () => {
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + 24 * 60 * 60 * 1000);
    setDraft((current) => ({
      ...current,
      isActive: true,
      accessStartsAt: toDateTimeLocal(startsAt),
      accessExpiresAt: toDateTimeLocal(expiresAt),
    }));
    setNotice("");
    setSaveError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="user-management-main">
        <section className="user-management-panel" aria-label="User directory">
          <div className="user-management-toolbar">
            <label className="user-management-search">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, ID, role or tag"
                aria-label="Search users by name, ID, role or tag"
              />
            </label>

            <div className="user-management-filter-group">
              <label className="user-management-filter">
                <span>Role</span>
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role">
                  <option value="all">All roles</option>
                  {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                </select>
              </label>

              <label className="user-management-filter">
                <span>Tag</span>
                <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Filter by tag">
                  <option value="all">All tags</option>
                  {userTags.map((tag) => <option key={tag} value={tag.toLowerCase()}>{tag}</option>)}
                </select>
              </label>

              {(search || roleFilter !== "all" || tagFilter !== "all") && (
                <button type="button" className="user-management-clear-filters" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
            <span className="user-management-count" aria-live="polite">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>

          {(loadError || saveError) && (
            <div className="user-management-alert error" role="alert">
              {loadError || saveError}
              {loadError && <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>}
            </div>
          )}

          <div className={`user-management-content ${selectedUser ? "has-selection" : "directory-only"}`}>
            <section className="user-management-list" aria-label="Users">
              {loading ? (
                <p className="user-management-state" role="status">Loading users…</p>
              ) : loadError ? (
                <p className="user-management-state">The user list is unavailable.</p>
              ) : filteredUsers.length === 0 ? (
                <p className="user-management-state">{search ? "No users match your search." : "No users found."}</p>
              ) : (
                filteredUsers.map((user) => {
                  const id = getUserId(user);
                  const selected = selectedUser && String(getUserId(selectedUser)) === String(id);
                  return (
                    <button
                      className={`user-management-user ${selected ? "selected" : ""}`}
                      key={String(id)}
                      type="button"
                      onClick={() => chooseUser(user)}
                    >
                      <span className="user-management-user-heading">
                        <span className="user-management-user-name">{getUserName(user) || "Unnamed user"}</span>
                        <span className="user-management-badges">
                          <span className="user-management-user-role">{getUserRole(user)}</span>
                          <span className="user-management-user-tag">{user.tag || "COMPANY"}</span>
                        </span>
                      </span>
                      <span>{user.email || "No email"}</span>
                      <span className="user-management-user-id">ID: {String(id || "—")}</span>
                    </button>
                  );
                })
              )}
            </section>

            {selectedUser && draft && (
              <section className="user-management-editor" aria-label="Selected user details">
                  <div className="user-management-editor-heading">
                    <div>
                      <span className="user-management-eyebrow">USER ID</span>
                      <h2>{String(getUserId(selectedUser) || "—")}</h2>
                    </div>
                    <span className="user-management-readonly">ID cannot be changed</span>
                  </div>
                  <form onSubmit={handleSave}>
                    <div className="user-management-fields">
                      <label className="user-management-field">
                        <span>Name</span>
                        <input name="name" value={draft.name} onChange={changeField} required />
                      </label>
                      <label className="user-management-field">
                        <span>Email</span>
                        <input name="email" type="email" value={draft.email} onChange={changeField} required />
                      </label>
                      <label className="user-management-field">
                        <span>Phone</span>
                        <input name="phone" type="tel" value={draft.phone} onChange={changeField} />
                      </label>
                      <label className="user-management-field">
                        <span>Address</span>
                        <input name="address" value={draft.address} onChange={changeField} />
                      </label>
                      <label className="user-management-field">
                        <span>Office / College</span>
                        <input name="officeCollege" value={draft.officeCollege} onChange={changeField} />
                      </label>
                      <label className="user-management-field">
                        <span>Tag</span>
                        <select name="tag" value={draft.tag} onChange={changeField} required>
                          {userTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                        </select>
                      </label>
                      <label className="user-management-field">
                        <span>Role</span>
                        <select name="role" value={draft.role} onChange={changeField} required>
                          <option value="">Select role</option>
                          {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                        </select>
                      </label>
                      <label className="user-management-field">
                        <span>Active</span>
                        <select name="isActive" value={String(draft.isActive)} onChange={changeField} required>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </label>
                      <label className="user-management-field">
                        <span>Show Mentor</span>
                        <select name="showMentor" value={String(draft.showMentor)} onChange={changeField} required>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                      <label className="user-management-field">
                        <span>Payment status</span>
                        <select name="paymentStatus" value={String(draft.paymentStatus)} onChange={changeField} required>
                          <option value="" disabled>Select payment status</option>
                          {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </label>
                      <label className="user-management-field">
                        <span>Access starts</span>
                        <input name="accessStartsAt" type="datetime-local" value={draft.accessStartsAt} onChange={changeField} />
                      </label>
                      <label className="user-management-field">
                        <span>Access expires</span>
                        <input name="accessExpiresAt" type="datetime-local" value={draft.accessExpiresAt} onChange={changeField} />
                      </label>
                      <button className="user-management-button secondary" type="button" onClick={grantOneDayDemo}>
                        Grant 1-day demo
                      </button>
                    </div>
                    {draft.role === "instructor" && (
                      <section className="user-management-mentor-fields" aria-label="Mentor profile details">
                        <div>
                          <h3>Mentor Profile</h3>
                          <p>Name is taken from the user account. Mentor profiles start inactive until approved.</p>
                        </div>
                        <div className="user-management-fields">
                          <label className="user-management-field">
                            <span>Professional Title</span>
                            <input name="professionalTitle" value={draft.mentorProfile.professionalTitle} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>State</span>
                            <input name="state" value={draft.mentorProfile.state} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>District</span>
                            <input name="district" value={draft.mentorProfile.district} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>Current Company</span>
                            <input name="currentCompany" value={draft.mentorProfile.currentCompany} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>Previous Companies (comma separated)</span>
                            <textarea name="previousCompanies" value={draft.mentorProfile.previousCompanies} onChange={changeMentorField} rows={2} />
                          </label>
                          <label className="user-management-field">
                            <span>Total Experience (years)</span>
                            <input name="totalExperience" type="number" min="0" max="999.99" step="0.01" value={draft.mentorProfile.totalExperience} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>LinkedIn URL</span>
                            <input name="linkedinUrl" type="url" value={draft.mentorProfile.linkedinUrl} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>Mentor Image URL</span>
                            <input name="imageUrl" type="url" value={draft.mentorProfile.imageUrl} onChange={changeMentorField} placeholder="https://example.com/mentor.jpg" />
                          </label>
                          <label className="user-management-field">
                            <span>Profile Status</span>
                            <select name="profileStatus" value={draft.mentorProfile.profileStatus} onChange={changeMentorField} required>
                              {profileStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </label>
                          <label className="user-management-field">
                            <span>Show on Homepage</span>
                            <select name="visibility" value={draft.mentorProfile.visibility} onChange={changeMentorField} required>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                            <small className="user-management-field-hint">When enabled, this mentor can appear in the mentor section on users’ homepages. The profile must also be Active.</small>
                          </label>
                          <label className="user-management-field">
                            <span>Mother Tongue</span>
                            <input name="motherTongue" value={draft.mentorProfile.motherTongue} onChange={changeMentorField} />
                          </label>
                          <label className="user-management-field">
                            <span>Languages Known (comma separated)</span>
                            <textarea name="languagesKnown" value={draft.mentorProfile.languagesKnown} onChange={changeMentorField} rows={2} />
                          </label>
                          <label className="user-management-field">
                            <span>Technologies / Expertise (comma separated)</span>
                            <textarea name="technologiesKnown" value={draft.mentorProfile.technologiesKnown} onChange={changeMentorField} rows={2} placeholder="React, Node.js, AWS" />
                          </label>
                        </div>
                      </section>
                    )}
                    {notice && <div className="user-management-alert success" role="status">{notice}</div>}
                    <div className="user-management-actions">
                      <button className="user-management-button secondary" type="button" onClick={() => chooseUser(selectedUser)} disabled={saving}>
                        <FaTimes /> Reset
                      </button>
                      <button className="user-management-button primary" type="submit" disabled={saving}>
                        <FaSave /> {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
              </section>
            )}
          </div>
        </section>
    </DashboardLayout>
  );
};

export default UserManagement;
