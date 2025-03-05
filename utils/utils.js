import icons from "./icons";
export { icons };
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());
export function useFetcher(url) {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

export const checkInternetConnectivity = async () => {
  try {
    const response = await fetch("https://baysel.alemtilsimat.com/api", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const apiURL = "https://baysel.alemtilsimat.com/api";
