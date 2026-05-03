// app/(dashboard)/inbox/starred/page.tsx
import BoxMessage from "../../components/inbox/BoxMessage";

const Starred = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="starred" />
    </div>
  );
};

export default Starred;
