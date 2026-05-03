import BoxMessage from "../../components/inbox/BoxMessage";

const Inbox = () => {
  console.log("✅ Inbox page rendered");
  return (
    <div className="w-full">
      <BoxMessage folder="inbox" />
    </div>
  );
};

export default Inbox;
