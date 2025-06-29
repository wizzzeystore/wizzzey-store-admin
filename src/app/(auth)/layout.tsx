
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background">
      {children}
    </main>
  );
}
