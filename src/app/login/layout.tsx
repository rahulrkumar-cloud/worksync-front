export default function LoginFormLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="h-full w-full overflow-hidden">
        {children}
      </div>
    );
  }
  