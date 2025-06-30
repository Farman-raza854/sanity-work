"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// ... (keep your existing variants and other constants)

const Hero = () => {
  const images = [
    "./bg2.png",
    "./shoppingpic.jpg",
    "./shoppinpic2.webp",
    "./shoppingpic3.webp",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState("right");

  const handleNext = useCallback(() => {
    setDirection("right");
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setDirection("left");
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImageIndex, handleNext]);

  // ... (keep the rest of your component code the same)
};

export default Hero;
