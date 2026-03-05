import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/services")}
      className="mx-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99] touch-target"
    >
      <Search size={20} className="text-muted-foreground" />
      <span className="text-sm text-muted-foreground">What service do you need?</span>
    </button>
  );
}
