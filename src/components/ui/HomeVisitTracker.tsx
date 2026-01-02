"use client";

import { useEffect } from "react";
import { useMenu } from "@/context/MenuContext";

export const HomeVisitTracker = () => {
    const { setHasVisitedHome } = useMenu();

    useEffect(() => {
        setHasVisitedHome(true);
    }, [setHasVisitedHome]);

    return null;
};
