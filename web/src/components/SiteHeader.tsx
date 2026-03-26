import { NavLink, useLocation } from "react-router-dom";
import { IMG } from "../media";

function navClass(isActive: boolean) {
  return isActive
    ? "border-b-2 border-brand pb-1 text-brand transition-all duration-150 active:scale-95"
    : "rounded px-2 py-1 text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-brand active:scale-95";
}

export function SiteHeader() {
  const { pathname } = useLocation();
  const avatar =
    pathname.startsWith("/learning")
      ? IMG.avatarLearning
      : pathname.startsWith("/components")
        ? IMG.avatarComponents
        : IMG.avatar;

  const projectActive = pathname === "/";
  const learningActive = pathname.startsWith("/learning");
  const componentsActive = pathname.startsWith("/components");
  const assessmentsActive = pathname.startsWith("/assessments");

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/40 shadow-2xl backdrop-blur-[20px]">
      <nav className="font-headline mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between px-8 tracking-tight antialiased">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-xl font-bold tracking-tighter drop-shadow-[0_0_12px_rgba(58,214,255,0.6)] ${
              isActive ? "text-brand" : "text-brand/90 hover:text-brand"
            }`
          }
        >
          AarambhSat
        </NavLink>
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={() => navClass(projectActive)}>
            Project
          </NavLink>
          <NavLink to="/learning" className={() => navClass(learningActive)}>
            Learning
          </NavLink>
          <NavLink to="/components" className={() => navClass(componentsActive)}>
            Components
          </NavLink>
        </div>
        <div className="flex items-center gap-6">
          <NavLink
            to="/assessments"
            className={() =>
              `material-symbols-outlined transition-colors hover:text-brand ${
                assessmentsActive ? "text-brand" : "text-slate-400"
              }`
            }
            aria-label="Assessments"
            title="Assessments"
          >
            school
          </NavLink>
          <button
            type="button"
            className="material-symbols-outlined text-slate-400 transition-colors hover:text-brand"
            aria-label="Settings"
          >
            settings
          </button>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-black/40">
            <img
              src={avatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
