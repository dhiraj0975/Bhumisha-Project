// src/AppRoute.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Home from "../Pages/Home";
import ContactUs from "../Pages/ContactUs";
import About from "../Pages/About";
// import BlogSection from "../components/Blog/BlogSection";
import BlogCards from "../components/Blog/BlogSection";
import Portfolio from "../Pages/Portfolio";
import BasicForex from "../Pages/BasicForex";
import PremiumForex from "../Pages/PremiumForex";
import GoldBasicPage from "../Pages/GoldBasic";
import Careers from "../Pages/Careers";
import GoldPremiumPage from "../Pages/GoldPremiumPage";
import IndicesBasicPage from "../Pages/IndicesBasicPage";

export default function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      <Route path="/contact" element={<ContactUs />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/basic" element={< BasicForex/>} />
      <Route path="/premium" element={< PremiumForex/>} />
      <Route path="/gold-basic" element={< GoldBasicPage/>} />
      <Route path="/career" element={< Careers/>} />
      <Route path="/gold-premium" element={< GoldPremiumPage/>} />
      <Route path="/indice-basic" element={< IndicesBasicPage/>} />








      <Route path="/blog" element={<BlogCards />} />

    </Routes>
  );
}
