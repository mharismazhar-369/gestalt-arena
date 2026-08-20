"use client";

import Universe from "./Universe";

export default function Hero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617]">

      <Universe />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02061720] to-[#020617]" />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">

        <h1 className="text-7xl font-black tracking-tight text-white drop-shadow-2xl">

          Gestalt Arena

        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-300">

          Connecting Investors and Startups through one intelligent marketplace.

        </p>

      </section>

    </main>
  );
}