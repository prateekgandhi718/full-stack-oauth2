import { Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { getAllDealsList } from "./api/getAllDeals";
import { GetAllDealsResponse } from "./api/types/deals";

const SelectDealPage = () => {
  const [response, setResponse] = useState<GetAllDealsResponse | undefined>(
    undefined
  );
  const handleClick = () => {
    const hitDealsApi = async () => {
      try {
        const responseFromApi = await getAllDealsList();
        setResponse(responseFromApi);
      } catch (err: any) {
        setResponse(err);
      }
    };
    hitDealsApi();
  };
  return (
    <>
      <Typography>SelectDealPage</Typography>
      <Button onClick={handleClick}>Click to hit API</Button>
      {response && (
        <Typography>
          Here is the response - {response.providedName}{" "}
          and the message is {response.message}
        </Typography>
      )}
    </>
  );
};

export default SelectDealPage;
