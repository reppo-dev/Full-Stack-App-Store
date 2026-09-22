import CardBox from "@/features/tickets/components/CardBox";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full">
      <div className="mx-4 sm:mx-6 lg:mx-8">
        <div className="py-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Support Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer support inquiries, track ticket progress, and respond to issues.
          </p>
        </div>
        <div className="flex gap-6 items-start">
          <CardBox />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
