import DesktopChat from "@/src/components/desktopchat/desktopchat";
import Mobilechat from "@/src/components/mobilechat/mobilechat";

export default function DesktopChatPage() {
  return (
    <>
      {/* DesktopChat: hidden on small screens, visible on md and up */}
      <div className="h-full md:h-full w-full overflow-hidden hidden md:block ">
        <DesktopChat />
      </div>

      {/* Mobilechat: visible on small screens, hidden on md and up */}
      <div className="block md:hidden">
        <Mobilechat />
      </div>
    </>
  );
}
