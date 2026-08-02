export default function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-6 md:px-8 ${className}`}>
      {children}
    </div>
  );
}
