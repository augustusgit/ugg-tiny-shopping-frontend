export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex-1 bg-[radial-gradient(circle_at_15%_10%,#e4efe6_0%,transparent_40%),linear-gradient(180deg,#f6f3ee,#efe8dc)]">
      {children}
    </div>
  );
}
