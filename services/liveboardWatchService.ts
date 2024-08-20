"use client";

import { useEffect, useRef } from "react";
import { BehaviorSubject } from "rxjs";

interface WatchedTests {
  [testId: string]: any[];
}

export const LiveboardWatchService = () => {
  const watchedTests = useRef<WatchedTests>({});
  const changeNotifier = useRef(new BehaviorSubject({}));

  useEffect(() => {
    const savedData = localStorage.getItem("watchedTests");
    if (savedData) {
      try {
        watchedTests.current = JSON.parse(savedData);
      } catch (ex) { }
    }
  }, []);

  const reset = () => {
    watchedTests.current = {};
    localStorage.setItem("watchedTests", JSON.stringify(watchedTests.current));
    changeNotifier.current.next({ action: "reset" });
  };

  const watchTest = (testId: string) => {
    if (!watchedTests.current[testId]) {
      watchedTests.current[testId] = [];
      localStorage.setItem(
        "watchedTests",
        JSON.stringify(watchedTests.current)
      );
      changeNotifier.current.next({ action: "clear", testId: testId });
    }
  };

  const isWatched = (testId: string, studentId: string) => {
    return (
      watchedTests.current[testId] &&
      watchedTests.current[testId].findIndex((s) => s._id === studentId) > -1
    );
  };

  const add = (testId: string, student: any) => {
    if (!watchedTests.current[testId]) {
      watchedTests.current[testId] = [];
    }
    if (!watchedTests.current[testId].find((s) => s._id === student._id)) {
      watchedTests.current[testId].push(student);
      changeNotifier.current.next({ action: "add", student: student });
      localStorage.setItem(
        "watchedTests",
        JSON.stringify(watchedTests.current)
      );
    }
  };

  const remove = (testId: string, student: any) => {
    if (!watchedTests.current[testId]) {
      return;
    }
    const idx = watchedTests.current[testId].findIndex(
      (s) => s._id === student._id
    );
    if (idx > -1) {
      watchedTests.current[testId].splice(idx, 1);
      localStorage.setItem(
        "watchedTests",
        JSON.stringify(watchedTests.current)
      );
      changeNotifier.current.next({ action: "remove", student: student });
    }
  };

  return {
    changeNotifier: changeNotifier.current,
    reset,
    watchTest,
    isWatched,
    add,
    remove,
  };
};
