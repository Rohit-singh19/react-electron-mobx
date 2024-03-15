// TimerView.tsx
import React, { memo, useCallback, useState, useMemo } from "react";
import { observer, useObserver } from "mobx-react-lite";
import { Timer } from "../utils/Timer";
import { toJS } from "mobx";

const TimerView = observer(() => {
  const myTimer = useMemo(() => new Timer(), []);

  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const allFiles = useMemo(() => {
    let localFiles = toJS(myTimer?.indexingData?.localFiles);

    if (!localFiles || localFiles.length === 0) return [];

    let value = localFiles.flatMap((localFile) => localFile?.data || []);

    return value;
  }, [myTimer.indexingData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        setIsSearching(true);
        if (allFiles.length === 0) return;

        const startTime = performance.now();

        let formData = new FormData(e.currentTarget);

        const searchTerm = formData.get("search");

        if (searchTerm === null || String(searchTerm).trim() === "") return;

        // Filter files based on searchTerm
        const filteredFiles = allFiles.filter((file) => {
          // Check if any property's value in the file matches the searchTerm
          return Object.values(file).some((value) => {
            if (
              typeof value === "string" &&
              value.toLowerCase().includes(String(searchTerm).toLowerCase())
            ) {
              return true;
            }
            return false;
          });
        });

        const endTime = performance.now();
        console.log("searching Time:::", endTime - startTime);

        setResults(filteredFiles);
      } catch (err) {
        console.log("error on searching", err);
      } finally {
        setIsSearching(false);
      }
    },
    [allFiles]
  );

  return useObserver(() => (
    <div className="container">
      {/* <div>Seconds passed: {myTimer.secondsPassed}</div> */}
      {/* <button onClick={incrementTimer}>Increment Timer</button>
      <button onClick={decrementTimer}>Increment Timer</button> */}
      <h1>Electron + React + MobX Test</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Search..." name="search" />
        <button disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>
      <h2>Results</h2>
      <div className="results-container">
        {results.slice(0, 500).map(({ key, location }, i) => (
          <p key={key}>{location}</p>
        ))}
      </div>
    </div>
  ));
});

export default memo(TimerView);
