import React from "react";
import BoxMessage from "@/features/tickets/components/BoxMessage";

const Send = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="sent" />
    </div>
  );
};

export default Send;
