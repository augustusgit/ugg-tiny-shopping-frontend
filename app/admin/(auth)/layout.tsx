export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex-1 bg-[radial-gradient(circle_at_80%_0%,#e4efe6_0%,transparent_42%),linear-gradient(180deg,#f6f3ee,#e8e0d4)]">
      {children}
    </div>
  );
}
