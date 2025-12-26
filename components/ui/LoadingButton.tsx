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
  onClick,
  ...props
}: Props) => {
  const lastChild =
    Children.count(children) === 1
      ? children
      : Children.toArray(children).findLast((el) => el);

  return (
    <Button
      className="transition-all duration-200"
      disabled={isLoading}
      onClick={isLoading ? undefined : onClick}
      {...props}
    >
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
