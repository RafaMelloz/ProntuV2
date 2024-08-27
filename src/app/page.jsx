import Image from "next/image";
import ThemeSwitch from "../components/themeSwitch";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ThemeSwitch/>
    </main>
  );
}
