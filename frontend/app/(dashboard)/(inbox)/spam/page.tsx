import React from "react";
import BoxMessage from "../../components/inbox/BoxMessage";

const Spam = () => {
  return (
    <div className="w-full">
      <BoxMessage folder="spam" />
    </div>
  );
};

export default Spam;
