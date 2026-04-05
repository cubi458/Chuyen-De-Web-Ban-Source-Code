import React from "react";

// reactstrap components
// import {
// } from "reactstrap";

// core components
import IndexNavbar from "components/Navbars/IndexNavbar";
import IndexHeader from "components/Headers/IndexHeader";
import DarkFooter from "components/Footers/DarkFooter";

// sections for this page
import Images from "./index-sections/Images";
import BasicElements from "./index-sections/BasicElements";
import Navbars from "./index-sections/Navbars";
import Tabs from "./index-sections/Tabs";
import Pagination from "./index-sections/Pagination";
import Notifications from "./index-sections/Notifications";
import Typography from "./index-sections/Typography";
import Javascript from "./index-sections/Javascript";
import Carousel from "./index-sections/Carousel";
import NucleoIcons from "./index-sections/NucleoIcons";
import CompleteExamples from "./index-sections/CompleteExamples";
import SignUp from "./index-sections/SignUp";
import Examples from "./index-sections/Examples";
import Download from "./index-sections/Download";

function Index() {
  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  });
  return (
    <>
      <IndexNavbar />
      <div className="wrapper">
        <IndexHeader />
        <div className="main">
          <Images />
          <BasicElements />
          <Navbars />
          <Tabs />
          <Pagination />
          <Notifications />
          <Typography />
          <Javascript />
          <Carousel />
          <NucleoIcons />
          <CompleteExamples />
          <SignUp />
          <Examples />
          <Download />
        </div>
        <DarkFooter />
      </div>
    </>
  );
}

export default Index;
