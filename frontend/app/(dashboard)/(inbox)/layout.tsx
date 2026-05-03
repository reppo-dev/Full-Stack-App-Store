import CardBox from "../components/inbox/CardBox";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      {" "}
      <div className="mx-7">
        <p className="text-2xl  my-8">Inbox</p>
        <div className="flex gap-8">
          <div>
            <CardBox />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
