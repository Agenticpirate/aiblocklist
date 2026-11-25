import Link from "next/link";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-12">
        <p className="caption-3 font-mono text-[#ff6600] mb-3">HTTP 404 · NOT FOUND</p>
        <h1 className="heading-3 text-white mb-4">This page does not exist</h1>
        <p className="body-3 text-zinc-400 mb-5 sm:mb-8">
          If you searched for a social media handle, a missing record never implies that an
          account is legitimate or abusive. Use the directory to search indexed records.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="button-md inline-flex items-center gap-2 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727] transition-colors duration-300"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Back to home</span>
          </Link>
          <Link
            href="/directory"
            className="button-md inline-flex items-center gap-2 rounded-lg bg-[#ff6600] px-3 py-2 text-black hover:bg-[#e55c00] transition-colors duration-300"
          >
            <MagnifyingGlass size={16} weight="bold" />
            <span>Search directory</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
