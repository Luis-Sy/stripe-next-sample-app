"use client"

import Image from "next/image";

export default function Home() {
    return (
        <>
            <div id="home">
                <h1>Home Page</h1>
                <div id="topBanner" style={{width: "100%"}}>
                    <div style={{ position: "relative", width: "100%", height: "500px"}}>
                        <Image
                            src="/images/banner.jpg"
                            alt="Top Banner Image"
                            fill
                            style={{ objectFit: "cover", objectPosition: "center" }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}