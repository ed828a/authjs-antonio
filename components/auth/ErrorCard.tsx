import React from "react";
import { Card, CardFooter, CardHeader } from "../ui/card";
import Header from "./Header";
import BackButton from "./BackButton";

type Props = {};

const ErrorCard = (props: Props) => {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label="Oops! Something went wrong!" />
      </CardHeader>
      <CardFooter>
        <BackButton label="Back to login" href="/auth/login" />
      </CardFooter>
    </Card>
  );
};

export default ErrorCard;
