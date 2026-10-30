
import React, { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Pencil,
  Save,
  Search,
  X,
  Plus,
  Trash2,
  GitBranch,
  ExternalLink,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Folder,
  User,
  Mail,
  CheckCircle2
} from "lucide-react";

import "./ProfilePage.css";

const KEY = "devtask_cv_profile_v3";
const API_BASE = "http://127.0.0.1:8000/api";

const cvKey = (userId) => `${KEY}:${userId}`;

async function accountRequest(path, options = {}) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : `Yêu cầu thất bại (HTTP ${response.status}).`
    );
  }

  return data;
}

const initial = {
  name: "",
  email: "",
  name_tag: "",
  headline: "",
  location: "",
  bio: "",
  avatar: "",
  github: "",
  portfolio: "",
  availability: "available",
  skills: [],
  experiences: [],
  education: [],
  projects: []
};

const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaults = {
  experiences: () => ({
    id: uid(),
    position: "",
    company: "",
    period: "",
    description: ""
  }),

  education: () => ({
    id: uid(),
    school: "",
    major: "",
    period: ""
  }),

  projects: () => ({
    id: uid(),
    name: "",
    role: "",
    technologies: "",
    description: "",
    link: ""
  })
};

function safeUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`
    );

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function readLocal(userId) {
  if (!userId) return { ...initial };

  try {
    const saved = JSON.parse(
      localStorage.getItem(cvKey(userId)) || "{}"
    );

    return { ...initial, ...saved };
  } catch {
    return { ...initial };
  }
}

function Avatar({ person, editable, onFile }) {
  return (
    <div className="cv2-avatar-wrap">
      {person.avatar ? (
        <img
          className="cv2-avatar"
          src={person.avatar}
          alt="Ảnh đại diện"
        />
      ) : (
        <div className="cv2-avatar cv2-avatar-empty">
          {initials(person.name)}
        </div>
      )}

      {editable && (
        <label
          className="cv2-camera"
          title="Đổi ảnh đại diện"
        >
          <Camera size={16} />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={onFile}
          />
        </label>
      )}
    </div>
  );
}

function EntrySection({
  icon: Icon,
  title,
  items,
  type,
  editing,
  add,
  change,
  remove,
  fields
}) {
  return (
    <section className="cv2-panel">
      <div className="cv2-panel-head">
        <h3>
          <Icon size={19} />
          {title}
        </h3>

        {editing && (
          <button
            type="button"
            className="cv2-minibtn"
            onClick={() => add(type)}
          >
            <Plus size={15} />
            Thêm
          </button>
        )}
      </div>

      {!items.length && (
        <p className="cv2-empty">
          Chưa có thông tin {title.toLowerCase()}.
        </p>
      )}

      {items.map((item) => (
        <div className="cv2-entry" key={item.id}>
          {editing ? (
            <>
              <div className="cv2-fields">
                {fields.map((field) => (
                  <label key={field.key}>
                    {field.label}

                    {field.long ? (
                      <textarea
                        rows={3}
                        value={item[field.key] || ""}
                        onChange={(e) =>
                          change(
                            type,
                            item.id,
                            field.key,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <input
                        value={item[field.key] || ""}
                        onChange={(e) =>
                          change(
                            type,
                            item.id,
                            field.key,
                            e.target.value
                          )
                        }
                      />
                    )}
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="cv2-delete"
                onClick={() => remove(type, item.id)}
              >
                <Trash2 size={14} />
                Xóa mục
              </button>
            </>
          ) : (
            <>
              <h4>
                {item.position ||
                  item.name ||
                  item.school ||
                  "Chưa đặt tên"}
              </h4>

              <p className="cv2-entry-sub">
                {[
                  item.company,
                  item.major,
                  item.role,
                  item.period
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {item.technologies && (
                <div className="cv2-tags">
                  {item.technologies
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean)
                    .map((value, index) => (
                      <span key={index}>{value}</span>
                    ))}
                </div>
              )}

              {item.description && <p>{item.description}</p>}

              {safeUrl(item.link) && (
                <a
                  href={safeUrl(item.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem sản phẩm <ExternalLink size={13} />
                </a>
              )}
            </>
          )}
        </div>
      ))}
    </section>
  );
}

export default function ProfilePage({
  currentUser,
  users = [],
  onSearchUsers,
  onSaveProfile
}) {
  const [profile, setProfile] = useState({ ...initial });
  const [account, setAccount] = useState(null);

  const [tagQuery, setTagQuery] = useState("");
  const [searchingTag, setSearchingTag] = useState(false);

  const [loadingAccount, setLoadingAccount] = useState(true);
  const [savedProfile, setSavedProfile] = useState({ ...initial });

  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("mine");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const [skill, setSkill] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // Tải thông tin tài khoản từ Backend.
  useEffect(() => {
    let active = true;

    (async () => {
      setLoadingAccount(true);

      try {
        const me = await accountRequest("/users/me");

        if (!active) return;

        const cv = readLocal(me.id);

        const combined = {
          ...cv,
          name: me.name,
          email: me.email,
          name_tag: me.name_tag || ""
        };

        setAccount(me);
        setProfile(combined);
        setSavedProfile(combined);
      } catch (error) {
        if (active) {
          setNotice(
            `Không tải được thông tin tài khoản: ${error.message}`
          );
        }
      } finally {
        if (active) setLoadingAccount(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Tìm kiếm hồ sơ nhân sự.
  useEffect(() => {
    if (typeof onSearchUsers !== "function") return;

    let active = true;

    const timer = setTimeout(async () => {
      try {
        const data = await onSearchUsers(query.trim());

        if (active) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setNotice("Không tải được danh sách hồ sơ.");
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, onSearchUsers]);

  const people = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("vi");

    const source =
      typeof onSearchUsers === "function" ? results : users;

    return source.filter((person) =>
      [
        person.name,
        person.headline,
        person.title,
        person.location,
        ...(person.skills || [])
      ]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(q)
    );
  }, [users, results, query, onSearchUsers]);

  // Tìm người dùng bằng Name Tag.
  const findByTag = async () => {
    const tag = tagQuery.trim().toUpperCase();

    if (!/^#[A-Z0-9]{4}$/.test(tag)) {
      setNotice(
        "Name Tag phải có dạng #A7K2 (dấu # và 4 ký tự chữ hoặc số)."
      );
      return;
    }

    setSearchingTag(true);
    setSelected(null);

    try {
      const user = await accountRequest(
        `/users/by-tag/${encodeURIComponent(tag.slice(1))}`
      );

      setSelected(user);
      setNotice(`Đã tìm thấy hồ sơ ${user.name}.`);
    } catch (error) {
      setNotice(`Không tìm thấy hồ sơ: ${error.message}`);
    } finally {
      setSearchingTag(false);
    }
  };

  const update = (key, value) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const add = (type) => {
    setProfile((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), defaults[type]()]
    }));
  };

  const change = (type, id, key, value) => {
    setProfile((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id
          ? { ...item, [key]: value }
          : item
      )
    }));
  };

  const remove = (type, id) => {
    setProfile((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== id)
    }));
  };

  const onAvatar = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setNotice(
        "Ảnh phải là JPG, PNG hoặc WebP và nhỏ hơn 2MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => update("avatar", reader.result);
    reader.readAsDataURL(file);
  };

  // Lưu hồ sơ.
  const save = async () => {
    if (!account) {
      setNotice("Chưa tải được tài khoản. Không thể lưu hồ sơ.");
      return;
    }

    if (!profile.name.trim()) {
      setNotice("Vui lòng nhập họ tên.");
      return;
    }

    setBusy(true);

    try {
      let updatedAccount = account;

      if (profile.name.trim() !== account.name) {
        updatedAccount = await accountRequest("/users/me", {
          method: "PUT",
          body: JSON.stringify({
            name: profile.name.trim()
          })
        });
      }

      const next = {
        ...profile,
        name: updatedAccount.name,
        email: updatedAccount.email,
        name_tag: updatedAccount.name_tag || profile.name_tag
      };

      const {
        name,
        email,
        name_tag,
        ...cvOnly
      } = next;

      if (onSaveProfile) {
        await onSaveProfile(next);
      } else {
        localStorage.setItem(
          cvKey(account.id),
          JSON.stringify(cvOnly)
        );
      }

      setAccount(updatedAccount);
      setProfile(next);
      setSavedProfile(next);
      setEditing(false);

      setNotice(
        onSaveProfile
          ? "Đã cập nhật tài khoản và gửi dữ liệu CV đến hàm lưu."
          : "Đã cập nhật họ tên trên hệ thống. Thông tin CV bổ sung được lưu riêng trên trình duyệt này."
      );
    } catch (error) {
      setNotice(`Lưu hồ sơ thất bại: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const viewing = tab === "mine" ? profile : selected;
  const isEditing = tab === "mine" && editing;

  const field = (label, key, placeholder = "", long = false) => (
    <label className="cv2-field">
      {label}

      {long ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={profile[key] || ""}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <input
          placeholder={placeholder}
          value={profile[key] || ""}
          onChange={(e) => update(key, e.target.value)}
        />
      )}
    </label>
  );

  const expFields = [
    { key: "position", label: "Vị trí" },
    { key: "company", label: "Công ty / tổ chức" },
    { key: "period", label: "Thời gian" },
    {
      key: "description",
      label: "Mô tả công việc",
      long: true
    }
  ];

  const eduFields = [
    { key: "school", label: "Trường / cơ sở đào tạo" },
    { key: "major", label: "Chuyên ngành" },
    { key: "period", label: "Thời gian" }
  ];

  const projectFields = [
    { key: "name", label: "Tên dự án" },
    { key: "role", label: "Vai trò" },
    {
      key: "technologies",
      label: "Công nghệ (phân tách dấu phẩy)"
    },
    { key: "link", label: "Link GitHub / demo" },
    {
      key: "description",
      label: "Mô tả và đóng góp",
      long: true
    }
  ];

  const addSkill = () => {
    const value = skill.trim();

    if (
      value &&
      !profile.skills.some(
        (item) => item.toLowerCase() === value.toLowerCase()
      )
    ) {
      update("skills", [...profile.skills, value]);
    }

    setSkill("");
  };

  // Sao chép Name Tag.
  const copyNameTag = async (tag) => {
    if (!tag) return;

    try {
      await navigator.clipboard.writeText(tag);
      setNotice("Đã sao chép Name Tag.");
    } catch {
      setNotice("Không thể sao chép tự động.");
    }
  };

  return (
    <main className="cv2-page">
      <header className="cv2-top">
        <div>
          <p className="cv2-eyebrow">
            DEVTASK / DEVELOPER PORTFOLIO
          </p>

          <h1>Hồ sơ năng lực</h1>

          <p>
            CV chuyên môn giúp kết nối đúng người với đúng dự án.
          </p>
        </div>

        {tab === "mine" && (
          <div className="cv2-top-actions">
            {editing ? (
              <>
                <button
                  className="cv2-btn ghost"
                  onClick={() => {
                    setProfile(savedProfile);
                    setEditing(false);
                  }}
                >
                  Hủy
                </button>

                <button
                  className="cv2-btn primary"
                  onClick={save}
                  disabled={busy}
                >
                  <Save size={16} />
                  {busy ? "Đang lưu..." : "Lưu hồ sơ"}
                </button>
              </>
            ) : (
              <button
                className="cv2-btn primary"
                onClick={() => setEditing(true)}
                disabled={!account || loadingAccount}
              >
                <Pencil size={16} />
                Chỉnh sửa
              </button>
            )}
          </div>
        )}
      </header>

      <nav className="cv2-tabs">
        <button
          className={tab === "mine" ? "active" : ""}
          onClick={() => setTab("mine")}
        >
          <User size={17} />
          Hồ sơ của tôi
        </button>

        <button
          className={tab === "search" ? "active" : ""}
          onClick={() => setTab("search")}
        >
          <Search size={17} />
          Tìm kiếm nhân sự
        </button>
      </nav>

      {loadingAccount && (
        <div className="cv2-notice" role="status">
          Đang tải họ tên và email từ tài khoản đã đăng ký...
        </div>
      )}

      {notice && (
        <div className="cv2-notice" role="status">
          {notice}

          <button
            onClick={() => setNotice("")}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {tab === "search" && (
        <section className="cv2-search">
          <h3>Tìm chính xác bằng Name Tag</h3>

          <p className="cv2-empty">
            Nhập mã định danh của người dùng, ví dụ #A7K2.
          </p>

          <div className="cv2-skilladd">
            <input
              aria-label="Mã Name Tag"
              value={tagQuery}
              maxLength={5}
              onChange={(e) =>
                setTagQuery(e.target.value.toUpperCase())
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") findByTag();
              }}
              placeholder="#A7K2"
            />

            <button
              type="button"
              className="cv2-btn primary"
              disabled={searchingTag}
              onClick={findByTag}
            >
              <Search size={16} />
              {searchingTag ? "Đang tìm..." : "Tìm theo mã"}
            </button>
          </div>
        </section>
      )}

      {tab === "search" && (
        <section className="cv2-search">
          <h3>Khám phá hồ sơ nhân sự</h3>

          <div className="cv2-searchbar">
            <Search size={18} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, kỹ năng, vị trí chuyên môn..."
            />
          </div>

          <div className="cv2-people">
            {people.map((person, index) => (
              <button
                key={person.id || index}
                className={`cv2-person ${
                  selected === person ? "active" : ""
                }`}
                onClick={() => setSelected(person)}
              >
                <div className="cv2-smallavatar">
                  {person.avatar ? (
                    <img src={person.avatar} alt="" />
                  ) : (
                    initials(person.name)
                  )}
                </div>

                <div>
                  <strong>
                    {person.name || "Chưa có tên"}
                  </strong>

                  <small>
                    {person.headline ||
                      person.title ||
                      "Chưa cập nhật chuyên môn"}
                  </small>
                </div>

                <ExternalLink size={15} />
              </button>
            ))}
          </div>

          {!people.length && (
            <p className="cv2-empty">
              Chưa có hồ sơ phù hợp. Cần kết nối danh sách người
              dùng từ Backend để tìm kiếm toàn hệ thống.
            </p>
          )}
        </section>
      )}

      {!viewing ? (
        <section className="cv2-placeholder">
          <User size={32} />
          <h3>Chọn một hồ sơ để xem CV</h3>
          <p>Thông tin được hiển thị ở chế độ chỉ đọc.</p>
        </section>
      ) : (
        <div className="cv2-layout">
          <div className="cv2-main">
            {/* HỒ SƠ CHÍNH */}
            <section className="cv2-hero">
              <div className="cv2-cover">
                <span>OPEN TO COLLABORATE</span>
              </div>

              <div className="cv2-hero-content">
                <div className="cv2-identity">
                  <Avatar
                    person={viewing}
                    editable={isEditing}
                    onFile={onAvatar}
                  />

                  {/* TÊN + NAME TAG */}
                  <div className="cv2-identity-info">
                    <h2>
                      {viewing.name || "Họ và tên của bạn"}
                    </h2>

                    <div className="cv2-name-tag-inline">
                      <span className="cv2-name-tag-label">
                        Name Tag
                      </span>

                      <span className="cv2-nametag">
                        {viewing.name_tag || "Chưa cấp mã"}
                      </span>

                      {tab === "mine" && viewing.name_tag && (
                        <button
                          type="button"
                          className="cv2-copy-tag"
                          onClick={() =>
                            copyNameTag(viewing.name_tag)
                          }
                        >
                          Sao chép
                        </button>
                      )}
                    </div>

                    <p>
                      {viewing.headline ||
                        viewing.title ||
                        "Chưa cập nhật vị trí chuyên môn"}
                    </p>

                    <span>
                      <MapPin size={14} />
                      {viewing.location ||
                        "Chưa cập nhật địa điểm"}
                    </span>
                  </div>
                </div>

                <p className="cv2-about">
                  {viewing.bio ||
                    "Giới thiệu ngắn gọn về bản thân, thế mạnh chuyên môn và mục tiêu nghề nghiệp."}
                </p>

                <span
                  className={`cv2-status ${
                    viewing.availability === "busy" ? "busy" : ""
                  }`}
                >
                  {viewing.availability === "busy"
                    ? "Đang bận dự án"
                    : "Sẵn sàng tham gia dự án"}
                </span>
              </div>
            </section>

            {/* CHỈNH SỬA THÔNG TIN CƠ BẢN */}
            {isEditing && (
              <section className="cv2-panel">
                <div className="cv2-panel-head">
                  <h3>
                    <Pencil size={19} />
                    Thông tin cơ bản
                  </h3>
                </div>

                <div className="cv2-fields">
                  {field(
                    "Họ và tên",
                    "name",
                    "Nguyễn Văn A"
                  )}

                  {field(
                    "Chức danh chuyên môn",
                    "headline",
                    "Full-stack Developer"
                  )}

                  {field(
                    "Khu vực",
                    "location",
                    "TP. Hồ Chí Minh"
                  )}

                  {field(
                    "Giới thiệu bản thân",
                    "bio",
                    "Tóm tắt kinh nghiệm, định hướng và thế mạnh...",
                    true
                  )}

                  <label className="cv2-field">
                    Trạng thái tham gia

                    <select
                      value={profile.availability}
                      onChange={(e) =>
                        update("availability", e.target.value)
                      }
                    >
                      <option value="available">
                        Sẵn sàng tham gia dự án
                      </option>

                      <option value="busy">
                        Đang bận dự án
                      </option>
                    </select>
                  </label>
                </div>
              </section>
            )}

            {/* KỸ NĂNG */}
            <section className="cv2-panel">
              <div className="cv2-panel-head">
                <h3>
                  <Code size={19} />
                  Kỹ năng & công nghệ
                </h3>
              </div>

              {isEditing && (
                <div className="cv2-skilladd">
                  <input
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="React, FastAPI, PostgreSQL..."
                  />

                  <button
                    className="cv2-minibtn"
                    onClick={addSkill}
                  >
                    <Plus size={15} />
                    Thêm
                  </button>
                </div>
              )}

              <div className="cv2-tags">
                {(viewing.skills || []).map((item, index) => (
                  <span key={index}>
                    {item}

                    {isEditing && (
                      <button
                        aria-label={`Xóa ${item}`}
                        onClick={() =>
                          update(
                            "skills",
                            profile.skills.filter(
                              (_, itemIndex) =>
                                itemIndex !== index
                            )
                          )
                        }
                      >
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {!viewing.skills?.length && (
                <p className="cv2-empty">
                  Chưa cập nhật kỹ năng.
                </p>
              )}
            </section>

            {/* KINH NGHIỆM */}
            <EntrySection
              icon={Briefcase}
              title="Kinh nghiệm làm việc"
              items={viewing.experiences || []}
              type="experiences"
              editing={isEditing}
              add={add}
              change={change}
              remove={remove}
              fields={expFields}
            />

            {/* DỰ ÁN */}
            <EntrySection
              icon={Folder}
              title="Dự án tiêu biểu"
              items={viewing.projects || []}
              type="projects"
              editing={isEditing}
              add={add}
              change={change}
              remove={remove}
              fields={projectFields}
            />

            {/* HỌC VẤN */}
            <EntrySection
              icon={GraduationCap}
              title="Học vấn"
              items={viewing.education || []}
              type="education"
              editing={isEditing}
              add={add}
              change={change}
              remove={remove}
              fields={eduFields}
            />
          </div>

          {/* CỘT THÔNG TIN BÊN PHẢI */}
          <aside className="cv2-aside">
            {/* ĐÃ BỎ THẺ NAME TAG RIÊNG Ở ĐÂY */}

            <section className="cv2-panel">
              <div className="cv2-panel-head">
                <h3>
                  <User size={19} />
                  Thông tin hồ sơ
                </h3>
              </div>

              <div className="cv2-facts">
                <div>
                  <span>Chuyên môn</span>
                  <strong>
                    {viewing.headline ||
                      viewing.title ||
                      "Chưa cập nhật"}
                  </strong>
                </div>

                <div>
                  <span>Khu vực</span>
                  <strong>
                    {viewing.location || "Chưa cập nhật"}
                  </strong>
                </div>

                <div>
                  <span>Dự án tiêu biểu</span>
                  <strong>
                    {viewing.projects?.length || 0}
                  </strong>
                </div>

                <div>
                  <span>Kỹ năng</span>
                  <strong>
                    {viewing.skills?.length || 0}
                  </strong>
                </div>
              </div>
            </section>

            {/* LIÊN KẾT CHUYÊN MÔN */}
            <section className="cv2-panel">
              <div className="cv2-panel-head">
                <h3>
                  <GitBranch size={19} />
                  Liên kết chuyên môn
                </h3>
              </div>

              {isEditing && (
                <div className="cv2-fields">
                  {field(
                    "GitHub",
                    "github",
                    "https://github.com/username"
                  )}

                  {field(
                    "Portfolio",
                    "portfolio",
                    "https://example.com"
                  )}
                </div>
              )}

              {safeUrl(viewing.github) && (
                <a
                  className="cv2-link"
                  href={safeUrl(viewing.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitBranch size={17} />
                  GitHub
                  <ExternalLink size={14} />
                </a>
              )}

              {safeUrl(viewing.portfolio) && (
                <a
                  className="cv2-link"
                  href={safeUrl(viewing.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={17} />
                  Portfolio
                  <ExternalLink size={14} />
                </a>
              )}

              {!viewing.github &&
                !viewing.portfolio &&
                !isEditing && (
                  <p className="cv2-empty">
                    Chưa thêm liên kết.
                  </p>
                )}
            </section>

            {/* THÔNG TIN TÀI KHOẢN */}
            {tab === "mine" && (
              <section className="cv2-panel">
                <div className="cv2-panel-head">
                  <h3>
                    <Mail size={19} />
                    Tài khoản
                  </h3>
                </div>

                <p className="cv2-private">
                  Email đăng nhập (chỉ bạn nhìn thấy)
                </p>

                <strong className="cv2-email">
                  {profile.email || "Chưa có email"}
                </strong>

                <p className="cv2-private">
                  <CheckCircle2 size={14} />
                  Quyền Owner/Leader/Member được quản lý theo
                  từng dự án, không chỉnh sửa tại CV.
                </p>
              </section>
            )}

            <section className="cv2-tip">
              <strong>CV chuyên nghiệp</strong>

              <p>
                Thêm kỹ năng thực tế, dự án có đường dẫn minh
                chứng và mô tả đóng góp của bạn để chủ dự án
                dễ đánh giá mức độ phù hợp.
              </p>
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
