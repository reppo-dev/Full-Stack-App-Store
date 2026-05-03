import React from "react";
import BoxMessage from "../../components/inbox/BoxMessage";

const Important = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="important" />
    </div>
  );
};

export default Important;
