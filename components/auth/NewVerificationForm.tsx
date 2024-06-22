"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import CardWrapper from "./CardWrapper";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/newVerification";
import FormSuccess from "../FormSuccess";
import FormError from "../FormError";

type Props = {};

const NewVerificationForm = (props: Props) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log("rendering ...");
    setIsMounted(true);

    return () => {
      console.log("destroying...");
      setIsMounted(false);
    };
  }, []);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (token) {
      newVerification(token)
        .then((data) => {
          setSuccess(data.success);
          setError(data.error);
        })
        .catch((error) => {
          console.log("error", error);
          setError("Something went wrong!");
        });
    } else {
      setError("Missing token");
      setSuccess(undefined);
    }
  }, [error, success, token]);

  useEffect(() => {
    if (isMounted) {
      onSubmit();
    }
  }, [onSubmit, isMounted]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}

        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
