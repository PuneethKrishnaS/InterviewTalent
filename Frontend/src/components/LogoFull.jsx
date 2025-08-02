import Logo from "../assets/Logo";

export default function LogoFull() {
  return (
    <div className="flex gap-2 items-center ">
      <Logo className="w-10 md:w-12" />
      <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text text-2xl md:text-2xl font-bold">
        InterviewTalent
      </span>
    </div>
  );
}
