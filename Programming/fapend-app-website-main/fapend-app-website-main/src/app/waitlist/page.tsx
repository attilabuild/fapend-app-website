"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function WaitlistPage() {
  useEffect(() => {
    // Load GetWaitlist CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css";
    document.head.appendChild(link);

    // Load GetWaitlist script dynamically after component mounts
    const script = document.createElement("script");
    script.src = "https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Clean up script and link when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-black">
        <Navbar/>
      <div className="max-w-2xl w-full mx-auto">  
        {/* GetWaitlist Widget */}
        <div 
          id="getWaitlistContainer" 
          data-waitlist_id="27139" 
          data-widget_type="WIDGET_1"
          className="mx-auto"
        />
      </div>
    </main>
  );
} 