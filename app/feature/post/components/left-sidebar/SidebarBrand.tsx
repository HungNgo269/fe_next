type SidebarBrandProps = {
  expanded: boolean;
};

export default function SidebarBrand({ expanded }: SidebarBrandProps) {
  return (
    <div className="mb-2 flex items-center gap-3 px-3 py-2">
      <div className="h-7 w-7 shrink-0 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600" />
      <span
        className={`whitespace-nowrap text-xl font-bold tracking-tight transition-opacity duration-200 ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
          Instagram
        </span>
      </span>
    </div>
  );
}
