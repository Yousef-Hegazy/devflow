import { Children } from "react";
import { Button, ButtonProps } from "./button";
import { Spinner } from "./spinner";

type Props = {
  isLoading?: boolean;
  wholeLoading?: boolean;
} & ButtonProps;

const LoadingButton = ({
  isLoading,
  children,
  wholeLoading = false,
  ...props
}: Props) => {
  const lastChild =
    Children.count(children) === 1
      ? children
      : Children.toArray(children).findLast((el) => el);

  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && !wholeLoading ? (
        <>
          <Spinner />
          {lastChild}
        </>
      ) : isLoading && wholeLoading ? (
        <Spinner />
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
