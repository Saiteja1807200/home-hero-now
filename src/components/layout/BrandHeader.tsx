import logo from "@/assets/logo.png";

export default function BrandHeader() {
  return (
    <div className="flex items-center justify-center gap-2 py-3 safe-top">
      <img src={logo} alt="Home Hero logo" className="h-9 w-9 object-contain" />
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        Home<span className="text-accent"> Hero</span>
      </span>
    </div>
  );
}
