import { Ripple } from "./magicui/ripple";

export const LoadingScreen = () => (
  <div className="container mx-auto px-5 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <Ripple bgColor="#407BFF" numCircles={5} mainCircleSize={120} />
    <div className="container text-accent mx-auto px-5 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-8rem)] rounded-full opacity-70 text-lg md:text-xl font-bold">
      Loading..
    </div>
  </div>
);
