import BoxMessage from "../components/inbox/BoxMessage";
import CardBox from "../components/inbox/CardBox";

const Inbox = () => {
  return (
    <div className="mx-7">
      <p className="text-2xl  my-8">Inbox</p>
      <div className="flex gap-8">
        <div>
          <CardBox />
        </div>

        <div className="w-full">
          <BoxMessage />
        </div>
      </div>
    </div>
  );
};

export default Inbox;
