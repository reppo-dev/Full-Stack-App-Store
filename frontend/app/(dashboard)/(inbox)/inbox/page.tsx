import BoxMessage from "@/features/tickets/components/BoxMessage";

const Inbox = () => {
  console.log("✅ Inbox page rendered");
  return (
    <div className="w-full">
      <BoxMessage folder="inbox" />
    </div>
  );
};

export default Inbox;
