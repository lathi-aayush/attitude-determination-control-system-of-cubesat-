import { NavLink, useLocation } from "react-router-dom";

function itemClass(isActive: boolean) {
  return isActive
    ? "flex touch-manipulation flex-col items-center justify-center rounded-xl bg-white/10 px-4 py-1 text-brand active:opacity-80"
    : "flex touch-manipulation flex-col items-center justify-center text-slate-500 hover:text-brand active:opacity-80";
}

export function MobileNav() {
  const { pathname } = useLocation();
  const learning = pathname.startsWith("/learning");
  const components = pathname.startsWith("/components");

  return (
    <nav className="font-headline fixed bottom-0 left-0 z-50 flex h-20 w-full justify-around rounded-t-[24px] border-t border-white/10 bg-black/40 px-4 pb-safe shadow-2xl backdrop-blur-[20px] md:hidden">
      <NavLink to="/" end className={({ isActive }) => itemClass(isActive)}>
        <span className="material-symbols-outlined">rocket_launch</span>
        <span className="mt-1 text-[10px] uppercase tracking-widest">Project</span>
      </NavLink>
      <NavLink to="/learning" className={() => itemClass(learning)}>
        <span className="material-symbols-outlined">auto_stories</span>
        <span className="mt-1 text-[10px] uppercase tracking-widest">Learning</span>
      </NavLink>
      <NavLink to="/components" className={() => itemClass(components)}>
        <span className="material-symbols-outlined">extension</span>
        <span className="mt-1 text-[10px] uppercase tracking-widest">
          Components
        </span>
      </NavLink>
    </nav>
  );
}
