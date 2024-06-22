import React from "react";
import { Card, CardFooter, CardHeader } from "../ui/card";
import Header from "./Header";
import BackButton from "./BackButton";
import CardWrapper from "./CardWrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

type Props = {};

const ErrorCard = (props: Props) => {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive size-6" />
      </div>
    </CardWrapper>
  );
};

export default ErrorCard;
