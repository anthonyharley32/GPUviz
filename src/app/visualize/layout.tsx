import { Nav } from "@/components/layout/nav";

export default function VisualizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Nav />
      <div className="pt-16">{children}</div>
    </div>
  );
} 