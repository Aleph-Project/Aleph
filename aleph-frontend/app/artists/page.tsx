"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ArtistsIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/music-player");
  }, [router]);
  
  return <div>Redirigiendo...</div>;
}
