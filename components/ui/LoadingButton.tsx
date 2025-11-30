import { Button, ButtonProps } from "./button";
import { Spinner } from "./spinner";

type Props = {
  isLoading?: boolean;
} & ButtonProps;

const LoadingButton = ({ isLoading, children, ...props }: Props) => {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? <Spinner /> : children}
    </Button>
  );
};

export default LoadingButton;
