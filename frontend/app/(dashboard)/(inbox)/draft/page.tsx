import React from "react";
import BoxMessage from "../../components/inbox/BoxMessage";

const Draft = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="draft" />
    </div>
  );
};

export default Draft;
