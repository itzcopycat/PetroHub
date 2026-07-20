// Shared, gender-specific avatars built as inline SVGs — no external image
// host to depend on. Used by both Navbar.jsx and Profile.jsx.

function MaleAvatar({ className = "", ...rest }) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...rest}>
      <circle cx="100" cy="100" r="100" fill="#3B82F6" />
      <circle cx="100" cy="82" r="38" fill="#FDE9DD" />
      <path
        d="M100 130c-40 0-64 24-64 55v15h128v-15c0-31-24-55-64-55z"
        fill="#FDE9DD"
      />
      <path d="M20 200v-15c0-38 32-63 80-63s80 25 80 63v15z" fill="#1D4ED8" />
    </svg>
  );
}

function FemaleAvatar({ className = "", ...rest }) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...rest}>
      <circle cx="100" cy="100" r="100" fill="#EC4899" />
      <path
        d="M60 60c0-25 18-40 40-40s40 15 40 40v20c0 22-18 40-40 40s-40-18-40-40z"
        fill="#5B3A29"
      />
      <circle cx="100" cy="82" r="34" fill="#FDE9DD" />
      <path d="M20 200v-12c0-40 34-66 80-66s80 26 80 66v12z" fill="#BE185D" />
    </svg>
  );
}

function OtherAvatar({ className = "", ...rest }) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...rest}>
      <circle cx="100" cy="100" r="100" fill="#8B5CF6" />
      <circle cx="100" cy="82" r="36" fill="#FDE9DD" />
      <path d="M20 200v-13c0-39 33-65 80-65s80 26 80 65v13z" fill="#6D28D9" />
    </svg>
  );
}

function Avatar({ gender, className = "" }) {
  if (gender === "Male") return <MaleAvatar className={className} />;
  if (gender === "Female") return <FemaleAvatar className={className} />;
  return <OtherAvatar className={className} />;
}

export default Avatar;