// app/(dashboard)/inbox/starred/page.tsx
import BoxMessage from "@/features/tickets/components/BoxMessage";

const Starred = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="starred" />
    </div>
  );
};

export default Starred;
