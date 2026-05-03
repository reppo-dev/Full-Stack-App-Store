import React from "react";
import BoxMessage from "../../components/inbox/BoxMessage";

const Bin = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="trash" />
    </div>
  );
};

export default Bin;
