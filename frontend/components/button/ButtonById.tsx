import { Button } from "../ui/button";

const ButtonById = ({ children, id }: { children: string; id: number }) => {
  return <Button>{children}</Button>;
};

export default ButtonById;
